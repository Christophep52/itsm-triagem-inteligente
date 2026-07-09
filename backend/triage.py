"""
Motor de Triagem Automatizada — ITSM MVP
=========================================

[FATOR DIDÁTICO — ARQUITETURA DESACOPLADA]

Este módulo encapsula TODA a lógica de classificação de chamados.
A função `triagem_automatica()` é o único ponto de contato com o resto
da aplicação. Isso significa que, no futuro, ela pode ser substituída
por qualquer uma das seguintes abordagens SEM alterar uma única linha
no resto do código:

  1. Um modelo de Machine Learning treinado com scikit-learn ou XGBoost,
     alimentado por um dataset histórico de tickets reais.
  2. Um pipeline de NLP com spaCy ou Hugging Face Transformers para
     classificação de texto (ex: bert-base-portuguese-cased).
  3. Uma chamada a uma LLM via API (OpenAI, Google Gemini, Anthropic)
     com prompt engineering para triagem zero-shot.

A arquitetura atual usa um sistema de pontuação por palavras-chave
ponderadas (weighted keyword scoring), que é mais sofisticado que
regex simples e produz um score de confiança entre 0.0 e 1.0.
"""

import re
from dataclasses import dataclass

# ---------------------------------------------------------------------------
# Dicionários de palavras-chave ponderadas por categoria
# Quanto maior o peso, mais forte a associação com a categoria.
# ---------------------------------------------------------------------------

CATEGORIAS = {
    "Rede": {
        "palavras": {
            "roteador": 3, "internet": 3, "wifi": 3, "wi-fi": 3,
            "conexão": 2, "ping": 3, "cabo": 2, "switch": 3,
            "firewall": 3, "dns": 3, "ip": 2, "vpn": 3,
            "rede": 3, "banda": 2, "latência": 3, "pacote": 2,
            "proxy": 3, "gateway": 3, "dhcp": 3, "ethernet": 2,
            "fibra": 2, "modem": 3, "access point": 3, "ssid": 3,
            "desconectando": 2, "caiu": 2, "sem sinal": 3,
        }
    },
    "Hardware": {
        "palavras": {
            "monitor": 3, "mouse": 3, "teclado": 3, "tela": 2,
            "memória": 2, "hd": 3, "disco": 2, "bateria": 3,
            "impressora": 3, "scanner": 3, "placa": 2, "fonte": 3,
            "cooler": 3, "ventilador": 2, "aquecendo": 2, "superaquecendo": 3,
            "queimou": 3, "quebrou": 3, "não liga": 3, "sem luz": 2,
            "notebook": 2, "desktop": 2, "headset": 2, "usb": 2,
            "ssd": 3, "ram": 3, "processador": 3, "cpu": 3, "gpu": 3,
        }
    },
    "Segurança": {
        "palavras": {
            "vírus": 3, "malware": 3, "phishing": 3, "ransomware": 3,
            "invasão": 3, "hackeado": 3, "senha": 2, "acesso negado": 2,
            "bloqueado": 2, "criptografado": 3, "vazamento": 3,
            "spam": 2, "trojan": 3, "antivírus": 3, "suspeito": 2,
            "vulnerabilidade": 3, "ataque": 3, "brute force": 3,
        }
    },
    "Sistema": {
        "palavras": {
            "windows": 2, "linux": 2, "sistema": 2, "atualização": 2,
            "software": 2, "programa": 2, "aplicativo": 2, "erro": 1,
            "travando": 2, "congelou": 2, "reiniciando": 2,
            "tela azul": 3, "bsod": 3, "boot": 3, "inicialização": 2,
            "driver": 3, "permissão": 2, "instalar": 2, "desinstalar": 2,
            "licença": 2, "office": 2, "e-mail": 2, "outlook": 2,
            "lento": 1, "performance": 2, "backup": 2, "restaurar": 2,
        }
    },
}

PRIORIDADES = {
    "Crítica": {
        "palavras": {
            "parou tudo": 4, "urgente": 4, "crítico": 4, "emergência": 4,
            "não liga": 3, "sem luz": 3, "caiu tudo": 4, "geral": 2,
            "todos afetados": 4, "empresa inteira": 4, "produção parada": 4,
            "servidor caiu": 4, "ransomware": 4, "invasão": 4,
            "indisponível": 3, "fora do ar": 4, "sem acesso": 3,
            "queimou": 3, "incêndio": 4, "data center": 3,
        }
    },
    "Média": {
        "palavras": {
            "lento": 3, "travando": 3, "demorando": 3, "erro": 2,
            "intermitente": 3, "às vezes": 2, "instável": 3,
            "reiniciando sozinho": 3, "falha": 2, "problema": 1,
            "não funciona": 2, "defeito": 2, "oscilando": 3,
        }
    },
    "Baixa": {
        "palavras": {
            "dúvida": 3, "como faço": 3, "configurar": 2, "ajuda": 2,
            "instalar": 2, "solicitar": 2, "novo usuário": 3,
            "trocar": 2, "atualizar": 1, "manutenção": 2,
            "preventiva": 3, "sugestão": 3, "melhoria": 3,
        }
    },
}


