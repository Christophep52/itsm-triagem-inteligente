import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, TicketPlus, BarChart3, Settings,
  AlertTriangle, Clock, CheckCircle2, PlusCircle,
  Trash2, ArrowRight, Zap, Shield, Wifi, Monitor,
  RefreshCw, Cpu, Send, User, TrendingUp, Activity,
  Bell, Search, ChevronDown, Eye, MessageSquare,
  Timer, Sparkles, ArrowUpRight, Hash,
} from 'lucide-react';
import './index.css';

const API = 'http://localhost:8000';
const CATEGORY_ICONS = { Rede: Wifi, Hardware: Monitor, Sistema: Cpu, Segurança: Shield };
const STATUS_FLOW = ['Novo', 'Atendimento', 'Resolvido'];
const getNextStatus = (s) => { const i = STATUS_FLOW.indexOf(s); return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null; };

/* ═══════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════ */
function Sidebar({ activeView, onViewChange }) {
  const items = [
    { icon: LayoutDashboard, label: 'Painel', view: 'dashboard' },
    { icon: TicketPlus, label: 'Chamados', view: 'tickets' },
    { icon: BarChart3, label: 'Relatórios', view: 'reports' },
    { icon: Activity, label: 'Atividade', view: 'activity' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><Zap size={20} color="white" /></div>
      {items.map(({ icon, label, view }) => (
        <SidebarIcon key={view} icon={icon} label={label} active={activeView === view} onClick={() => onViewChange(view)} />
      ))}
      <div style={{ flex: 1 }} />
      <SidebarIcon icon={Bell} label="Alertas" />
      <SidebarIcon icon={Settings} label="Configurações" />
    </aside>
  );
}

function SidebarIcon({ icon: Icon, label, active, onClick }) {
  return (
    <div className={`sidebar-icon ${active ? 'active' : ''}`} onClick={onClick}>
      <Icon size={20} />
      <span className="sidebar-tooltip">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════ */
function StatCard({ label, value, icon: Icon, color, delay, trend }) {
  return (
    <div className={`stat-card animate-fade-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`stat-icon ${color}`}>
        <Icon size={22} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-value animate-count" style={{ animationDelay: `${delay + 200}ms` }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', fontWeight: 700,
          color: trend > 0 ? 'var(--color-green)' : 'var(--color-red)',
          background: trend > 0 ? 'var(--color-green-soft)' : 'var(--color-red-soft)',
          padding: '3px 8px', borderRadius: 6 }}>
          <ArrowUpRight size={10} style={{ transform: trend < 0 ? 'rotate(90deg)' : 'none' }} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TICKET CARD
   ═══════════════════════════════════════════════════ */
function TicketCard({ ticket, onAdvance, onDelete, index }) {
  const prioClass = ticket.prioridade === 'Crítica' ? 'critica' : ticket.prioridade === 'Alta' ? 'alta' : ticket.prioridade === 'Média' ? 'media' : 'baixa';
  const badgeClass = `badge badge-${prioClass}`;
  const CatIcon = CATEGORY_ICONS[ticket.categoria] || Cpu;
  const nextStatus = getNextStatus(ticket.status);

  return (
    <div className={`ticket ${prioClass} animate-fade-up`} style={{ animationDelay: `${index * 60}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className={badgeClass}>{ticket.prioridade}</span>
        <span className="cat-tag"><CatIcon size={11} />{ticket.categoria}</span>
      </div>

      <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--color-text-primary)', marginBottom: 10, fontWeight: 400 }}>
        {ticket.descricao}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
        <User size={11} /> {ticket.solicitante}
      </div>

      <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>
          <Sparkles size={11} /> DIAGNÓSTICO NEURAL IA
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
          Categoria semântica: <strong style={{ color: 'white' }}>{ticket.categoria}</strong> · Urgência: <strong style={{ color: 'white' }}>{ticket.prioridade}</strong>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={9} />Score de Confiança NLP</span>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {Math.round(ticket.confianca * 100)}%
          </span>
        </div>
        <div className="confidence-track">
          <div className="confidence-fill" style={{ width: `${ticket.confianca * 100}%` }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-ghost)', fontFamily: "'JetBrains Mono', monospace" }}>
          <Hash size={9} style={{ display: 'inline', verticalAlign: 'middle' }} />{String(ticket.id).padStart(4, '0')}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--color-accent), #a78bfa)',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
        }}>
          <PlusCircle size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Abrir Novo Chamado para Triagem IA</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={10} /> O motor de NLP avaliará semântica e calculará urgência autonomamente
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
          Descrição do Problema
        </label>
        <textarea
          className="input-field"
          style={{ width: '100%', height: 80, resize: 'vertical' }}
          placeholder="Ex: O roteador principal do 3º andar não está conectando, estamos sem internet..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            Solicitante (Opcional)
          </label>
          <input
            className="input-field"
            style={{ width: '100%' }}
            placeholder="Seu nome"
            value={solicitante}
            onChange={(e) => setSolicitante(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-submit" disabled={loading || !descricao.trim()}>
          <Send size={14} />{loading ? 'Triando via IA...' : 'Enviar para Triagem IA'}
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════
   ACTIVITY LOG
   ═══════════════════════════════════════════════════ */
function ActivityLog({ activities }) {
  return (
    <div className="activity-panel animate-fade-up" style={{ animationDelay: '300ms' }}>
      <div className="activity-header">
        <Activity size={16} style={{ color: 'var(--color-accent)' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Atividade Recente da IA</span>
        <span className="kanban-header-count">{activities.length}</span>
      </div>
      {activities.map((a, i) => (
        <div key={i} className="activity-item">
          <div className="activity-dot" style={{ background: a.color }} />
          <span style={{ color: 'var(--color-text-secondary)', flex: 1 }}>{a.text}</span>
          <span className="activity-time">{a.time}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════ */
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

  const activities = [
    { text: 'Chamado #0018 triado · Rede / Crítica', color: 'var(--color-red)', time: '2min' },
    { text: 'Chamado #0016 analisado por IA · 98% de confiança', color: 'var(--color-accent)', time: '5min' },
    { text: 'Chamado #0015 avançou → Em Atendimento', color: 'var(--color-amber)', time: '12min' },
    { text: 'Chamado #0019 resolvido por Lucas Pereira', color: 'var(--color-green)', time: '28min' },
    { text: 'Chamado #0020 resolvido · BSOD corrigido', color: 'var(--color-green)', time: '1h' },
    { text: 'Base de teste de IA carregada com sucesso', color: 'var(--color-cyan)', time: '2h' },
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

  const handleCreate = async (descricao, solicitante) => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/tickets`, { descricao, solicitante });
      showToast(`✅ Triagem IA #00${r.data.id} · ${r.data.categoria} / ${r.data.prioridade}`);
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

  return (
    <div className="min-h-screen bg-mesh" style={{ position: 'relative', zIndex: 1 }}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main style={{ marginLeft: 68, padding: '24px clamp(16px, 2vw, 32px) 24px clamp(16px, 2vw, 28px)', minWidth: 0 }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }} className="animate-fade-up">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px rgba(167,139,250,0.5)' }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={11} /> AGENTE AUTÔNOMO DE NÍVEL 1 · MOTOR NLP ATIVO
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.2 }}>
              Triagem Inteligente
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Painel de gerenciamento de chamados técnicos com classificação por IA
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-ghost)' }} />
              <input
                className="input-field"
                style={{ width: 220, paddingLeft: 34, fontSize: '0.78rem' }}
                placeholder="Buscar chamados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={fetchData} className="header-btn">
              <RefreshCw size={14} />Atualizar
            </button>
            <button onClick={handleSeed} className="header-btn header-btn-accent">
              <Zap size={14} />Demo
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
          <StatCard label="Total de Chamados" value={stats.total} icon={BarChart3} color="indigo" delay={0} trend={12} />
          <StatCard label="Prioridade Crítica" value={stats.criticos} icon={AlertTriangle} color="rose" delay={60} trend={-8} />
          <StatCard label="Em Atendimento" value={stats.em_atendimento} icon={Timer} color="amber" delay={120} trend={25} />
          <StatCard label="Resolvidos" value={stats.resolvidos} icon={CheckCircle2} color="emerald" delay={180} trend={18} />
        </div>

        {/* ── FORM ── */}
        <div style={{ marginBottom: 18 }}>
          <NewTicketForm onSubmit={handleCreate} loading={loading} />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {/* KANBAN */}
          <div style={{ flex: '1 1 580px', display: 'flex', gap: 14, minWidth: 0, overflowX: 'auto', paddingBottom: 8 }}>
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

          {/* ACTIVITY LOG */}
          <div style={{ flex: '1 1 280px', maxWidth: '100%', minWidth: 260 }}>
            <ActivityLog activities={activities} />
          </div>
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
