from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from database import Base
import datetime


class Ticket(Base):
    """
    Modelo do Ticket de suporte.
    Cada campo foi projetado pensando na escalabilidade para um ITSM real.
    """

    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(Text, nullable=False)
    solicitante = Column(String, default="Usuário Anônimo")
    categoria = Column(String, index=True)  # Rede, Hardware, Sistema, Segurança
    prioridade = Column(String, index=True)  # Baixa, Média, Crítica
    status = Column(String, default="Novo", index=True)  # Novo, Atendimento, Resolvido
    confianca = Column(Float, default=0.0)  # Score de confiança da triagem (0-1)
    sentimento = Column(
        String, default="Neutro", index=True
    )  # Neutro, Frustrado, Pânico
    resolucao_sugerida = Column(
        Text, nullable=True
    )  # Sugestão via RAG/Base de Conhecimento
    criado_em = Column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )
    atualizado_em = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
    sla_deadline = Column(DateTime, nullable=True)
    is_sla_violated = Column(Boolean, default=False)
    assigned_to = Column(String, nullable=True)
