# Changelog

Todas as mudanças notáveis deste projeto serão documentadas aqui.

---

## v1.0.0 — 2026-05-06

### ✨ Novas Funcionalidades

- **Triagem Automática por IA**: Motor de NLP baseado em *weighted keyword scoring* que classifica automaticamente chamados em 4 categorias (Rede, Hardware, Sistema, Segurança) e 3 níveis de prioridade (Crítica, Média, Baixa)
- **Dashboard Kanban**: Painel visual com colunas **Novo → Em Atendimento → Resolvido** para gerenciamento completo do ciclo de vida dos chamados
- **Score de Confiança**: Cada classificação automática inclui um percentual de confiança da IA (0-100%), exibido com barra de progresso animada
- **Formulário Inteligente**: Interface para abertura de novos chamados com classificação instantânea pela IA ao submeter
- **Dados de Demonstração**: Endpoint `/seed` que popula o banco com 12 cenários realistas de suporte técnico
- **Métricas em Tempo Real**: Cards de estatísticas agregadas (total, por prioridade) com animações de entrada

### 🎨 Design & Interface

- Design System premium com dark theme e glassmorphism
- Background mesh com gradientes radiais e grid pattern overlay
- Sidebar com tooltips, ícones animados e indicador de aba ativa
- Micro-animações (fade-up, slide-in) com timing cubic-bezier personalizado
- Cards de ticket com faixa lateral color-coded por prioridade
- Scrollbar customizada e sistema de toast notifications
- Tipografia Inter com hierarquia visual refinada

### 🏗️ Arquitetura

- **Backend**: FastAPI + SQLAlchemy ORM + Pydantic v2 + SQLite
- **Frontend**: React 19 + Vite 8 + Tailwind CSS 4 + Lucide Icons
- **DevOps**: Docker Compose com Dockerfiles separados para frontend e backend
- Motor de triagem desacoplado da API (`triage.py`) para facilitar evolução futura (TF-IDF, BERT, LLM)
- API REST completa: `POST`, `GET`, `PATCH`, `DELETE` em `/tickets` + `/stats` + `/seed`

---

*Mantido conforme o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).*
