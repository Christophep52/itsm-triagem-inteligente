import { NextResponse } from 'next/server';

export async function POST() {
  global._itsmTickets = [
    { id: 13, descricao: 'O roteador principal do 3º andar está sem luz de internet, todos os colaboradores estão sem conexão', solicitante: 'Carlos Silva', categoria: 'Rede', prioridade: 'Crítica', status: 'Novo', confianca: 0.92 },
    { id: 14, descricao: 'Meu mouse parou de funcionar, já troquei a pilha e nada', solicitante: 'Ana Souza', categoria: 'Hardware', prioridade: 'Baixa', status: 'Novo', confianca: 0.65 },
    { id: 15, descricao: 'O sistema do RH está travando quando tento gerar folha de pagamento', solicitante: 'Roberto Lima', categoria: 'Sistema', prioridade: 'Média', status: 'Atendimento', confianca: 1.0 },
    { id: 16, descricao: 'Recebi um e-mail suspeito pedindo para atualizar minha senha corporativa', solicitante: 'Juliana Costa', categoria: 'Segurança', prioridade: 'Crítica', status: 'Novo', confianca: 0.98 },
    { id: 17, descricao: 'A impressora da sala de reuniões não imprime, erro de spooler', solicitante: 'Marcos Oliveira', categoria: 'Hardware', prioridade: 'Média', status: 'Atendimento', confianca: 0.78 },
    { id: 18, descricao: 'Internet caiu em toda a empresa, produção parada', solicitante: 'Fernanda Santos', categoria: 'Rede', prioridade: 'Crítica', status: 'Novo', confianca: 0.95 },
    { id: 19, descricao: 'Preciso instalar o novo software de videoconferência', solicitante: 'Lucas Pereira', categoria: 'Sistema', prioridade: 'Baixa', status: 'Resolvido', confianca: 0.72 },
    { id: 20, descricao: 'Minha tela azul aparece toda vez que inicio o computador, BSOD', solicitante: 'Diego Rocha', categoria: 'Sistema', prioridade: 'Média', status: 'Resolvido', confianca: 0.88 },
  ];
  return NextResponse.json({ success: true, tickets: global._itsmTickets });
}
