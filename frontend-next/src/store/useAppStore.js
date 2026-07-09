import { create } from 'zustand';
import axios from 'axios';

const API = '/api';
const STATUS_FLOW = ['Novo', 'Atendimento', 'Resolvido'];
const getNextStatus = (s) => { const i = STATUS_FLOW.indexOf(s); return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null; };

export const useAppStore = create((set, get) => ({
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),

  tickets: [
    { id: 13, descricao: 'O roteador principal do 3º andar está sem luz de internet, todos os colaboradores estão sem conexão', solicitante: 'Carlos Silva', categoria: 'Rede', prioridade: 'Crítica', status: 'Novo', confianca: 0.92 },
    { id: 14, descricao: 'Meu mouse parou de funcionar, já troquei a pilha e nada', solicitante: 'Ana Souza', categoria: 'Hardware', prioridade: 'Baixa', status: 'Novo', confianca: 0.65 },
    { id: 15, descricao: 'O sistema do RH está travando quando tento gerar folha de pagamento', solicitante: 'Roberto Lima', categoria: 'Sistema', prioridade: 'Média', status: 'Atendimento', confianca: 1.0 },
    { id: 16, descricao: 'Recebi um e-mail suspeito pedindo para atualizar minha senha corporativa', solicitante: 'Juliana Costa', categoria: 'Segurança', prioridade: 'Crítica', status: 'Novo', confianca: 0.98 },
    { id: 17, descricao: 'A impressora da sala de reuniões não imprime, erro de spooler', solicitante: 'Marcos Oliveira', categoria: 'Hardware', prioridade: 'Média', status: 'Atendimento', confianca: 0.78 },
    { id: 18, descricao: 'Internet caiu em toda a empresa, produção parada', solicitante: 'Fernanda Santos', categoria: 'Rede', prioridade: 'Crítica', status: 'Novo', confianca: 0.95 },
    { id: 19, descricao: 'Preciso instalar o novo software de videoconferência', solicitante: 'Lucas Pereira', categoria: 'Sistema', prioridade: 'Baixa', status: 'Resolvido', confianca: 0.72 },
    { id: 20, descricao: 'Minha tela azul aparece toda vez que inicio o computador, BSOD', solicitante: 'Diego Rocha', categoria: 'Sistema', prioridade: 'Média', status: 'Resolvido', confianca: 0.88 },
  ],
  stats: {
    total: 32, novos: 14, em_atendimento: 8, resolvidos: 10, criticos: 6, medios: 12, baixos: 14
  },
  loading: false,
  toast: null,
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  activities: [
    { text: 'Chamado #0018 triado · Rede / Crítica', color: 'var(--color-danger)', time: '2min ago' },
    { text: 'Chamado #0016 analisado por IA · 98% de confiança', color: 'var(--color-primary)', time: '5min ago' },
    { text: 'Chamado #0015 avançou → Em Atendimento', color: 'var(--color-warning)', time: '12min ago' },
    { text: 'Chamado #0019 resolvido por Lucas Pereira', color: 'var(--color-success)', time: '28min ago' },
    { text: 'Chamado #0020 resolvido · BSOD corrigido', color: 'var(--color-success)', time: '1h ago' },
    { text: 'Base de teste de IA carregada com sucesso', color: 'var(--color-accent)', time: '2h ago' },
  ],

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: null }), 3000);
  },

  fetchData: async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        axios.get(`${API}/tickets`),
        axios.get(`${API}/stats`),
      ]);
      set({ tickets: ticketsRes.data, stats: statsRes.data });
    } catch (e) { console.error(e); }
  },

  handleCreate: async (descricao, solicitante) => {
    set({ loading: true });
    try {
      const finalSol = solicitante || 'Usuário Anônimo';
      const r = await axios.post(`${API}/tickets`, { descricao, solicitante: finalSol });
      get().showToast(`✅ Triagem IA #00${r.data.id} · ${r.data.categoria} / ${r.data.prioridade}`);
      get().fetchData();
      return true;
    } catch (e) {
      console.error(e);
      get().showToast('⚠️ Erro de conexão com a API de Triagem.');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  handleAdvance: async (id, status) => {
    try {
      await axios.patch(`${API}/tickets/${id}`, { status });
      get().showToast(`⚡ Chamado #00${id} → ${status}`);
      get().fetchData();
    } catch (e) { console.error(e); }
  },

  handleDelete: async (id) => {
    try {
      await axios.delete(`${API}/tickets/${id}`);
      get().showToast(`🗑️ Chamado #00${id} excluído`);
      get().fetchData();
    } catch (e) { console.error(e); }
  },

  handleSeed: async () => {
    try {
      await axios.post(`${API}/seed`);
      get().showToast('🌱 Base demonstrativa de IA recarregada!');
      get().fetchData();
    } catch (e) { console.error(e); }
  },
}));
