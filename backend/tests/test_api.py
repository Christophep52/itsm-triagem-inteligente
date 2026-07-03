import pytest
from fastapi.testclient import TestClient
from main import app
from triage import triagem_automatica

client = TestClient(app)


def test_triage_engine_network_critical():
    res = triagem_automatica("O servidor caiu e estamos com a empresa inteira fora do ar sem internet")
    assert res.categoria == "Rede"
    assert res.prioridade == "Crítica"
    assert res.confianca > 0.5


def test_triage_engine_hardware():
    res = triagem_automatica("A impressora está superaquecendo e não liga")
    assert res.categoria == "Hardware"


def test_create_ticket_api():
    payload = {
        "descricao": "Servidor principal sem acesso, firewall bloqueando tudo",
        "solicitante": "Engenheiro de Redes"
    }
    response = client.post("/tickets", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["descricao"] == payload["descricao"]
    assert data["solicitante"] == payload["solicitante"]
    assert "id" in data
    assert data["status"] == "Novo"


def test_list_tickets():
    response = client.get("/tickets")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_stats():
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "novos" in data
    assert "em_atendimento" in data
    assert "resolvidos" in data


def test_update_ticket():
    # Create first
    payload = {"descricao": "Teste de atualização", "solicitante": "Tester"}
    create_res = client.post("/tickets", json=payload)
    ticket_id = create_res.json()["id"]

    # Update
    update_res = client.patch(f"/tickets/{ticket_id}", json={"status": "Resolvido"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Resolvido"


def test_delete_ticket():
    # Create first
    payload = {"descricao": "Teste de deleção", "solicitante": "Tester"}
    create_res = client.post("/tickets", json=payload)
    ticket_id = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/tickets/{ticket_id}")
    assert del_res.status_code == 200

    # Verify deleted
    list_res = client.get("/tickets")
    ids = [t["id"] for t in list_res.json()]
    assert ticket_id not in ids
