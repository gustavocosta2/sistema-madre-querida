from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
import schemas
import database
import auth

router = APIRouter(tags=["Clientes & Endereços"], dependencies=[Depends(auth.get_current_user)])

@router.get("/clientes/buscar/{termo}")
def buscar_clientes(termo: str, db: Session = Depends(database.get_db)):
    q = db.query(models.Cliente).join(models.Pessoa).filter((models.Pessoa.cpf.like(f"%{termo}%")) | (models.Pessoa.nome.ilike(f"%{termo}%"))).all()
    return [{
        "cpf": c.cpf_cliente, 
        "nome": c.pessoa.nome, 
        "pontos": c.saldo_pontos,
        "data_nascimento": c.pessoa.data_nascimento.isoformat() if c.pessoa.data_nascimento else None,
        "observacao": c.observacao
    } for c in q]

@router.patch("/clientes/{cpf}/crm")
def update_cliente_crm(cpf: str, payload: dict, db: Session = Depends(database.get_db)):
    cliente = db.get(models.Cliente, cpf)
    if not cliente: raise HTTPException(404, "Cliente não encontrado")
    
    if "observacao" in payload:
        cliente.observacao = payload["observacao"]
    
    if "data_nascimento" in payload and payload["data_nascimento"]:
        from datetime import date
        cliente.pessoa.data_nascimento = date.fromisoformat(payload["data_nascimento"])
    
    db.commit()
    return {"status": "sucesso"}

@router.get("/clientes/{cpf}/ultimo_pedido")
def ultimo_pedido_cliente(cpf: str, db: Session = Depends(database.get_db)):
    p = db.query(models.Pedido).filter(
        models.Pedido.id_cliente == cpf,
        models.Pedido.status == "Finalizado"
    ).order_by(models.Pedido.data_hora_criacao.desc()).first()
    
    if not p: return None
    
    resumo = []
    for it in p.itens:
        if it.tipo_item == 'Pizza':
            sabores = [s.sabor.nome_sabor for s in it.detalhe_pizza.sabores]
            resumo.append(f"Pizza {it.detalhe_pizza.tamanho.nome_tamanho} ({' / '.join(sabores)})")
        else:
            resumo.append(f"{it.bebida.produto.nome}")

    return {
        "id": p.id_pedido,
        "data": p.data_hora_criacao,
        "resumo_itens": ", ".join(resumo)
    }

@router.get("/clientes/{cpf}/enderecos")
def listar_enderecos_cliente(cpf: str, db: Session = Depends(database.get_db)):
    return db.query(models.Endereco).filter(models.Endereco.cpf_pessoa == cpf).all()

@router.post("/enderecos")
def criar_endereco(e_in: schemas.EnderecoCreate, db: Session = Depends(database.get_db)):
    novo = models.Endereco(**e_in.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.post("/clientes/completo")
def criar_cliente_completo(c_in: schemas.ClienteCompletoCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cria ou Atualiza Pessoa
        pessoa = db.get(models.Pessoa, c_in.cpf)
        if not pessoa:
            pessoa = models.Pessoa(cpf=c_in.cpf, nome=c_in.nome, data_nascimento=c_in.data_nascimento)
            db.add(pessoa)
            db.flush()
        else:
            pessoa.nome = c_in.nome
            pessoa.data_nascimento = c_in.data_nascimento

        # 2. Cria ou Atualiza Cliente
        cliente = db.get(models.Cliente, c_in.cpf)
        if not cliente:
            cliente = models.Cliente(cpf_cliente=c_in.cpf, observacao=c_in.observacao)
            db.add(cliente)
            db.flush()
        else:
            cliente.observacao = c_in.observacao

        # 3. Cria Endereço
        novo_end = models.Endereco(
            cpf_pessoa=c_in.cpf,
            logradouro=c_in.logradouro,
            numero=c_in.numero,
            complemento=c_in.complemento,
            bairro=c_in.bairro,
            cep=c_in.cep,
            ponto_referencia=c_in.ponto_referencia,
            e_principal=True
        )
        db.add(novo_end)
        db.flush()

        # 4. Cadastra Telefone se fornecido
        if c_in.telefones:
            for tel in c_in.telefones:
                db.add(models.Telefone(cpf_pessoa=c_in.cpf, numero=tel, e_principal=True))
        
        db.commit()
        return {"status": "sucesso", "id_endereco": novo_end.id_endereco}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))
