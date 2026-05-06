"""
ITSM Triagem Inteligente — API Backend
========================================
API REST construída com FastAPI para receber, classificar e gerenciar
chamados técnicos de suporte. A triagem é feita automaticamente pelo
motor de palavras-chave ponderadas (vide triage.py).
"""

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
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
    allow_origins=["*"],
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

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total: int
    novos: int
    em_atendimento: int
    resolvidos: int
    criticos: int
    medios: int
    baixos: int
    por_categoria: dict


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/tickets", response_model=TicketResponse)
def criar_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """Cria um novo ticket e executa triagem automática."""
    resultado = triagem_automatica(ticket.descricao)

    novo_ticket = models.Ticket(
        descricao=ticket.descricao,
        solicitante=ticket.solicitante,
        categoria=resultado.categoria,
        prioridade=resultado.prioridade,
        confianca=resultado.confianca,
        status="Novo",
    )
    db.add(novo_ticket)
    db.commit()
    db.refresh(novo_ticket)
    return novo_ticket


@app.get("/tickets", response_model=List[TicketResponse])
def listar_tickets(db: Session = Depends(get_db)):
    """Lista todos os tickets ordenados por data de criação (mais recente primeiro)."""
    return db.query(models.Ticket).order_by(models.Ticket.criado_em.desc()).all()


@app.patch("/tickets/{ticket_id}", response_model=TicketResponse)
def atualizar_ticket(
    ticket_id: int,
    dados: TicketUpdate,
    db: Session = Depends(get_db),
):
    """Atualiza campos de um ticket existente (status, prioridade, categoria)."""
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


@app.delete("/tickets/{ticket_id}")
def deletar_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Remove um ticket do sistema."""
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    db.delete(ticket)
    db.commit()
    return {"detail": "Ticket removido com sucesso"}


@app.get("/stats", response_model=StatsResponse)
def obter_estatisticas(db: Session = Depends(get_db)):
    """Retorna métricas agregadas do painel de controle."""
    todos = db.query(models.Ticket).all()

    por_categoria = {}
    for t in todos:
        por_categoria[t.categoria] = por_categoria.get(t.categoria, 0) + 1

    return StatsResponse(
        total=len(todos),
        novos=sum(1 for t in todos if t.status == "Novo"),
        em_atendimento=sum(1 for t in todos if t.status == "Atendimento"),
        resolvidos=sum(1 for t in todos if t.status == "Resolvido"),
        criticos=sum(1 for t in todos if t.prioridade == "Crítica"),
        medios=sum(1 for t in todos if t.prioridade == "Média"),
        baixos=sum(1 for t in todos if t.prioridade == "Baixa"),
        por_categoria=por_categoria,
    )


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
        ticket = models.Ticket(
            descricao=descricao,
            solicitante=solicitante,
            categoria=resultado.categoria,
            prioridade=resultado.prioridade,
            confianca=resultado.confianca,
            status="Novo",
        )
        db.add(ticket)
        tickets_criados.append(descricao[:50])

    db.commit()
    return {"detail": f"{len(tickets_criados)} chamados de demonstração criados"}
