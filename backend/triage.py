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
from typing import Optional

# ---------------------------------------------------------------------------
# Dicionários de palavras-chave ponderadas por categoria
# Quanto maior o peso, mais forte a associação com a categoria.
# ---------------------------------------------------------------------------

CATEGORIAS = {
    "Rede": {
        "palavras": {
            "roteador": 3,
            "internet": 3,
            "wifi": 3,
            "wi-fi": 3,
            "conexão": 2,
            "ping": 3,
            "cabo": 2,
            "switch": 3,
            "firewall": 3,
            "dns": 3,
            "ip": 2,
            "vpn": 3,
            "rede": 3,
            "banda": 2,
            "latência": 3,
            "pacote": 2,
            "proxy": 3,
            "gateway": 3,
            "dhcp": 3,
            "ethernet": 2,
            "fibra": 2,
            "modem": 3,
            "access point": 3,
            "ssid": 3,
            "desconectando": 2,
            "caiu": 2,
            "sem sinal": 3,
        }
    },
    "Hardware": {
        "palavras": {
            "monitor": 3,
            "mouse": 3,
            "teclado": 3,
            "tela": 2,
            "memória": 2,
            "hd": 3,
            "disco": 2,
            "bateria": 3,
            "impressora": 3,
            "scanner": 3,
            "placa": 2,
            "fonte": 3,
            "cooler": 3,
            "ventilador": 2,
            "aquecendo": 2,
            "superaquecendo": 3,
            "queimou": 3,
            "quebrou": 3,
            "não liga": 3,
            "sem luz": 2,
            "notebook": 2,
            "desktop": 2,
            "headset": 2,
            "usb": 2,
            "ssd": 3,
            "ram": 3,
            "processador": 3,
            "cpu": 3,
            "gpu": 3,
        }
    },
    "Segurança": {
        "palavras": {
            "vírus": 3,
            "malware": 3,
            "phishing": 3,
            "ransomware": 3,
            "invasão": 3,
            "hackeado": 3,
            "senha": 2,
            "acesso negado": 2,
            "bloqueado": 2,
            "criptografado": 3,
            "vazamento": 3,
            "spam": 2,
            "trojan": 3,
            "antivírus": 3,
            "suspeito": 2,
            "vulnerabilidade": 3,
            "ataque": 3,
            "brute force": 3,
        }
    },
    "Sistema": {
        "palavras": {
            "windows": 2,
            "linux": 2,
            "sistema": 2,
            "atualização": 2,
            "software": 2,
            "programa": 2,
            "aplicativo": 2,
            "erro": 1,
            "travando": 2,
            "congelou": 2,
            "reiniciando": 2,
            "tela azul": 3,
            "bsod": 3,
            "boot": 3,
            "inicialização": 2,
            "driver": 3,
            "permissão": 2,
            "instalar": 2,
            "desinstalar": 2,
            "licença": 2,
            "office": 2,
            "e-mail": 2,
            "outlook": 2,
            "lento": 1,
            "performance": 2,
            "backup": 2,
            "restaurar": 2,
        }
    },
}

PRIORIDADES = {
    "Crítica": {
        "palavras": {
            "parou tudo": 4,
            "urgente": 4,
            "crítico": 4,
            "emergência": 4,
            "não liga": 3,
            "sem luz": 3,
            "caiu tudo": 4,
            "geral": 2,
            "todos afetados": 4,
            "empresa inteira": 4,
            "produção parada": 4,
            "servidor caiu": 4,
            "ransomware": 4,
            "invasão": 4,
            "indisponível": 3,
            "fora do ar": 4,
            "sem acesso": 3,
            "queimou": 3,
            "incêndio": 4,
            "data center": 3,
        }
    },
    "Média": {
        "palavras": {
            "lento": 3,
            "travando": 3,
            "demorando": 3,
            "erro": 2,
            "intermitente": 3,
            "às vezes": 2,
            "instável": 3,
            "reiniciando sozinho": 3,
            "falha": 2,
            "problema": 1,
            "não funciona": 2,
            "defeito": 2,
            "oscilando": 3,
        }
    },
    "Baixa": {
        "palavras": {
            "dúvida": 3,
            "como faço": 3,
            "configurar": 2,
            "ajuda": 2,
            "instalar": 2,
            "solicitar": 2,
            "novo usuário": 3,
            "trocar": 2,
            "atualizar": 1,
            "manutenção": 2,
            "preventiva": 3,
            "sugestão": 3,
            "melhoria": 3,
        }
    },
}

BASE_CONHECIMENTO = {
    "Rede": "Sugerido: Reiniciar roteador principal, verificar BGP peering no dashboard NetOps.",
    "Hardware": "Sugerido: Solicitar substituição no almoxarifado (SLA de hardware 4h).",
    "Segurança": "Sugerido: Isolar máquina afetada imediatamente e rodar EDR.",
    "Sistema": "Sugerido: Limpar cache do sistema, verificar logs do Windows Event Viewer e reiniciar serviço.",
}

SENTIMENTO_PANICO = [
    "parou tudo",
    "desespero",
    "desesperador",
    "pânico",
    "caos",
    "urgente",
    "emergência",
    "caiu tudo",
    "incêndio",
    "inaceitável",
    "absurdo",
    "empresa inteira",
    "produção parada",
    "invasão",
    "ransomware",
    "hackeado",
]

