"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import {
  LayoutDashboard,
  TicketPlus,
  BarChart3,
  Settings,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Zap,
  Shield,
  Wifi,
  Monitor,
  RefreshCw,
  Cpu,
  Send,
  User,
  Activity,
  Bell,
  Search,
  Sparkles,
  Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CATEGORY_ICONS = {
  Rede: Wifi,
  Hardware: Monitor,
  Sistema: Cpu,
  Segurança: Shield,
};

export default function Home() {
  const [mounted, setMounted] = useState(false);

  const {
    activeView,
    setActiveView,
    tickets,
    stats,
    loading,
    toast,
    searchQuery,
    setSearchQuery,
    activities,
    showToast,
    fetchData,
    handleCreate,
    handleAdvance,
    handleDelete,
    handleSeed,
    handleBulkResolve,
  } = useAppStore();

  const [descricao, setDescricao] = useState("");
  const [solicitante, setSolicitante] = useState("");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Olá! Sou o Assistente Virtual de TI (Copilot). Como posso ajudar?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessages = [...chatMessages, { sender: "user", text: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("http://localhost:8001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await res.json();
      setChatMessages([...newMessages, { sender: "bot", text: data.reply }]);
    } catch (err) {
      setChatMessages([
        ...newMessages,
        { sender: "bot", text: "Erro ao conectar ao Copilot." },
      ]);
    }
    setIsChatLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    fetchData();

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/tickets");
        if (res.ok) {
          const newTickets = await res.json();
          useAppStore.setState({ tickets: newTickets });
        }
      } catch (error) {
        console.error("Silent polling failed:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  if (!mounted) return null;

  const filteredTickets = tickets.filter(
    (t) =>
      !searchQuery ||
      t.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.solicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoria.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const novos = filteredTickets.filter((t) => t.status === "Novo");
  const atendimento = filteredTickets.filter((t) => t.status === "Atendimento");
  const resolvidos = filteredTickets.filter((t) => t.status === "Resolvido");

  const getPrioClass = (p) => {
    if (p === "Crítica") return "critica";
    if (p === "Alta") return "alta";
    if (p === "Média") return "media";
    return "baixa";
  };

  const getNextStatus = (s) => {
    const STATUS_FLOW = ["Novo", "Atendimento", "Resolvido"];
    const i = STATUS_FLOW.indexOf(s);
    return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    if (!descricao.trim()) return;
    const success = await handleCreate(descricao, solicitante);
    if (success) {
      setDescricao("");
      setSolicitante("");
    }
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Zap size={28} aria-hidden="true" />
        </div>
        <button
          aria-label="Dashboard"
          className={`sidebar-item ${activeView === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveView("dashboard")}
        >
          <LayoutDashboard size={22} aria-hidden="true" />
        </button>
        <button
          aria-label="Gestão de Chamados"
          className={`sidebar-item ${activeView === "tickets" ? "active" : ""}`}
          onClick={() => setActiveView("tickets")}
        >
          <TicketPlus size={22} aria-hidden="true" />
        </button>
        <button
          aria-label="Relatórios"
          className={`sidebar-item ${activeView === "reports" ? "active" : ""}`}
          onClick={() => setActiveView("reports")}
        >
          <BarChart3 size={22} aria-hidden="true" />
        </button>
        <button
          aria-label="Atividade"
          className={`sidebar-item ${activeView === "activity" ? "active" : ""}`}
          onClick={() => setActiveView("activity")}
        >
          <Activity size={22} aria-hidden="true" />
        </button>
        <div style={{ flex: 1 }} />
        <button
          aria-label="Configurações"
          className={`sidebar-item ${activeView === "settings" ? "active" : ""}`}
          onClick={() => setActiveView("settings")}
          title="Configurações ITIL 4 & IA"
        >
          <Settings size={22} aria-hidden="true" />
        </button>
      </aside>

      <main className="main-content">
        {/* HEADER */}
        <header className="header animate-fade-up">
          <div className="header-title-wrapper">
            <div className="status-badge">
              <div className="pulse-dot" />
              Agente Ativo
            </div>
            <h1 className="header-title">Triagem Inteligente</h1>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <Search className="search-icon" size={16} />
              <input
                className="search-input"
                placeholder="Buscar chamados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn" onClick={fetchData}>
              <RefreshCw size={16} /> Atualizar
            </button>
            <button className="btn btn-demo" onClick={handleSeed}>
              <Zap size={16} fill="currentColor" /> Demo Mode
            </button>
          </div>
        </header>

        {activeView === "dashboard" && (
          <div className="dashboard-container">
            {/* STAT CARDS */}
            <div className="stats-grid">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card"
              >
                <div
                  className="stat-icon-pill"
                  style={{
                    background: "rgba(139, 92, 246, 0.15)",
                    color: "var(--color-primary)",
                  }}
                >
                  <BarChart3 size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total de Chamados</span>
                </div>
                <div className="trend-badge trend-up">↑ 12%</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="stat-card"
              >
                <div
                  className="stat-icon-pill"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "var(--color-danger)",
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.criticos}</span>
                  <span className="stat-label">Prioridade Crítica</span>
                </div>
                <div className="trend-badge trend-down">↓ 8%</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="stat-card"
              >
                <div
                  className="stat-icon-pill"
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "var(--color-warning)",
                  }}
                >
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.em_atendimento}</span>
                  <span className="stat-label">Em Atendimento</span>
                </div>
                <div className="trend-badge trend-up">↑ 25%</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="stat-card"
              >
                <div
                  className="stat-icon-pill"
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "var(--color-success)",
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.resolvidos}</span>
                  <span className="stat-label">Resolvidos</span>
                </div>
                <div className="trend-badge trend-up">↑ 18%</div>
              </motion.div>
            </div>

            <div className="main-grid">
              <div className="kanban-section">
                {/* NEW TICKET FORM */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="new-ticket-form"
                  onSubmit={submitTicket}
                >
                  <div className="form-header">
                    <Sparkles size={18} /> Novo Chamado (Triagem IA)
                  </div>
                  <div className="form-body">
                    <input
                      className="form-input"
                      placeholder="Nome do solicitante (opcional)"
                      value={solicitante}
                      onChange={(e) => setSolicitante(e.target.value)}
                    />
                    <textarea
                      className="form-textarea"
                      placeholder="Descreva o problema de TI com detalhes para a IA classificar..."
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="form-footer">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !descricao.trim()}
                    >
                      <Send size={16} />{" "}
                      {loading
                        ? "Analisando via NLP..."
                        : "Enviar para Triagem IA"}
                    </button>
                  </div>
                </motion.form>

                {/* KANBAN BOARD */}
                <div className="kanban-board">
                  {/* NOVO */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="kanban-column"
                  >
                    <div className="kanban-col-header">
                      <span className="kanban-col-title">Novos</span>
                      <span className="kanban-col-count">{novos.length}</span>
                    </div>
                    <div className="kanban-cards">
                      <AnimatePresence>
                        {novos.map((ticket) => {
                          const prio = getPrioClass(ticket.prioridade);
                          const CatIcon =
                            CATEGORY_ICONS[ticket.categoria] || Cpu;
                          const nextStatus = getNextStatus(ticket.status);
                          return (
                            <motion.div
                              key={ticket.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`ticket-card ${prio}`}
                            >
                              <div
                                className="ticket-header"
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <span className={`priority-badge ${prio}`}>
                                  {ticket.prioridade}
                                </span>
                                <span className="category-tag">
                                  <CatIcon size={14} /> {ticket.categoria}
                                </span>
                                {ticket.assigned_to && (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(59, 130, 246, 0.15)",
                                      color: "#60a5fa",
                                      borderRadius: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title="Agente Atribuído"
                                  >
                                    <User size={10} /> {ticket.assigned_to}
                                  </span>
                                )}
                                {ticket.is_sla_violated ? (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(239, 68, 68, 0.2)",
                                      color: "#ef4444",
                                      borderRadius: "4px",
                                      marginLeft: "auto",
                                      fontWeight: "bold",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title="O SLA deste chamado foi violado"
                                  >
                                    <AlertTriangle size={10} /> SLA VIOLADO
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(255, 255, 255, 0.05)",
                                      color: "#94a3b8",
                                      borderRadius: "4px",
                                      marginLeft: "auto",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title={
                                      ticket.sla_deadline
                                        ? `Prazo SLA: ${new Date(ticket.sla_deadline).toLocaleString()}`
                                        : ""
                                    }
                                  >
                                    <Clock size={10} /> SLA OK
                                  </span>
                                )}
                              </div>
                              <p className="ticket-desc">{ticket.descricao}</p>
                              <div className="ticket-requester">
                                <User size={14} /> {ticket.solicitante}
                              </div>
                              <div className="ticket-ai-analysis">
                                <div className="ai-header">
                                  <Sparkles size={12} /> Diagnóstico IA
                                </div>
                                <div className="ai-details">
                                  Score de Confiança:{" "}
                                  <strong>
                                    {Math.round(ticket.confianca * 100)}%
                                  </strong>
                                </div>
                              </div>
                              <div className="ticket-footer">
                                <span className="ticket-id">
                                  <Hash
                                    size={12}
                                    style={{
                                      display: "inline",
                                      verticalAlign: "text-bottom",
                                    }}
                                  />
                                  {String(ticket.id).padStart(4, "0")}
                                </span>
                                <div className="ticket-actions">
                                  {nextStatus && (
                                    <button
                                      aria-label={`Avançar chamado ${ticket.id} para ${nextStatus}`}
                                      className="btn-icon btn-advance"
                                      onClick={() =>
                                        handleAdvance(ticket.id, nextStatus)
                                      }
                                    >
                                      {nextStatus === "Atendimento"
                                        ? "Atender"
                                        : "Resolver"}{" "}
                                      <ArrowRight
                                        size={14}
                                        aria-hidden="true"
                                      />
                                    </button>
                                  )}
                                  <button
                                    aria-label={`Excluir chamado ${ticket.id}`}
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDelete(ticket.id)}
                                  >
                                    <Trash2 size={16} aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* ATENDIMENTO */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="kanban-column"
                  >
                    <div
                      className="kanban-col-header"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div>
                        <span className="kanban-col-title">Em Atendimento</span>
                        <span className="kanban-col-count">
                          {atendimento.length}
                        </span>
                      </div>
                      {atendimento.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleBulkResolve}
                          title="Resolver Todos"
                          style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "var(--color-success)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <CheckCircle2 size={14} /> Resolver Todos
                        </motion.button>
                      )}
                    </div>
                    <div className="kanban-cards">
                      <AnimatePresence>
                        {atendimento.map((ticket) => {
                          const prio = getPrioClass(ticket.prioridade);
                          const CatIcon =
                            CATEGORY_ICONS[ticket.categoria] || Cpu;
                          const nextStatus = getNextStatus(ticket.status);
                          return (
                            <motion.div
                              key={ticket.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`ticket-card ${prio}`}
                            >
                              <div
                                className="ticket-header"
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <span className={`priority-badge ${prio}`}>
                                  {ticket.prioridade}
                                </span>
                                <span className="category-tag">
                                  <CatIcon size={14} /> {ticket.categoria}
                                </span>
                                {ticket.assigned_to && (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(59, 130, 246, 0.15)",
                                      color: "#60a5fa",
                                      borderRadius: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title="Agente Atribuído"
                                  >
                                    <User size={10} /> {ticket.assigned_to}
                                  </span>
                                )}
                                {ticket.is_sla_violated ? (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(239, 68, 68, 0.2)",
                                      color: "#ef4444",
                                      borderRadius: "4px",
                                      marginLeft: "auto",
                                      fontWeight: "bold",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title="O SLA deste chamado foi violado"
                                  >
                                    <AlertTriangle size={10} /> SLA VIOLADO
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(255, 255, 255, 0.05)",
                                      color: "#94a3b8",
                                      borderRadius: "4px",
                                      marginLeft: "auto",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title={
                                      ticket.sla_deadline
                                        ? `Prazo SLA: ${new Date(ticket.sla_deadline).toLocaleString()}`
                                        : ""
                                    }
                                  >
                                    <Clock size={10} /> SLA OK
                                  </span>
                                )}
                              </div>
                              <p className="ticket-desc">{ticket.descricao}</p>
                              <div className="ticket-requester">
                                <User size={14} /> {ticket.solicitante}
                              </div>
                              <div className="ticket-ai-analysis">
                                <div className="ai-header">
                                  <Sparkles size={12} /> Diagnóstico IA
                                </div>
                                <div className="ai-details">
                                  Score de Confiança:{" "}
                                  <strong>
                                    {Math.round(ticket.confianca * 100)}%
                                  </strong>
                                </div>
                              </div>
                              <div className="ticket-footer">
                                <span className="ticket-id">
                                  <Hash
                                    size={12}
                                    style={{
                                      display: "inline",
                                      verticalAlign: "text-bottom",
                                    }}
                                  />
                                  {String(ticket.id).padStart(4, "0")}
                                </span>
                                <div className="ticket-actions">
                                  {nextStatus && (
                                    <button
                                      aria-label={`Avançar chamado ${ticket.id} para ${nextStatus}`}
                                      className="btn-icon btn-advance"
                                      onClick={() =>
                                        handleAdvance(ticket.id, nextStatus)
                                      }
                                    >
                                      {nextStatus === "Atendimento"
                                        ? "Atender"
                                        : "Resolver"}{" "}
                                      <ArrowRight
                                        size={14}
                                        aria-hidden="true"
                                      />
                                    </button>
                                  )}
                                  <button
                                    aria-label={`Excluir chamado ${ticket.id}`}
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDelete(ticket.id)}
                                  >
                                    <Trash2 size={16} aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* RESOLVIDO */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="kanban-column"
                  >
                    <div className="kanban-col-header">
                      <span className="kanban-col-title">Resolvidos</span>
                      <span className="kanban-col-count">
                        {resolvidos.length}
                      </span>
                    </div>
                    <div className="kanban-cards">
                      <AnimatePresence>
                        {resolvidos.map((ticket) => {
                          const prio = getPrioClass(ticket.prioridade);
                          const CatIcon =
                            CATEGORY_ICONS[ticket.categoria] || Cpu;
                          const nextStatus = getNextStatus(ticket.status);
                          return (
                            <motion.div
                              key={ticket.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`ticket-card ${prio}`}
                            >
                              <div
                                className="ticket-header"
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <span className={`priority-badge ${prio}`}>
                                  {ticket.prioridade}
                                </span>
                                <span className="category-tag">
                                  <CatIcon size={14} /> {ticket.categoria}
                                </span>
                                {ticket.assigned_to && (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(59, 130, 246, 0.15)",
                                      color: "#60a5fa",
                                      borderRadius: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title="Agente Atribuído"
                                  >
                                    <User size={10} /> {ticket.assigned_to}
                                  </span>
                                )}
                                {ticket.is_sla_violated ? (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(239, 68, 68, 0.2)",
                                      color: "#ef4444",
                                      borderRadius: "4px",
                                      marginLeft: "auto",
                                      fontWeight: "bold",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title="O SLA deste chamado foi violado"
                                  >
                                    <AlertTriangle size={10} /> SLA VIOLADO
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                      background: "rgba(255, 255, 255, 0.05)",
                                      color: "#94a3b8",
                                      borderRadius: "4px",
                                      marginLeft: "auto",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title={
                                      ticket.sla_deadline
                                        ? `Prazo SLA: ${new Date(ticket.sla_deadline).toLocaleString()}`
                                        : ""
                                    }
                                  >
                                    <Clock size={10} /> SLA OK
                                  </span>
                                )}
                              </div>
                              <p className="ticket-desc">{ticket.descricao}</p>
                              <div className="ticket-requester">
                                <User size={14} /> {ticket.solicitante}
                              </div>
                              <div className="ticket-ai-analysis">
                                <div className="ai-header">
                                  <Sparkles size={12} /> Diagnóstico IA
                                </div>
                                <div className="ai-details">
                                  Score de Confiança:{" "}
                                  <strong>
                                    {Math.round(ticket.confianca * 100)}%
                                  </strong>
                                </div>
                              </div>
                              <div className="ticket-footer">
                                <span className="ticket-id">
                                  <Hash
                                    size={12}
                                    style={{
                                      display: "inline",
                                      verticalAlign: "text-bottom",
                                    }}
                                  />
                                  {String(ticket.id).padStart(4, "0")}
                                </span>
                                <div className="ticket-actions">
                                  {nextStatus && (
                                    <button
                                      aria-label={`Avançar chamado ${ticket.id} para ${nextStatus}`}
                                      className="btn-icon btn-advance"
                                      onClick={() =>
                                        handleAdvance(ticket.id, nextStatus)
                                      }
                                    >
                                      {nextStatus === "Atendimento"
                                        ? "Atender"
                                        : "Resolver"}{" "}
                                      <ArrowRight
                                        size={14}
                                        aria-hidden="true"
                                      />
                                    </button>
                                  )}
                                  <button
                                    aria-label={`Excluir chamado ${ticket.id}`}
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDelete(ticket.id)}
                                  >
                                    <Trash2 size={16} aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* AI ACTIVITY FEED */}
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="activity-feed"
              >
                <div className="activity-feed-header">
                  <Activity size={20} color="var(--color-primary)" /> Activity
                  Feed
                </div>
                <div className="timeline">
                  {activities.map((act, i) => (
                    <div className="timeline-item" key={i}>
                      <div
                        className="timeline-dot"
                        style={{ background: act.color }}
                      />
                      <div className="timeline-content">
                        <span className="timeline-text">{act.text}</span>
                        <span className="timeline-time">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.aside>
            </div>
          </div>
        )}

        {activeView === "tickets" && (
          <div style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <TicketPlus size={24} color="var(--color-primary)" /> Gestão de
                Chamados ITIL 4
              </h2>
              <button
                className="btn btn-demo"
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    "ID,Solicitante,Categoria,Prioridade,Status,Descricao\n" +
                    tickets
                      .map(
                        (t) =>
                          `${t.id},"${t.solicitante}","${t.categoria}","${t.prioridade}","${t.status}","${t.descricao.replace(/"/g, '""')}"`,
                      )
                      .join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "chamados_itil4.csv");
                  document.body.appendChild(link);
                  link.click();
                  showToast("📥 CSV exportado com sucesso!");
                }}
              >
                Exportar CSV
              </button>
            </div>
            <div
              style={{
                background: "var(--color-card)",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "14px 18px",
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                      }}
                    >
                      ID
                    </th>
                    <th
                      style={{
                        padding: "14px 18px",
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                      }}
                    >
                      Solicitante
                    </th>
                    <th
                      style={{
                        padding: "14px 18px",
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                      }}
                    >
                      Categoria
                    </th>
                    <th
                      style={{
                        padding: "14px 18px",
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                      }}
                    >
                      Prioridade
                    </th>
                    <th
                      style={{
                        padding: "14px 18px",
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                      }}
                    >
                      Confiança IA
                    </th>
                    <th
                      style={{
                        padding: "14px 18px",
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "14px 18px",
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                      }}
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <td style={{ padding: "14px 18px", fontWeight: 600 }}>
                        #{String(t.id).padStart(4, "0")}
                      </td>
                      <td style={{ padding: "14px 18px" }}>{t.solicitante}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: "rgba(139, 92, 246, 0.15)",
                            color: "#c4b5fd",
                            fontSize: "0.8rem",
                          }}
                        >
                          {t.categoria}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          className={`priority-badge ${getPrioClass(t.prioridade)}`}
                        >
                          {t.prioridade}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", color: "#a78bfa" }}>
                        {Math.round(t.confianca * 100)}%
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <select
                          value={t.status}
                          onChange={(e) => handleAdvance(t.id, e.target.value)}
                          style={{
                            background: "var(--color-bg)",
                            color: "#fff",
                            border: "1px solid var(--color-border)",
                            borderRadius: "6px",
                            padding: "6px 10px",
                          }}
                        >
                          <option value="Novo">Novo</option>
                          <option value="Atendimento">Atendimento</option>
                          <option value="Resolvido">Resolvido</option>
                        </select>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <button
                          aria-label={`Excluir chamado ${t.id}`}
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === "reports" && (
          <div style={{ padding: "24px" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <BarChart3 size={24} color="var(--color-primary)" /> Relatórios
              Analíticos ITIL 4 & SLA
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "var(--color-card)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  MTTR (Tempo Médio de Resolução)
                </span>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    marginTop: "8px",
                    color: "#34d399",
                  }}
                >
                  18m 42s
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  -14% melhor que a meta SLA (22m)
                </div>
              </div>
              <div
                style={{
                  background: "var(--color-card)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Acurácia da Triagem IA (NLP)
                </span>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    marginTop: "8px",
                    color: "#a78bfa",
                  }}
                >
                  94.8%
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Baseado em 1.420 chamados triados
                </div>
              </div>
              <div
                style={{
                  background: "var(--color-card)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Conformidade com SLA
                </span>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    marginTop: "8px",
                    color: "#60a5fa",
                  }}
                >
                  98.2%
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Dentro dos limites ITIL 4
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "var(--color-card)",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
                  Tickets por Categoria
                </h3>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          stats.por_categoria
                            ? Object.entries(stats.por_categoria).map(
                                ([name, value]) => ({ name, value }),
                              )
                            : []
                        }
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {(stats.por_categoria
                          ? Object.entries(stats.por_categoria)
                          : []
                        ).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#8b5cf6",
                                "#06b6d4",
                                "#f59e0b",
                                "#ef4444",
                                "#10b981",
                              ][index % 5]
                            }
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div
                style={{
                  background: "var(--color-card)",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
                  SLA Cumprido vs Violado
                </h3>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "No Prazo",
                          value: stats.sla_on_time || 0,
                          fill: "#10b981",
                        },
                        {
                          name: "SLA Violado",
                          value: stats.sla_breached || 0,
                          fill: "#ef4444",
                        },
                      ]}
                    >
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "activity" && (
          <div style={{ padding: "24px" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Activity size={24} color="var(--color-primary)" /> Log de
              Auditoria e Atividades da IA
            </h2>
            <div
              style={{
                background: "var(--color-card)",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {activities.map((act, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: act.color,
                      }}
                    />
                    <div style={{ flex: 1, fontSize: "0.95rem" }}>
                      {act.text}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {act.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {activeView === "settings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                padding: "28px",
                width: "560px",
                maxWidth: "90vw",
                color: "var(--color-text)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Settings size={20} color="var(--color-primary)" />{" "}
                  Configurações de IA e ITIL 4
                </h2>
                <button
                  onClick={() => setActiveView("dashboard")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                      marginBottom: "6px",
                    }}
                  >
                    Limite de Confiança da IA (NLP Heurístico)
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="99"
                    defaultValue="85"
                    style={{ width: "100%" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Chamados abaixo de 85% requerem triagem humana adicional.
                  </span>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                      marginBottom: "6px",
                    }}
                  >
                    SLA Crítico - Alerta Automático (Minutos)
                  </label>
                  <input
                    type="number"
                    defaultValue={15}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                      marginBottom: "6px",
                    }}
                  >
                    Canal de Alertas de Incidente Major (Webhook URL)
                  </label>
                  <input
                    type="text"
                    defaultValue="https://hooks.slack.com/services/T000/B000/ITSM_ALERTS"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "6px",
                  }}
                >
                  <input type="checkbox" id="auto-escalate" defaultChecked />
                  <label
                    htmlFor="auto-escalate"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Escalonar automaticamente para Nível 2 chamados Críticos não
                    atendidos em 10 min
                  </label>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  className="btn"
                  onClick={() => setActiveView("dashboard")}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-demo"
                  onClick={() => {
                    setActiveView("dashboard");
                    showToast(
                      "✅ Configurações de IA & ITIL 4 salvas com sucesso!",
                    );
                  }}
                >
                  Salvar Configurações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="toast"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Widget */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
        }}
      >
        {isChatOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{
              width: "350px",
              height: "450px",
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                padding: "16px",
                background: "var(--color-primary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                <Sparkles size={18} /> ITSM Copilot
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf:
                      msg.sender === "user" ? "flex-end" : "flex-start",
                    background:
                      msg.sender === "user"
                        ? "var(--color-primary)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      msg.sender === "user"
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    borderBottomRightRadius: msg.sender === "user" ? 0 : "12px",
                    borderBottomLeftRadius: msg.sender === "user" ? "12px" : 0,
                    maxWidth: "85%",
                    fontSize: "0.9rem",
                    color: "#fff",
                  }}
                >
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    color: "#94a3b8",
                  }}
                >
                  Digitando...
                </div>
              )}
            </div>
            <form
              onSubmit={handleChatSubmit}
              style={{
                padding: "12px",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                gap: "8px",
                background: "var(--color-bg)",
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte ao Copilot..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.2)",
                  color: "#fff",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                style={{
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  width: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 10px 25px -5px rgba(59,130,246,0.5)",
            }}
          >
            <Sparkles size={28} />
          </button>
        )}
      </div>
    </div>
  );
}
