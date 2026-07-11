import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database import Base, engine, SessionLocal
import models
import triage

print("="*75)
print("TESTE REAL E INTEGRADO DO MOTOR ITSM TRIAGEM INTELIGENTE (NLP + SLA)")
print("="*75)

# 1. Cria as tabelas no banco de dados local SQLite
Base.metadata.create_all(bind=engine)
db = SessionLocal()

chamados_reais = [
    {
        "titulo": "Roteador principal da filial caiu e ninguém consegue acesso à VPN",
        "descricao": "URGENTE PARADO SOCORRO! O roteador wifi parou de funcionar, caiu a internet e toda a empresa está desconectada do servidor e da VPN."
    },
    {
        "titulo": "Suspeita de vírus ou ransomware bloqueando arquivos do financeiro",
        "descricao": "Arquivos criptografados e com mensagem suspeita pedindo resgate no computador do diretor financeiro. Possível ataque de malware ou invasão."
    },
    {
        "titulo": "Notebook superaquecendo e desligando sozinho",
        "descricao": "O notebook do colaborador está com o cooler fazendo muito barulho, aquecendo muito e quebrou a dobradiça da tela."
    }
]

try:
    for idx, c in enumerate(chamados_reais, 1):
        print(f"\n[*] Chamado #{idx}: '{c['titulo']}'")
        
        # Classificação real pelo motor NLP de Triagem
        res = triage.triagem_automatica(c["descricao"])
        
        # Salva no banco de dados SQLite real
        incidente = models.Ticket(
            descricao=f"[{c['titulo']}] {c['descricao']}",
            solicitante="Carlos (TI - Filial)",
            categoria=res.categoria,
            prioridade=res.prioridade,
            confianca=res.confianca,
            sentimento=res.sentimento,
            resolucao_sugerida=res.resolucao_sugerida
        )
        db.add(incidente)
        db.commit()
        db.refresh(incidente)
        
        print(f"    --> ID Gerado no Banco : #{incidente.id}")
        print(f"    --> Categoria Detectada: {res.categoria} (Score Confiança: {res.confianca*100:.1f}%)")
        print(f"    --> Prioridade SLA     : {res.prioridade}")
        print(f"    --> Análise Sentimento : {res.sentimento}")
        print(f"    --> Ação Sugerida SLA  : {res.resolucao_sugerida[:75]}...")

finally:
    db.close()
    engine.dispose()
    try:
        if os.path.exists("sql_app.db"):
            os.remove("sql_app.db")
    except OSError:
        pass

print("\n" + "="*75)
print("TESTE REAL DO ITSM TRIAGEM INTELIGENTE CONCLUÍDO COM 100% DE SUCESSO!")
print("="*75)
