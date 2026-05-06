import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, TicketPlus, BarChart3, Settings,
  AlertTriangle, Clock, CheckCircle2, PlusCircle,
  Trash2, ArrowRight, Zap, Shield, Wifi, Monitor,
  RefreshCw, Cpu, Send, User, TrendingUp,
} from 'lucide-react';
import './index.css';

const API = 'http://localhost:8000';

const CATEGORY_ICONS = { Rede: Wifi, Hardware: Monitor, Sistema: Cpu, Segurança: Shield };
const STATUS_FLOW = ['Novo', 'Atendimento', 'Resolvido'];
const getNextStatus = (s) => { const i = STATUS_FLOW.indexOf(s); return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null; };

/* ═══════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════ */

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><Zap size={20} color="white" /></div>
      <SidebarIcon icon={LayoutDashboard} label="Painel" active />
      <SidebarIcon icon={TicketPlus} label="Chamados" />
      <SidebarIcon icon={BarChart3} label="Relatórios" />
      <div style={{ flex: 1 }} />
      <SidebarIcon icon={Settings} label="Configurações" />
    </aside>
  );
}

function SidebarIcon({ icon: Icon, label, active }) {
  return (
    <div className={`sidebar-icon ${active ? 'active' : ''}`}>
      <Icon size={20} />
      <span className="sidebar-tooltip">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════ */

function StatCard({ label, value, icon: Icon, color, delay }) {
  return (
    <div className={`stat-card ${color} animate-fade-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`stat-icon ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TICKET CARD
   ═══════════════════════════════════════════════════ */

function TicketCard({ ticket, onAdvance, onDelete, index }) {
  const prioClass = ticket.prioridade === 'Crítica' ? 'critica' : ticket.prioridade === 'Média' ? 'media' : 'baixa';
  const badgeClass = `badge badge-${prioClass}`;
  const CatIcon = CATEGORY_ICONS[ticket.categoria] || Cpu;
  const nextStatus = getNextStatus(ticket.status);

  return (
    <div className={`ticket ${prioClass} animate-fade-up`} style={{ animationDelay: `${index * 50}ms` }}>
      {/* Row 1: Priority + Category */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className={badgeClass}>{ticket.prioridade}</span>
        <span className="cat-tag"><CatIcon size={11} />{ticket.categoria}</span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: 'var(--color-text-primary)', marginBottom: 10 }}>
        {ticket.descricao}
      </p>

      {/* Requester */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>
        <User size={11} /> {ticket.solicitante}
      </div>

      {/* AI Confidence */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
          <span>Confiança da IA</span>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{Math.round(ticket.confianca * 100)}%</span>
        </div>
        <div className="confidence-track">
          <div className="confidence-fill" style={{ width: `${ticket.confianca * 100}%` }} />
        </div>
      </div>

      {/* Footer: ID + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', opacity: 0.6 }}>
          #{String(ticket.id).padStart(4, '0')}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {nextStatus && (
            <button onClick={() => onAdvance(ticket.id, nextStatus)} className="action-btn action-advance">
              <ArrowRight size={10} />{nextStatus === 'Atendimento' ? 'Atender' : 'Resolver'}
            </button>
          )}
          <button onClick={() => onDelete(ticket.id)} className="action-btn action-delete">
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   KANBAN COLUMN
   ═══════════════════════════════════════════════════ */

function KanbanColumn({ title, icon: Icon, iconColor, iconBg, tickets, onAdvance, onDelete }) {
  return (
    <div className="kanban-col">
      <div className="kanban-header">
        <div className="kanban-header-icon" style={{ background: iconBg }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        <span className="kanban-header-title">{title}</span>
        <span className="kanban-header-count">{tickets.length}</span>
      </div>
      <div className="kanban-body">
        {tickets.map((t, i) => (
          <TicketCard key={t.id} ticket={t} onAdvance={onAdvance} onDelete={onDelete} index={i} />
        ))}
        {tickets.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">Nenhum chamado</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FORM
   ═══════════════════════════════════════════════════ */

function NewTicketForm({ onSubmit, loading }) {
  const [descricao, setDescricao] = useState('');
  const [solicitante, setSolicitante] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!descricao.trim()) return;
    onSubmit(descricao, solicitante || 'Usuário Anônimo');
    setDescricao('');
    setSolicitante('');
  };

  return (
    <form onSubmit={handleSubmit} className="form-card animate-fade-up" style={{ animationDelay: '200ms' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 4px 16px -4px rgba(99,102,241,0.4)',
        }}>
          <PlusCircle size={17} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Abrir Novo Chamado</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
            A IA classificará automaticamente a categoria e prioridade
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="input-field" style={{ flex: '0 0 180px' }}
          placeholder="Seu nome" value={solicitante}
          onChange={(e) => setSolicitante(e.target.value)} disabled={loading}
        />
        <input className="input-field" style={{ flex: 1, minWidth: 200 }}
          placeholder="Descreva o problema técnico (ex: O roteador principal está sem internet)..."
          value={descricao} onChange={(e) => setDescricao(e.target.value)} disabled={loading}
        />
        <button type="submit" className="btn-submit" disabled={loading || !descricao.trim()}>
          <Send size={14} />{loading ? 'Triando...' : 'Enviar Chamado'}
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════ */

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const fetchData = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([axios.get(`${API}/tickets`), axios.get(`${API}/stats`)]);
      setTickets(t.data);
      setStats(s.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (descricao, solicitante) => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/tickets`, { descricao, solicitante });
      showToast(`✅ Chamado #${r.data.id} — ${r.data.categoria} / ${r.data.prioridade}`);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdvance = async (id, status) => {
    try { await axios.patch(`${API}/tickets/${id}`, { status }); showToast(`🔄 #${id} → ${status}`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/tickets/${id}`); showToast(`🗑️ #${id} removido`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const handleSeed = async () => {
    try { await axios.post(`${API}/seed`); showToast('⚡ Dados de demonstração carregados'); fetchData(); }
    catch (e) { console.error(e); }
  };

  const novos = tickets.filter(t => t.status === 'Novo');
  const atendimento = tickets.filter(t => t.status === 'Atendimento');
  const resolvidos = tickets.filter(t => t.status === 'Resolvido');

  return (
    <div className="min-h-screen bg-mesh" style={{ position: 'relative', zIndex: 1 }}>
      <Sidebar />

      <main style={{ marginLeft: 100, padding: '20px 32px 20px 24px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }} className="animate-fade-up">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#34d399' }}>
                Sistema Ativo
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Triagem Inteligente
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Painel de gerenciamento de chamados técnicos · ITSM MVP
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={fetchData} className="header-btn">
              <RefreshCw size={14} />Atualizar
            </button>
            <button onClick={handleSeed} className="header-btn header-btn-accent">
              <Zap size={14} />Carregar Demo
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
            <StatCard label="Total de Chamados" value={stats.total} icon={BarChart3} color="indigo" delay={0} />
            <StatCard label="Prioridade Crítica" value={stats.criticos} icon={AlertTriangle} color="rose" delay={60} />
            <StatCard label="Prioridade Média" value={stats.medios} icon={TrendingUp} color="amber" delay={120} />
            <StatCard label="Prioridade Baixa" value={stats.baixos} icon={CheckCircle2} color="emerald" delay={180} />
          </div>
        )}

        {/* ── FORM ── */}
        <div style={{ marginBottom: 16 }}>
          <NewTicketForm onSubmit={handleCreate} loading={loading} />
        </div>

        {/* ── KANBAN ── */}
        <div style={{ display: 'flex', gap: 16 }}>
          <KanbanColumn title="Novos Chamados" icon={AlertTriangle}
            iconColor="#f43f5e" iconBg="rgba(244,63,94,0.1)"
            tickets={novos} onAdvance={handleAdvance} onDelete={handleDelete} />
          <KanbanColumn title="Em Atendimento" icon={Clock}
            iconColor="#f59e0b" iconBg="rgba(245,158,11,0.1)"
            tickets={atendimento} onAdvance={handleAdvance} onDelete={handleDelete} />
          <KanbanColumn title="Resolvidos" icon={CheckCircle2}
            iconColor="#10b981" iconBg="rgba(16,185,129,0.1)"
            tickets={resolvidos} onAdvance={handleAdvance} onDelete={handleDelete} />
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
