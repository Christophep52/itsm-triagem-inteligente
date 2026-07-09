import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const ticketId = parseInt(id, 10);

    const index = (global._itsmTickets || []).findIndex(t => t.id === ticketId);
    if (index === -1) {
      return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });
    }

    if (body.status) {
      global._itsmTickets[index].status = body.status;
    }
    return NextResponse.json(global._itsmTickets[index]);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao atualizar chamado' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id, 10);
    global._itsmTickets = (global._itsmTickets || []).filter(t => t.id !== ticketId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao excluir chamado' }, { status: 500 });
  }
}
