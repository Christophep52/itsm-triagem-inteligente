"""
ITSM Triagem Inteligente — API Backend
========================================
API REST construída com FastAPI para receber, classificar e gerenciar
chamados técnicos de suporte. A triagem é feita automaticamente pelo
motor de palavras-chave ponderadas (vide triage.py).
"""

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine, get_db
from triage import triagem_automatica

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ITSM Triagem Inteligente",
    description="API de triagem automática de chamados técnicos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*", # Modo desenvolvimento/showcase habilitado
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas Pydantic
# ---------------------------------------------------------------------------

class TicketCreate(BaseModel):
    descricao: str
    solicitante: Optional[str] = "Usuário Anônimo"


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    prioridade: Optional[str] = None
    categoria: Optional[str] = None


class TicketResponse(BaseModel):
    id: int
    descricao: str
    solicitante: str
    categoria: str
    prioridade: str
    status: str
    confianca: float
    sentimento: str
    resolucao_sugerida: Optional[str] = None
    sla_deadline: Optional[datetime] = None
    is_sla_violated: bool = False
    assigned_to: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StatsResponse(BaseModel):
    total: int
    novos: int
    em_atendimento: int
    resolvidos: int
    criticos: int
    medios: int
    baixos: int
    por_categoria: dict
    sla_breached: int = 0
    sla_on_time: int = 0


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/tickets", response_model=TicketResponse)
def criar_ticket(ticket: TicketCreate, db: Session = Depends(get_db)) -> models.Ticket:
    """
    Cria um novo ticket no sistema e executa a triagem automática para definir
    sua prioridade, categoria e sentimento iniciais, com base na descrição.
    """
    try:
        resultado = triagem_automatica(ticket.descricao)

        now = datetime.now(timezone.utc)
        if resultado.prioridade == "Crítica":
            sla_hours = 4
        elif resultado.prioridade == "Média":
            sla_hours = 24
        else:
            sla_hours = 48
        sla_deadline = now + timedelta(hours=sla_hours)

        AGENTS = ["Agent Smith", "Agent Neo", "Agent Trinity"]
        total_tickets = db.query(models.Ticket).count()
        assigned_to_agent = AGENTS[total_tickets % len(AGENTS)]

        novo_ticket = models.Ticket(
            descricao=ticket.descricao,
            solicitante=ticket.solicitante,
            categoria=resultado.categoria,
            prioridade=resultado.prioridade,
            confianca=resultado.confianca,
            sentimento=resultado.sentimento,
            resolucao_sugerida=resultado.resolucao_sugerida,
            status="Novo",
            sla_deadline=sla_deadline,
            is_sla_violated=False,
            assigned_to=assigned_to_agent
        )
        db.add(novo_ticket)
        db.commit()
        db.refresh(novo_ticket)
        return novo_ticket
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar o ticket: {str(e)}")


@app.get("/tickets", response_model=List[TicketResponse])
def listar_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[models.Ticket]:
    """
    Lista os tickets cadastrados no sistema, suportando paginação via skip e limit.
    Retorna os registros em ordem decrescente de criação.
    """
    try:
        tickets = db.query(models.Ticket).order_by(models.Ticket.criado_em.desc()).offset(skip).limit(limit).all()
        
        now = datetime.now(timezone.utc)
        dirty = False
        for t in tickets:
            if not t.is_sla_violated and t.sla_deadline and t.status != "Resolvido":
                deadline = t.sla_deadline.replace(tzinfo=timezone.utc) if t.sla_deadline.tzinfo is None else t.sla_deadline
                if now > deadline:
                    t.is_sla_violated = True
                    dirty = True
        if dirty:
            db.commit()
            
        return tickets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar tickets: {str(e)}")


@app.patch("/tickets/{ticket_id}", response_model=TicketResponse)
def atualizar_ticket(
    ticket_id: int,
    dados: TicketUpdate,
    db: Session = Depends(get_db),
) -> models.Ticket:
    """
    Atualiza os campos de um ticket específico (status, prioridade, categoria).
    Retorna 404 caso o ticket não seja encontrado.
    """
    try:
        ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket não encontrado")

        if dados.status is not None:
            ticket.status = dados.status
        if dados.prioridade is not None:
            ticket.prioridade = dados.prioridade
        if dados.categoria is not None:
            ticket.categoria = dados.categoria

        db.commit()
        db.refresh(ticket)
        return ticket
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar o ticket: {str(e)}")


@app.delete("/tickets/{ticket_id}")
def deletar_ticket(ticket_id: int, db: Session = Depends(get_db)) -> dict:
    """
    Remove permanentemente um ticket do sistema pelo seu ID.
    """
    try:
        ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket não encontrado")
        db.delete(ticket)
        db.commit()
        return {"detail": "Ticket removido com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir ticket: {str(e)}")


