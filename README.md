<div align="center">

# ⚡ ITSM Triagem Inteligente

**Sistema de Gerenciamento de Serviços de TI com triagem automática de chamados por IA**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

![Dashboard Preview](dashboard.png)

## Sobre o Projeto

MVP funcional de **ITSM** (IT Service Management) que automatiza a classificação de chamados técnicos. Em ambientes corporativos, equipes de suporte perdem tempo triando manualmente — este sistema resolve esse gargalo com um **motor de IA baseado em weighted keyword scoring**.

### Fluxo do Sistema

1. **Recebe** a descrição textual de um problema técnico
2. **Classifica automaticamente** Categoria (Rede, Hardware, Sistema, Segurança) e Prioridade (Crítica, Média, Baixa)
3. **Calcula um score de confiança** da classificação (0-100%)
4. **Persiste** no banco de dados e **exibe** em um painel Kanban em tempo real

---

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| 🤖 **Triagem Automática** | Motor de NLP com weighted keyword scoring — 4 categorias, 3 prioridades |
| 📊 **Dashboard Kanban** | Colunas Novo → Em Atendimento → Resolvido com drag-like flow |
| 🎯 **Score de Confiança** | Barra de progresso com percentual de certeza da IA por ticket |
| 📈 **Métricas com Trends** | Cards com indicadores de tendência (+/-%) em tempo real |
| 🔍 **Busca em Tempo Real** | Filtro instantâneo por descrição, solicitante ou categoria |
| 📋 **Log de Atividade** | Timeline lateral com histórico de ações do sistema |
| 🎲 **Dados de Demo** | Seed com 12 cenários realistas de suporte corporativo |
| 🐳 **Containerizado** | Docker Compose para deploy com um único comando |

---

## Motor de Triagem — Arquitetura Desacoplada

O motor (`backend/triage.py`) foi **intencionalmente desacoplado** para facilitar evolução:

```python
resultado = triagem_automatica("O roteador caiu")
# → ResultadoTriagem(categoria="Rede", prioridade="Crítica", confianca=0.92)

# Substituível por ML/LLM sem alterar a API:
# 1. TF-IDF + Random Forest (scikit-learn)
# 2. BERT fine-tuned (transformers)
# 3. LLM API call (OpenAI/Gemini)
```

---

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/tickets` | Cria ticket com triagem automática |
| `GET` | `/tickets` | Lista todos os tickets |
| `PATCH` | `/tickets/{id}` | Atualiza status/prioridade/categoria |
| `DELETE` | `/tickets/{id}` | Remove um ticket |
| `GET` | `/stats` | Métricas agregadas do dashboard |
| `POST` | `/seed` | Popula banco com dados de demonstração |

Swagger UI: `http://localhost:8000/docs`

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Python 3.11 · FastAPI · SQLAlchemy ORM · Pydantic v2 · SQLite |
| **Frontend** | React 19 · Vite 8 · Tailwind CSS 4 · Lucide React · Axios |
| **DevOps** | Docker · Docker Compose · Git |

---

## Como Executar

### Docker (recomendado)
```bash
git clone https://github.com/Christophep52/itsm-triagem-inteligente.git
cd itsm-triagem-inteligente
docker-compose up --build
```

### Local
```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev
```

**Frontend:** http://localhost:5173 · **API Docs:** http://localhost:8000/docs
