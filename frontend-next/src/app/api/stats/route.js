import { NextResponse } from 'next/server';

export async function GET() {
  const tickets = global._itsmTickets || [];
  const total = tickets.length;
  const novos = tickets.filter(t => t.status === 'Novo').length;
  const em_atendimento = tickets.filter(t => t.status === 'Atendimento').length;
  const resolvidos = tickets.filter(t => t.status === 'Resolvido').length;
  const criticos = tickets.filter(t => t.prioridade === 'Crítica').length;
  const medios = tickets.filter(t => t.prioridade === 'Média').length;
  const baixos = tickets.filter(t => t.prioridade === 'Baixa').length;

  return NextResponse.json({
    total,
    novos,
    em_atendimento,
    resolvidos,
    criticos,
    medios,
    baixos
  });
}