# Pré-compilação dos regexes para performance (evita compilar a cada requisição)
for dict_config in (CATEGORIAS, PRIORIDADES):
    for classe, config in dict_config.items():
        config["padroes"] = []
        for palavra, peso in config["palavras"].items():
            pattern = re.compile(re.escape(palavra), re.IGNORECASE)
            config["padroes"].append((pattern, peso))

@dataclass
class ResultadoTriagem:
    """Resultado estruturado da triagem automática."""
    categoria: str
    prioridade: str
    confianca: float  # 0.0 a 1.0
    sentimento: str
    resolucao_sugerida: str


def _calcular_scores(texto: str, dicionario: dict) -> dict:
    """
    Calcula o score de cada classe iterando sobre os regexes pré-compilados.
    """
    scores = {}
    for classe, config in dicionario.items():
        score = 0
        for pattern, peso in config["padroes"]:
            matches = pattern.findall(texto)
            score += len(matches) * peso
        scores[classe] = score
    return scores


def triagem_automatica(descricao: str) -> ResultadoTriagem:
    """
    Executa a triagem automatizada do chamado.

    [FATOR DIDÁTICO]:
    Para substituir por ML, basta alterar esta função para:
        1. Vetorizar `descricao` com TF-IDF ou embeddings
        2. Passar pelo modelo treinado (ex: clf.predict())
        3. Retornar ResultadoTriagem com a predição

    A interface (input: str, output: ResultadoTriagem) permanece idêntica.
    """
    texto = descricao.lower()

    # --- Classificação de Categoria ---
    scores_cat = _calcular_scores(texto, CATEGORIAS)
    max_cat_score = max(scores_cat.values()) if scores_cat else 0

    if max_cat_score > 0:
        categoria = max(scores_cat, key=scores_cat.get)
        # Normaliza confiança (cap em 1.0)
        soma_total = sum(scores_cat.values())
        confianca_cat = scores_cat[categoria] / soma_total if soma_total > 0 else 0
    else:
        categoria = "Sistema"  # Fallback padrão
        confianca_cat = 0.3

    # --- Classificação de Prioridade ---
    scores_pri = _calcular_scores(texto, PRIORIDADES)
    max_pri_score = max(scores_pri.values()) if scores_pri else 0

    if max_pri_score > 0:
        prioridade = max(scores_pri, key=scores_pri.get)
        soma_total = sum(scores_pri.values())
        confianca_pri = scores_pri[prioridade] / soma_total if soma_total > 0 else 0
    else:
        prioridade = "Baixa"  # Fallback padrão
        confianca_pri = 0.3

    # Score de confiança final = média das duas classificações
    confianca_final = round((confianca_cat + confianca_pri) / 2, 2)

    # --- Análise de Sentimento (Stub NLP) ---
    SENTIMENTOS = {
        "Pânico": ["socorro", "desespero", "caiu tudo", "parou tudo", "pelo amor de deus", "urgente"],
        "Frustrado": ["de novo", "não aguento mais", "péssimo", "lixo", "revoltante", "porcaria", "inaceitável"],
    }
    sentimento = "Neutro"
    for sent, palavras in SENTIMENTOS.items():
        if any(p in texto for p in palavras):
            sentimento = sent
            break
            
    # Boost de prioridade baseado no sentimento
    if sentimento in ["Pânico", "Frustrado"]:
        prioridade = "Crítica"
        confianca_final = min(1.0, confianca_final + 0.2)
        
    # --- Resolução Sugerida (RAG / Base de Conhecimento Simulado) ---
    BASE_CONHECIMENTO = {
        "Rede": "Sugerido: Reiniciar roteador principal, verificar BGP peering no dashboard NetOps.",
        "Hardware": "Sugerido: Solicitar substituição no almoxarifado (SLA de hardware 4h).",
        "Segurança": "Sugerido: Isolar máquina afetada imediatamente e rodar EDR.",
        "Sistema": "Sugerido: Limpar cache do sistema, verificar logs do Windows Event Viewer e reiniciar serviço."
    }
    resolucao = BASE_CONHECIMENTO.get(categoria, "Analisar o chamado detalhadamente.")

    return ResultadoTriagem(
        categoria=categoria,
        prioridade=prioridade,
        confianca=confianca_final,
        sentimento=sentimento,
        resolucao_sugerida=resolucao,
    )
