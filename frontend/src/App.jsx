import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, TicketPlus, BarChart3, Settings,
  AlertTriangle, Clock, CheckCircle2,
  Trash2, ArrowRight, Zap, Shield, Wifi, Monitor,
  RefreshCw, Cpu, Send, User, Activity,
  Bell, Search, Sparkles, Hash
} from 'lucide-react';
import './index.css';

const API = 'http://localhost:8000';
const CATEGORY_ICONS = { Rede: Wifi, Hardware: Monitor, Sistema: Cpu, Segurança: Shield };
const STATUS_FLOW = ['Novo', 'Atendimento', 'Resolvido'];
const getNextStatus = (s) => { const i = STATUS_FLOW.indexOf(s); return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null; };

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [tickets, setTickets] = useState([
    { id: 13, descricao: 'O roteador principal do 3º andar está sem luz de internet, todos os colaboradores estão sem conexão', solicitante: 'Carlos Silva', categoria: 'Rede', prioridade: 'Crítica', status: 'Novo', confianca: 0.92 },
    { id: 14, descricao: 'Meu mouse parou de funcionar, já troquei a pilha e nada', solicitante: 'Ana Souza', categoria: 'Hardware', prioridade: 'Baixa', status: 'Novo', confianca: 0.65 },
    { id: 15, descricao: 'O sistema do RH está travando quando tento gerar folha de pagamento', solicitante: 'Roberto Lima', categoria: 'Sistema', prioridade: 'Média', status: 'Atendimento', confianca: 1.0 },
    { id: 16, descricao: 'Recebi um e-mail suspeito pedindo para atualizar minha senha corporativa', solicitante: 'Juliana Costa', categoria: 'Segurança', prioridade: 'Crítica', status: 'Novo', confianca: 0.98 },
    { id: 17, descricao: 'A impressora da sala de reuniões não imprime, erro de spooler', solicitante: 'Marcos Oliveira', categoria: 'Hardware', prioridade: 'Média', status: 'Atendimento', confianca: 0.78 },
    { id: 18, descricao: 'Internet caiu em toda a empresa, produção parada', solicitante: 'Fernanda Santos', categoria: 'Rede', prioridade: 'Crítica', status: 'Novo', confianca: 0.95 },
    { id: 19, descricao: 'Preciso instalar o novo software de videoconferência', solicitante: 'Lucas Pereira', categoria: 'Sistema', prioridade: 'Baixa', status: 'Resolvido', confianca: 0.72 },
    { id: 20, descricao: 'Minha tela azul aparece toda vez que inicio o computador, BSOD', solicitante: 'Diego Rocha', categoria: 'Sistema', prioridade: 'Média', status: 'Resolvido', confianca: 0.88 },
  ]);
  
  const [stats, setStats] = useState({
    total: 32, novos: 14, em_atendimento: 8, resolvidos: 10, criticos: 6, medios: 12, baixos: 14
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [descricao, setDescricao] = useState('');
  const [solicitante, setSolicitante] = useState('');

  const activities = [
    { text: 'Chamado #0018 triado · Rede / Crítica', color: 'var(--danger)', time: '2min ago' },
    { text: 'Chamado #0016 analisado por IA · 98% de confiança', color: 'var(--primary)', time: '5min ago' },
    { text: 'Chamado #0015 avançou → Em Atendimento', color: 'var(--warning)', time: '12min ago' },
    { text: 'Chamado #0019 resolvido por Lucas Pereira', color: 'var(--success)', time: '28min ago' },
    { text: 'Chamado #0020 resolvido · BSOD corrigido', color: 'var(--success)', time: '1h ago' },
    { text: 'Base de teste de IA carregada com sucesso', color: 'var(--accent)', time: '2h ago' },
  ];

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        axios.get(`${API}/tickets`),
        axios.get(`${API}/stats`),
      ]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!descricao.trim()) return;
    setLoading(true);
    try {
      const finalSol = solicitante || 'Usuário Anônimo';
      const r = await axios.post(`${API}/tickets`, { descricao, solicitante: finalSol });
      showToast(`✅ Triagem IA #00${r.data.id} · ${r.data.categoria} / ${r.data.prioridade}`);
      setDescricao('');
      setSolicitante('');
      fetchData();
    } catch (e) {
      console.error(e);
      showToast('⚠️ Erro de conexão com a API de Triagem.');
    } finally { setLoading(false); }
  };

  const handleAdvance = async (id, status) => {
    try {
      await axios.patch(`${API}/tickets/${id}`, { status });
      showToast(`⚡ Chamado #00${id} → ${status}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/tickets/${id}`);
      showToast(`🗑️ Chamado #00${id} excluído`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSeed = async () => {
    try {
      await axios.post(`${API}/seed`);
      showToast('🌱 Base demonstrativa de IA recarregada!');
      fetchData();
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

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
            <div className="stat-card animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="stat-icon-pill" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary)' }}>
                <BarChart3 size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total de Chamados</span>
              </div>
              <div className="trend-badge trend-up">↑ 12%</div>
            </div>
            <div className="stat-card animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="stat-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.criticos}</span>
                <span className="stat-label">Prioridade Crítica</span>
              </div>
              <div className="trend-badge trend-down">↓ 8%</div>
            </div>
            <div className="stat-card animate-fade-up" style={{ animationDelay: '300ms' }}>
              <div className="stat-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.em_atendimento}</span>
                <span className="stat-label">Em Atendimento</span>
              </div>
              <div className="trend-badge trend-up">↑ 25%</div>
            </div>
            <div className="stat-card animate-fade-up" style={{ animationDelay: '400ms' }}>
              <div className="stat-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.resolvidos}</span>
                <span className="stat-label">Resolvidos</span>
              </div>
              <div className="trend-badge trend-up">↑ 18%</div>
            </div>
          </div>

          <div className="main-grid">
            <div className="kanban-section">
              {/* NEW TICKET FORM */}
              <form className="new-ticket-form animate-fade-up" style={{ animationDelay: '500ms' }} onSubmit={handleCreate}>
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
              </form>

              {/* KANBAN BOARD */}
              <div className="kanban-board">
                {/* NOVOS */}
                <div className="kanban-col kanban-col-novo animate-fade-up" style={{ animationDelay: '600ms' }}>
                  <div className="kanban-col-header">
                    <AlertTriangle size={18} />
                    <span className="kanban-col-title">Novos</span>
                    <span className="kanban-col-count">{novos.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {novos.map(ticket => {
                      const prio = getPrioClass(ticket.prioridade);
                      const CatIcon = CATEGORY_ICONS[ticket.categoria] || Cpu;
                      const nextStatus = getNextStatus(ticket.status);
                      return (
                        <div key={ticket.id} className={`ticket-card ${prio}`}>
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
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* EM ATENDIMENTO */}
                <div className="kanban-col kanban-col-atendimento animate-fade-up" style={{ animationDelay: '700ms' }}>
                  <div className="kanban-col-header">
                    <Clock size={18} />
                    <span className="kanban-col-title">Atendimento</span>
                    <span className="kanban-col-count">{atendimento.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {atendimento.map(ticket => {
                      const prio = getPrioClass(ticket.prioridade);
                      const CatIcon = CATEGORY_ICONS[ticket.categoria] || Cpu;
                      const nextStatus = getNextStatus(ticket.status);
                      return (
                        <div key={ticket.id} className={`ticket-card ${prio}`}>
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
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* RESOLVIDOS */}
                <div className="kanban-col kanban-col-resolvido animate-fade-up" style={{ animationDelay: '800ms' }}>
                  <div className="kanban-col-header">
                    <CheckCircle2 size={18} />
                    <span className="kanban-col-title">Resolvidos</span>
                    <span className="kanban-col-count">{resolvidos.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {resolvidos.map(ticket => {
                      const prio = getPrioClass(ticket.prioridade);
                      const CatIcon = CATEGORY_ICONS[ticket.categoria] || Cpu;
                      const nextStatus = getNextStatus(ticket.status);
                      return (
                        <div key={ticket.id} className={`ticket-card ${prio}`}>
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
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* AI ACTIVITY FEED */}
            <aside className="activity-feed animate-fade-up" style={{ animationDelay: '900ms' }}>
              <div className="activity-feed-header">
                <Activity size={20} color="var(--primary)" /> Activity Feed
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
            </aside>
          </div>
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
