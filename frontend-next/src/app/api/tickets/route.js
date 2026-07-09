import { NextResponse } from 'next/server';

// Global persistent ticket database in memory
global._itsmTickets = global._itsmTickets || [
  { id: 13, descricao: 'O roteador principal do 3º andar está sem luz de internet, todos os colaboradores estão sem conexão', solicitante: 'Carlos Silva', categoria: 'Rede', prioridade: 'Crítica', status: 'Novo', confianca: 0.92 },
  { id: 14, descricao: 'Meu mouse parou de funcionar, já troquei a pilha e nada', solicitante: 'Ana Souza', categoria: 'Hardware', prioridade: 'Baixa', status: 'Novo', confianca: 0.65 },
  { id: 15, descricao: 'O sistema do RH está travando quando tento gerar folha de pagamento', solicitante: 'Roberto Lima', categoria: 'Sistema', prioridade: 'Média', status: 'Atendimento', confianca: 1.0 },
  { id: 16, descricao: 'Recebi um e-mail suspeito pedindo para atualizar minha senha corporativa', solicitante: 'Juliana Costa', categoria: 'Segurança', prioridade: 'Crítica', status: 'Novo', confianca: 0.98 },
  { id: 17, descricao: 'A impressora da sala de reuniões não imprime, erro de spooler', solicitante: 'Marcos Oliveira', categoria: 'Hardware', prioridade: 'Média', status: 'Atendimento', confianca: 0.78 },
  { id: 18, descricao: 'Internet caiu em toda a empresa, produção parada', solicitante: 'Fernanda Santos', categoria: 'Rede', prioridade: 'Crítica', status: 'Novo', confianca: 0.95 },
  { id: 19, descricao: 'Preciso instalar o novo software de videoconferência', solicitante: 'Lucas Pereira', categoria: 'Sistema', prioridade: 'Baixa', status: 'Resolvido', confianca: 0.72 },
  { id: 20, descricao: 'Minha tela azul aparece toda vez que inicio o computador, BSOD', solicitante: 'Diego Rocha', categoria: 'Sistema', prioridade: 'Média', status: 'Resolvido', confianca: 0.88 },
];

// NLP heuristic AI classification for tickets
function classifyTicketNLP(text) {
  const lower = text.toLowerCase();
  
  let categoria = 'Sistema';
  if (/roteador|internet|wi-fi|wifi|rede|cabo|switch|link|fibra/i.test(lower)) categoria = 'Rede';
  else if (/mouse|teclado|monitor|impressora|pilha|notebook|pc|computador|tela|hardware/i.test(lower)) categoria = 'Hardware';
  else if (/senha|email suspeito|phishing|invasão|vírus|segurança|vazamento|acesso indevido|hack/i.test(lower)) categoria = 'Segurança';
  
  let prioridade = 'Média';
  let confianca = 0.85;
  if (/toda a empresa|produção parada|sem internet|urgente|crítico|inoperante|parado|todos|caiu tudo|invasão|vazamento/i.test(lower)) {
    prioridade = 'Crítica';
    confianca = 0.96;
  } else if (/não consigo trabalhar|travando|erro grav|urgência/i.test(lower)) {
    prioridade = 'Alta';
    confianca = 0.91;
  } else if (/instalar|mouse|duvida|dúvida|trocar pilha|estético/i.test(lower)) {
    prioridade = 'Baixa';
    confianca = 0.88;
  }

  return { categoria, prioridade, confianca };
}

export async function GET() {
  return NextResponse.json(global._itsmTickets);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { descricao, solicitante } = body;

    const { categoria, prioridade, confianca } = classifyTicketNLP(descricao || '');
    const maxId = global._itsmTickets.length > 0 ? Math.max(...global._itsmTickets.map(t => t.id)) : 0;
    
    const novoTicket = {
      id: maxId + 1,
      descricao: descricao || 'Chamado sem descrição',
      solicitante: solicitante || 'Colaborador',
      categoria,
      prioridade,
      status: 'Novo',
      confianca,
    };

    global._itsmTickets.unshift(novoTicket);
    return NextResponse.json(novoTicket, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar chamado' }, { status: 500 });
  }
}