SENTIMENTO_FRUSTRADO = [
    "frustrado",
    "raiva",
    "ódio",
    "indignado",
    "péssimo",
    "horrível",
    "lixo",
    "incompetência",
    "revolta",
    "não aguento",
    "impossível",
    "demora",
    "atraso",
    "prejuízo",
    "de novo",
    "novamente",
    "trava toda hora",
]


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
    """
    if not descricao or not isinstance(descricao, str) or not descricao.strip():
        return ResultadoTriagem(
            categoria="Sistema",
            prioridade="Baixa",
            confianca=0.3,
            sentimento="Neutro",
            resolucao_sugerida=BASE_CONHECIMENTO["Sistema"],
        )

    descricao_limpa = descricao.strip()

    # 1. Tentativa de classificação via LLM local (Ollama) caso habilitado
    llm_res = _triagem_por_llm_ollama(descricao_limpa)
    if llm_res:
        return llm_res

    # 2. Motor Heurístico Ponderado de NLP
    texto = descricao_limpa.lower()

    # --- Classificação de Categoria ---
    scores_cat = _calcular_scores(texto, CATEGORIAS)
    max_cat_score = max(scores_cat.values()) if scores_cat else 0

    if max_cat_score > 0:
        categoria = max(scores_cat, key=scores_cat.get)
        soma_total = sum(scores_cat.values())
        confianca_cat = scores_cat[categoria] / soma_total if soma_total > 0 else 0.0
    else:
        categoria = "Sistema"
        confianca_cat = 0.3

    # --- Classificação de Prioridade ---
    scores_pri = _calcular_scores(texto, PRIORIDADES)
    max_pri_score = max(scores_pri.values()) if scores_pri else 0

    if max_pri_score > 0:
        prioridade = max(scores_pri, key=scores_pri.get)
        soma_total = sum(scores_pri.values())
        confianca_pri = scores_pri[prioridade] / soma_total if soma_total > 0 else 0.0
    else:
        prioridade = "Baixa"
        confianca_pri = 0.3

    confianca_final = round((confianca_cat + confianca_pri) / 2.0, 2)

    # --- Análise de Sentimento Híbrida (Léxico Português + TextBlob local) ---
    sentimento = "Neutro"

    tem_panico = any(palavra in texto for palavra in SENTIMENTO_PANICO)
    tem_frustracao = any(palavra in texto for palavra in SENTIMENTO_FRUSTRADO)

    polarity = 0.0
    try:
        from textblob import TextBlob

        tb = TextBlob(descricao_limpa)
        polarity = float(tb.sentiment.polarity)
    except Exception:
        polarity = 0.0

    if tem_panico or polarity <= -0.5:
        sentimento = "Pânico"
    elif tem_frustracao or polarity < -0.1:
        sentimento = "Frustrado"

    # Ajuste contextual de prioridade e confiança com base no sentimento
    if sentimento in ["Pânico", "Frustrado"]:
        if prioridade == "Baixa":
            prioridade = "Média"
        if sentimento == "Pânico":
            prioridade = "Crítica"
        confianca_final = min(1.0, round(confianca_final + 0.2, 2))

    resolucao = BASE_CONHECIMENTO.get(categoria, "Analisar o chamado detalhadamente.")

    return ResultadoTriagem(
        categoria=categoria,
        prioridade=prioridade,
        confianca=confianca_final,
        sentimento=sentimento,
        resolucao_sugerida=resolucao,
    )


def _triagem_por_llm_ollama(descricao: str) -> Optional[ResultadoTriagem]:
    """
    Tenta classificar via LLM Local (Ollama) via API HTTP local somente quando explicitamente habilitada.
    Evita bloqueios e timeouts de rede quando o serviço Ollama não estiver rodando.
    """
    import json
    import urllib.request
    import urllib.parse
    import socket
    import os

    ollama_enabled = os.getenv("OLLAMA_ENABLED", "false").lower() in (
        "true",
        "1",
        "yes",
    )
    if not ollama_enabled:
        return None

    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
    model_name = os.getenv("OLLAMA_MODEL", "llama3")

    try:
        parsed = urllib.parse.urlparse(ollama_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 11434
        with socket.create_connection((host, port), timeout=0.15):
            pass
    except Exception:
        return None

    prompt = f"""Você é um especialista de ITSM e suporte técnico ITIL 4.
Analise a seguinte descrição de chamado de suporte e retorne APENAS um JSON válido com os seguintes campos:
- categoria: uma das opções ["Rede", "Hardware", "Segurança", "Sistema"]
- prioridade: uma das opções ["Baixa", "Média", "Crítica"]
- confianca: número float entre 0.0 e 1.0 indicando a certeza da triagem
- sentimento: uma das opções ["Neutro", "Frustrado", "Pânico"]
- resolucao_sugerida: breve plano de ação técnico de 1 frase para o analista resolver

Descrição do chamado: "{descricao}"
JSON:"""

    payload = json.dumps(
        {"model": model_name, "prompt": prompt, "format": "json", "stream": False}
    ).encode("utf-8")

    try:
        req = urllib.request.Request(
            ollama_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            out_json = json.loads(data.get("response", "{}"))

            categoria = out_json.get("categoria", "Sistema")
            if categoria not in ["Rede", "Hardware", "Segurança", "Sistema"]:
                categoria = "Sistema"

            prioridade = out_json.get("prioridade", "Média")
            if prioridade not in ["Baixa", "Média", "Crítica"]:
                prioridade = "Média"

            sentimento = out_json.get("sentimento", "Neutro")
            if sentimento not in ["Neutro", "Frustrado", "Pânico"]:
                sentimento = "Neutro"

            confianca = float(out_json.get("confianca", 0.9))
            confianca = max(0.0, min(1.0, confianca))

            resolucao = out_json.get(
                "resolucao_sugerida",
                BASE_CONHECIMENTO.get(categoria, "Analisar o chamado detalhadamente."),
            )

            return ResultadoTriagem(
                categoria=categoria,
                prioridade=prioridade,
                confianca=confianca,
                sentimento=sentimento,
                resolucao_sugerida=resolucao,
            )
    except Exception:
        return None
