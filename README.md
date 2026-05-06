<div align="center">

# ⚡ ITSM Triagem Inteligente

**Sistema de Gerenciamento de Serviços de TI com triagem automática de chamados por IA**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)

</div>

---

![Dashboard Preview](dashboard.png)

## Sobre o Projeto

Este projeto é um **MVP funcional de ITSM** (IT Service Management) que resolve um problema real de equipes de suporte técnico: **a classificação manual de chamados**.

Em ambientes corporativos, equipes de **Nível 1 e Nível 2** perdem tempo significativo triando chamados manualmente — identificando se um problema é de rede, hardware ou sistema, e qual a severidade. Esse gargalo aumenta o **tempo médio de resolução (MTTR)** e prejudica SLAs.

### O que este sistema faz:

1. **Recebe** a descrição textual de um problema técnico
2. **Classifica automaticamente** a **Categoria** (Rede, Hardware, Sistema, Segurança) e a **Prioridade** (Crítica, Média, Baixa)
3. **Calcula um score de confiança** da classificação (0-100%)
4. **Persiste** o ticket no banco de dados
5. **Exibe** tudo em um painel Kanban em tempo real

---

## Arquitetura

```
┌─────────────────┐     HTTP/REST      ┌──────────────────────┐
│   Frontend      │ ◄────────────────► │   Backend (API)      │
│   React + Vite  │   POST /tickets    │   FastAPI + Uvicorn  │
│   Tailwind CSS  │   GET  /tickets    │                      │
│   Lucide Icons  │   PATCH /tickets   │   ┌────────────────┐ │
│                 │   GET  /stats      │   │ Motor de        │ │
│  ┌───────────┐  │                    │   │ Triagem (IA)    │ │
│  │  Kanban   │  │                    │   │ Keyword Scoring │ │
│  │  Board    │  │                    │   └────────┬───────┘ │
│  └───────────┘  │                    │            │         │
│  ┌───────────┐  │                    │   ┌────────▼───────┐ │
│  │  Stats    │  │                    │   │    SQLite DB    │ │
│  │  Cards    │  │                    │   └────────────────┘ │
│  └───────────┘  │                    │                      │
└─────────────────┘                    └──────────────────────┘
```

---

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| 🤖 **Triagem Automática** | Motor de NLP baseado em weighted keyword scoring com 4 categorias e 3 níveis de prioridade |
| 📊 **Dashboard Kanban** | Painel visual com colunas Novo → Em Atendimento → Resolvido |
| 🎯 **Score de Confiança** | Cada classificação inclui um percentual de confiança da IA |
| 🔴🟡🟢 **Priorização Visual** | Cards color-coded por severidade (Crítica/Média/Baixa) |
| ➡️ **Fluxo de Status** | Botões para avançar tickets entre etapas do Kanban |
| 📈 **Métricas em Tempo Real** | Cards de estatísticas agregadas (total, por prioridade) |
| 🎲 **Dados de Demonstração** | Endpoint de seed com 12 cenários realistas de suporte |
| 🐳 **Containerizado** | Docker Compose para deploy com um único comando |

---

## Motor de Triagem — Design para Evolução

O motor de triagem (`backend/triage.py`) foi **intencionalmente desacoplado** da API para facilitar a evolução:

```python
# Atualmente: Weighted Keyword Scoring
resultado = triagem_automatica("O roteador caiu")
# → ResultadoTriagem(categoria="Rede", prioridade="Crítica", confianca=0.92)

# Futuro: Substituir por ML/LLM sem alterar a API
# 1. TF-IDF + Random Forest (scikit-learn)
# 2. BERT fine-tuned (transformers)
# 3. LLM API call (OpenAI/Gemini)
```

A interface `(str) → ResultadoTriagem` permanece a mesma independente da implementação interna.

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

Documentação interativa disponível em `http://localhost:8000/docs` (Swagger UI).

---

## Tecnologias

**Backend:**
- Python 3.11 · FastAPI · SQLAlchemy ORM · Pydantic v2 · SQLite
- Arquitetura modular com separação de responsabilidades

**Frontend:**
- React 19 · Vite 8 · Tailwind CSS 4
- Lucide React (ícones) · Axios (HTTP client)
- Design System custom com glassmorphism e dark theme

**DevOps:**
- Docker · Docker Compose
- Git com commits semânticos

---

## Como Executar

### Com Docker (recomendado)
```bash
git clone https://github.com/Christophep52/itsm-triagem-inteligente.git
cd itsm-triagem-inteligente
docker-compose up --build
```

### Manualmente
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs

---

## Estrutura do Projeto

```
itsm-triagem-inteligente/
├── backend/
│   ├── main.py          # API REST (FastAPI)
│   ├── models.py        # Modelos SQLAlchemy
│   ├── database.py      # Configuração do banco
│   ├── triage.py        # Motor de triagem (IA)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Dashboard principal
│   │   ├── index.css    # Design System
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── dashboard.png
└── README.md
```