@app.put("/tickets/bulk-resolve")
@app.put("/api/tickets/bulk-resolve")
def bulk_resolve_tickets(db: Session = Depends(get_db)) -> dict:
    """
    Altera o status de todos os tickets em 'Atendimento' para 'Resolvido'.
    """
    try:
        tickets = db.query(models.Ticket).filter(models.Ticket.status == "Atendimento").all()
        for t in tickets:
            t.status = "Resolvido"
        db.commit()
        return {"detail": f"{len(tickets)} chamados resolvidos"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao resolver tickets: {str(e)}")


@app.get("/stats", response_model=StatsResponse)
@app.get("/api/stats", response_model=StatsResponse)
def obter_estatisticas(db: Session = Depends(get_db)) -> StatsResponse:
    """
    Retorna métricas agregadas dos tickets no sistema utilizando funções SQL
    para o painel de controle (dashboard).
    """
    try:
        total = db.query(func.count(models.Ticket.id)).scalar() or 0
        
        status_counts = dict(db.query(models.Ticket.status, func.count(models.Ticket.id)).group_by(models.Ticket.status).all())
        novos = status_counts.get("Novo", 0)
        em_atendimento = status_counts.get("Atendimento", 0)
        resolvidos = status_counts.get("Resolvido", 0)
        
        pri_counts = dict(db.query(models.Ticket.prioridade, func.count(models.Ticket.id)).group_by(models.Ticket.prioridade).all())
        criticos = pri_counts.get("Crítica", 0)
        medios = pri_counts.get("Média", 0)
        baixos = pri_counts.get("Baixa", 0)
        
        por_categoria = dict(db.query(models.Ticket.categoria, func.count(models.Ticket.id)).group_by(models.Ticket.categoria).all())

        sla_counts = dict(db.query(models.Ticket.is_sla_violated, func.count(models.Ticket.id)).group_by(models.Ticket.is_sla_violated).all())
        sla_breached = sla_counts.get(True, 0)
        sla_on_time = sla_counts.get(False, 0)

        return StatsResponse(
            total=total,
            novos=novos,
            em_atendimento=em_atendimento,
            resolvidos=resolvidos,
            criticos=criticos,
            medios=medios,
            baixos=baixos,
            por_categoria=por_categoria,
            sla_breached=sla_breached,
            sla_on_time=sla_on_time,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao computar estatísticas: {str(e)}")


@app.post("/seed")
def popular_dados_demo(db: Session = Depends(get_db)):
    """Popula o banco com dados de demonstração para showcase do dashboard."""
    chamados_demo = [
        ("O roteador principal do 3º andar está sem luz de internet, todos os colaboradores estão sem conexão", "Carlos Silva"),
        ("Meu mouse parou de funcionar, já troquei a pilha e nada", "Ana Souza"),
        ("O sistema do RH está travando quando tento gerar folha de pagamento", "Roberto Lima"),
        ("Recebi um e-mail suspeito pedindo para clicar em um link e atualizar minha senha", "Juliana Costa"),
        ("A impressora da sala de reuniões não imprime, aparece erro de spooler", "Marcos Oliveira"),
        ("Internet caiu em toda a empresa, ninguém consegue acessar nada, produção parada", "Fernanda Santos"),
        ("Preciso instalar o novo software de videoconferência no meu notebook", "Lucas Pereira"),
        ("O servidor de e-mail está fora do ar desde ontem, urgente", "Patrícia Almeida"),
        ("Minha tela azul aparece toda vez que inicio o computador, BSOD com erro de driver", "Diego Rocha"),
        ("O wifi da recepção está muito lento, clientes reclamando da conexão", "Camila Ferreira"),
        ("Meu notebook está superaquecendo e desligando sozinho", "Thiago Nascimento"),
        ("Não consigo acessar a VPN para trabalhar remoto, dá erro de autenticação", "Beatriz Mendes"),
    ]

    tickets_criados = []
    for descricao, solicitante in chamados_demo:
        resultado = triagem_automatica(descricao)
        
        now = datetime.now(timezone.utc)
        if resultado.prioridade == "Crítica":
            sla_hours = 4
        elif resultado.prioridade == "Média":
            sla_hours = 24
        else:
            sla_hours = 48
            
        # Simula SLA violado em 1 dos tickets críticos para demonstração
        if len(tickets_criados) == 0 and resultado.prioridade == "Crítica":
            sla_deadline = now - timedelta(hours=1)
        else:
            sla_deadline = now + timedelta(hours=sla_hours)

        AGENTS = ["Agent Smith", "Agent Neo", "Agent Trinity"]

        ticket = models.Ticket(
            descricao=descricao,
            solicitante=solicitante,
            categoria=resultado.categoria,
            prioridade=resultado.prioridade,
            confianca=resultado.confianca,
            sentimento=resultado.sentimento,
            resolucao_sugerida=resultado.resolucao_sugerida,
            status="Novo",
            sla_deadline=sla_deadline,
            is_sla_violated=False,
            assigned_to=AGENTS[len(tickets_criados) % len(AGENTS)]
        )
        db.add(ticket)
        tickets_criados.append(descricao[:50])

    db.commit()
    return {"detail": f"{len(tickets_criados)} chamados de demonstração criados"}
