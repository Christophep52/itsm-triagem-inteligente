"use client";

import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  LayoutDashboard, TicketPlus, BarChart3, Settings,
  AlertTriangle, Clock, CheckCircle2,
  Trash2, ArrowRight, Zap, Shield, Wifi, Monitor,
  RefreshCw, Cpu, Send, User, Activity,
  Bell, Search, Sparkles, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS = { Rede: Wifi, Hardware: Monitor, Sistema: Cpu, Segurança: Shield };

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  const {
    activeView, setActiveView,
    tickets, stats, loading, toast,
    searchQuery, setSearchQuery,
    activities, showToast, fetchData,
    handleCreate, handleAdvance, handleDelete, handleSeed
  } = useAppStore();

  const [descricao, setDescricao] = useState('');
  const [solicitante, setSolicitante] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  if (!mounted) return null;

  const filteredTickets = tickets.filter(t =>
    !searchQuery || t.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.solicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const novos = filteredTickets.filter(t => t.status === 'Novo');
  const atendimento = filteredTickets.filter(t => t.status === 'Atendimento');
  const resolvidos = filteredTickets.filter(t => t.status === 'Resolvido');

  const getPrioClass = (p) => {
    if (p === 'Crítica') return 'critica';
    if (p === 'Alta') return 'alta';
    if (p === 'Média') return 'media';
    return 'baixa';
  };

  const getNextStatus = (s) => {
    const STATUS_FLOW = ['Novo', 'Atendimento', 'Resolvido'];
    const i = STATUS_FLOW.indexOf(s);
    return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    if (!descricao.trim()) return;
    const success = await handleCreate(descricao, solicitante);
    if (success) {
      setDescricao('');
      setSolicitante('');
    }
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Zap size={28} />
        </div>
        <div className={`sidebar-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
          <LayoutDashboard size={22} />
        </div>
        <div className={`sidebar-item ${activeView === 'tickets' ? 'active' : ''}`} onClick={() => setActiveView('tickets')}>
          <TicketPlus size={22} />
        </div>
        <div className={`sidebar-item ${activeView === 'reports' ? 'active' : ''}`} onClick={() => setActiveView('reports')}>
          <BarChart3 size={22} />
        </div>
        <div className={`sidebar-item ${activeView === 'activity' ? 'active' : ''}`} onClick={() => setActiveView('activity')}>
          <Activity size={22} />
        </div>
        <div style={{ flex: 1 }} />
        <div className="sidebar-item"><Bell size={22} /></div>
        <div className="sidebar-item"><Settings size={22} /></div>
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

        <div className="dashboard-container">
          {/* STAT CARDS */}
          <div className="stats-grid">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
              <div className="stat-icon-pill" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-primary)' }}>
                <BarChart3 size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total de Chamados</span>
              </div>
              <div className="trend-badge trend-up">↑ 12%</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <div className="stat-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.criticos}</span>
                <span className="stat-label">Prioridade Crítica</span>
              </div>
              <div className="trend-badge trend-down">↓ 8%</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
              <div className="stat-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.em_atendimento}</span>
                <span className="stat-label">Em Atendimento</span>
              </div>
              <div className="trend-badge trend-up">↑ 25%</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
              <div className="stat-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
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
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="new-ticket-form" 
                onSubmit={submitTicket}
              >
                <div className="form-header">
                  <Sparkles size={18} /> Novo Chamado (Triagem IA)
                </div>
                <div className="form-body">
                  <textarea
                    className="textarea-field"
                    placeholder="Descreva o problema (ex: O roteador principal parou de funcionar...)"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                  <div className="form-footer">
                    <input
                      className="input-name"
                      placeholder="Solicitante (Opcional)"
                      value={solicitante}
                      onChange={(e) => setSolicitante(e.target.value)}
                    />
                    <button type="submit" className="btn-submit" disabled={!descricao.trim() || loading}>
                      <Send size={16} /> {loading ? 'Analisando...' : 'Enviar para Triagem'}
                    </button>
                  </div>
                </div>
              </motion.form>

              {/* KANBAN BOARD */}
              <div className="kanban-board">
                {/* NOVOS */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="kanban-col kanban-col-novo">
                  <div className="kanban-col-header">
                    <AlertTriangle size={18} />
                    <span className="kanban-col-title">Novos</span>
                    <span className="kanban-col-count">{novos.length}</span>
                  </div>
                  <div className="kanban-cards">
                    <AnimatePresence>
                      {novos.map(ticket => {
                        const prio = getPrioClass(ticket.prioridade);
                        const CatIcon = CATEGORY_ICONS[ticket.categoria] || Cpu;
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
                            <div className="ticket-header">
                              <span className={`priority-badge ${prio}`}>{ticket.prioridade}</span>
                              <span className="category-tag"><CatIcon size={14} /> {ticket.categoria}</span>
                            </div>
                            <p className="ticket-desc">{ticket.descricao}</p>
                            <div className="ticket-requester"><User size={14} /> {ticket.solicitante}</div>
                            <div className="ticket-ai-analysis">
                              <div className="ai-header"><Sparkles size={12} /> Diagnóstico IA</div>
                              <div className="ai-details">Score de Confiança: <strong>{Math.round(ticket.confianca * 100)}%</strong></div>
                              {ticket.sentimento && (
                                <div className="ai-details">
                                  Sentimento: <strong style={{color: 'var(--color-primary)'}}>{ticket.sentimento}</strong>
                                </div>
                              )}
                              {ticket.resolucao_sugerida && (
                                <div className="ai-rag-suggestion">
                                  <strong>💡 Resolução (RAG):</strong> {ticket.resolucao_sugerida}
                                </div>
                              )}
                            </div>
                            <div className="ticket-footer">
                              <span className="ticket-id"><Hash size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />{String(ticket.id).padStart(4, '0')}</span>
                              <div className="ticket-actions">
                                {nextStatus && (
                                  <button className="btn-icon btn-advance" onClick={() => handleAdvance(ticket.id, nextStatus)}>
                                    {nextStatus === 'Atendimento' ? 'Atender' : 'Resolver'} <ArrowRight size={14} />
                                  </button>
                                )}
                                <button className="btn-icon btn-delete" onClick={() => handleDelete(ticket.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* EM ATENDIMENTO */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="kanban-col kanban-col-atendimento">
                  <div className="kanban-col-header">
                    <Clock size={18} />
                    <span className="kanban-col-title">Atendimento</span>
                    <span className="kanban-col-count">{atendimento.length}</span>
                  </div>
                  <div className="kanban-cards">
                    <AnimatePresence>
                      {atendimento.map(ticket => {
                        const prio = getPrioClass(ticket.prioridade);
                        const CatIcon = CATEGORY_ICONS[ticket.categoria] || Cpu;
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
                            <div className="ticket-header">
                              <span className={`priority-badge ${prio}`}>{ticket.prioridade}</span>
                              <span className="category-tag"><CatIcon size={14} /> {ticket.categoria}</span>
                            </div>
                            <p className="ticket-desc">{ticket.descricao}</p>
                            <div className="ticket-requester"><User size={14} /> {ticket.solicitante}</div>
                            <div className="ticket-ai-analysis">
                              <div className="ai-header"><Sparkles size={12} /> Diagnóstico IA</div>
                              <div className="ai-details">Score de Confiança: <strong>{Math.round(ticket.confianca * 100)}%</strong></div>
                            </div>
                            <div className="ticket-footer">
                              <span className="ticket-id"><Hash size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />{String(ticket.id).padStart(4, '0')}</span>
                              <div className="ticket-actions">
                                {nextStatus && (
                                  <button className="btn-icon btn-advance" onClick={() => handleAdvance(ticket.id, nextStatus)}>
                                    {nextStatus === 'Atendimento' ? 'Atender' : 'Resolver'} <ArrowRight size={14} />
                                  </button>
                                )}
                                <button className="btn-icon btn-delete" onClick={() => handleDelete(ticket.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* RESOLVIDOS */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="kanban-col kanban-col-resolvido">
                  <div className="kanban-col-header">
                    <CheckCircle2 size={18} />
                    <span className="kanban-col-title">Resolvidos</span>
                    <span className="kanban-col-count">{resolvidos.length}</span>
                  </div>
                  <div className="kanban-cards">
                    <AnimatePresence>
                      {resolvidos.map(ticket => {
                        const prio = getPrioClass(ticket.prioridade);
                        const CatIcon = CATEGORY_ICONS[ticket.categoria] || Cpu;
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
                            <div className="ticket-header">
                              <span className={`priority-badge ${prio}`}>{ticket.prioridade}</span>
                              <span className="category-tag"><CatIcon size={14} /> {ticket.categoria}</span>
                            </div>
                            <p className="ticket-desc">{ticket.descricao}</p>
                            <div className="ticket-requester"><User size={14} /> {ticket.solicitante}</div>
                            <div className="ticket-ai-analysis">
                              <div className="ai-header"><Sparkles size={12} /> Diagnóstico IA</div>
                              <div className="ai-details">Score de Confiança: <strong>{Math.round(ticket.confianca * 100)}%</strong></div>
                            </div>
                            <div className="ticket-footer">
                              <span className="ticket-id"><Hash size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />{String(ticket.id).padStart(4, '0')}</span>
                              <div className="ticket-actions">
                                {nextStatus && (
                                  <button className="btn-icon btn-advance" onClick={() => handleAdvance(ticket.id, nextStatus)}>
                                    {nextStatus === 'Atendimento' ? 'Atender' : 'Resolver'} <ArrowRight size={14} />
                                  </button>
                                )}
                                <button className="btn-icon btn-delete" onClick={() => handleDelete(ticket.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* AI ACTIVITY FEED */}
            <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="activity-feed">
              <div className="activity-feed-header">
                <Activity size={20} color="var(--color-primary)" /> Activity Feed
              </div>
              <div className="timeline">
                {activities.map((act, i) => (
                  <div className="timeline-item" key={i}>
                    <div className="timeline-dot" style={{ background: act.color }} />
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
      </main>

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
    </div>
  );
}
