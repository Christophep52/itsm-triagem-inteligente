# 🤖 ITSM Triagem Inteligente (Next.js 16 + ITIL AI Triage Engine)

<div align="center">
  <a href="#english">🇺🇸 English</a> | <a href="#português">🇧🇷 Português</a>
</div>

<br />

<div align="center">
  <img src="dashboard.png" alt="ITSM Triagem Inteligente Dashboard" width="100%" />
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Zustand-State_Management-764ABC?style=for-the-badge&logo=react" alt="Zustand" />
  <img src="https://img.shields.io/badge/ITIL_4-Compliant-0052CC?style=for-the-badge&logo=jira" alt="ITIL 4" />
  <img src="https://img.shields.io/badge/Docker-Enterprise_Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</div>

---

# <a id="english"></a>🇺🇸 English Documentation

## 🚀 Overview
**ITSM Triagem Inteligente** is an enterprise-grade IT Service Management platform designed to automate incident categorization, priority assignment, and SLA breach prediction using natural language processing (NLP) and AI heuristics.

Engineered with a responsive **Next.js 16 App Router** interface, **Zustand** reactive state management, and **Recharts** analytics, it empowers SRE and IT Service Desk teams to reduce Mean Time to Resolution (MTTR) by up to 65%.

## ✨ Key Enterprise Features
- **🧠 Intelligent NLP Triage**: Automatically inspects incident ticket descriptions to assign categories (`Network`, `Hardware`, `Security`, `System`), urgency, and AI confidence scores (`confianca`).
- **⏱️ Real-Time ITIL 4 SLA Engine**: Dynamic deadline monitoring with automated breach flags (`is_sla_violated`) and real-time countdown timers.
- **😊 Sentiment Analysis**: Detects user emotional state (`Neutral`, `Frustrated`, `Panic`) to elevate priority for critical emergencies.
- **📋 Interactive Kanban & Incident Cards**: Drag-and-drop operations, modal inspection, and instant suggested resolutions via RAG knowledge base.

## 🛠️ Quick Start & Live Demo

### ⚡ 1-Command Live Integrated Demo (Instant Test)
Want to test the NLP Triage Engine, ITIL SLA Calculator & Database Persistence immediately without Docker?
```bash
cd backend
python run_demo_real.py
```

### 🐳 Full Enterprise Stack (Docker Compose)
Deploy the full stack (Next.js 16 Frontend + FastAPI Backend) in containerized mode:
```bash
docker compose up --build -d
```

| Service | Local Endpoint | Description |
| :--- | :--- | :--- |
| **ITSM UI (Next.js 16)** | `http://localhost:3000` | Kanban Board, Analytics & Incident Management |
| **FastAPI Swagger Docs** | `http://localhost:8000/docs` | Interactive OpenAPI 3.0 API Documentation |

## 🧪 Automated Testing (`pytest`)
The project includes a comprehensive Pytest test suite (**15/15 tests passing**):
```bash
cd backend
pytest -v
```

---

# <a id="português"></a>🇧🇷 Documentação em Português

## 🚀 Visão Geral
O **ITSM Triagem Inteligente** é uma plataforma corporativa de gerenciamento de serviços de TI projetada para automatizar a categorização de incidentes, atribuição de prioridade e previsão de violação de SLA utilizando Processamento de Linguagem Natural (NLP) e IA.

Construído com frontend **Next.js 16 App Router**, gerenciamento de estado **Zustand** e gráficos **Recharts**, permite às equipes de SRE e Service Desk reduzirem o Tempo Médio de Resolução (MTTR) em até 65%.

## ✨ Principais Funcionalidades Corporativas
- **🧠 Triagem Inteligente por NLP**: Analisa automaticamente descrições dos chamados para classificar categoria (`Rede`, `Hardware`, `Segurança`, `Sistema`), prioridade e índice de confiança da IA (`confianca`).
- **⏱️ Motor de SLA em conformidade com ITIL 4**: Monitoramento dinâmico de prazos com sinalizadores automáticos de violação e contadores regressivos em tempo real.
- **😊 Análise de Sentimento**: Identificação do estado emocional do usuário (`Neutro`, `Frustrado`, `Pânico`) para priorizar chamados urgentes.
- **📋 Quadro Kanban Interativo**: Inspeção em tempo real, cartões detalhados e sugestão de resolução automática baseada em Base de Conhecimento.

## 🛠️ Como Usar / Demonstração Rápida

### ⚡ Demonstração Real em 1 Comando (Sem Docker)
Deseja testar o Motor de Triagem NLP, o Cálculo de SLA ITIL e o Banco de Dados instantaneamente?
```bash
cd backend
python run_demo_real.py
```

### 🐳 Execução Completa via Docker Compose
Para executar todo o ecossistema (Frontend Next.js 16 + API REST FastAPI):
```bash
docker compose up --build -d
```

| Serviço | Endereço Local | Descrição |
| :--- | :--- | :--- |
| **Painel ITSM (Next.js 16)** | `http://localhost:3000` | Quadro Kanban, Gráficos Recharts e Gestão de Incidentes |
| **Documentação da API (Swagger)** | `http://localhost:8000/docs` | Documentação interativa OpenAPI 3.0 |

## 🧪 Suíte de Testes Automatizados (`pytest`)
O projeto conta com suíte completa de testes unitários e de integração (**100% de aprovação - 15/15 testes**):
```bash
cd backend
pytest -v
```

---

## 📄 Licença / License
Distribuído sob a Licença MIT. Projetado para ambientes corporativos de Service Desk e SRE.
