from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models
import schemas
import database
import auth

router = APIRouter(tags=["RH & Equipe"], dependencies=[Depends(auth.get_current_user)])

@router.get("/funcionarios", response_model=List[schemas.FuncionarioResponse], dependencies=[Depends(auth.require_admin)])
def listar_funcionarios(db: Session = Depends(database.get_db)):
    q = db.query(
        models.Funcionario.cpf_funcionario.label("cpf"),
        models.Pessoa.nome,
        models.Funcionario.cargo,
        models.Funcionario.salario,
        models.Funcionario.ativo,
        models.Motoboy.placa_veiculo
    ).join(models.Pessoa, models.Funcionario.cpf_funcionario == models.Pessoa.cpf)\
     .outerjoin(models.Motoboy, models.Funcionario.cpf_funcionario == models.Motoboy.cpf_motoboy)\
     .all()
    return q

@router.post("/funcionarios", dependencies=[Depends(auth.require_admin)])
def criar_funcionario(f_in: schemas.FuncionarioCreate, db: Session = Depends(database.get_db)):
    try:
        pessoa = db.get(models.Pessoa, f_in.cpf)
        if not pessoa:
            pessoa = models.Pessoa(cpf=f_in.cpf, nome=f_in.nome)
            db.add(pessoa)
            db.flush()
        else:
            pessoa.nome = f_in.nome

        funcionario = db.get(models.Funcionario, f_in.cpf)
        if not funcionario:
            funcionario = models.Funcionario(cpf_funcionario=f_in.cpf, cargo=f_in.cargo, salario=f_in.salario)
            db.add(funcionario)
            db.flush()
        else:
            funcionario.cargo = f_in.cargo
            funcionario.salario = f_in.salario
            funcionario.ativo = True

        if f_in.cargo.lower() == "motoboy":
            motoboy = db.get(models.Motoboy, f_in.cpf)
            if not motoboy:
                db.add(models.Motoboy(cpf_motoboy=f_in.cpf, placa_veiculo=f_in.placa_veiculo or "---"))
            else:
                motoboy.placa_veiculo = f_in.placa_veiculo or "---"

        db.commit()
        return {"status": "sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))

@router.put("/funcionarios/{cpf}", dependencies=[Depends(auth.require_admin)])
def atualizar_funcionario(cpf: str, f_in: schemas.FuncionarioUpdate, db: Session = Depends(database.get_db)):
    try:
        pessoa = db.get(models.Pessoa, cpf)
        funcionario = db.get(models.Funcionario, cpf)
        if not pessoa or not funcionario: raise HTTPException(404, "Funcionário não encontrado")

        if f_in.nome: pessoa.nome = f_in.nome
        if f_in.cargo: funcionario.cargo = f_in.cargo
        if f_in.salario is not None: funcionario.salario = f_in.salario

        if (f_in.cargo and f_in.cargo.lower() == "motoboy"):
            motoboy = db.get(models.Motoboy, cpf)
            if not motoboy:
                db.add(models.Motoboy(cpf_motoboy=cpf, placa_veiculo=f_in.placa_veiculo or "---"))
            else:
                motoboy.placa_veiculo = f_in.placa_veiculo or "---"
        
        db.commit()
        return {"status": "sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, str(e))

@router.patch("/funcionarios/{cpf}/status", dependencies=[Depends(auth.require_admin)])
def toggle_funcionario_status(cpf: str, db: Session = Depends(database.get_db)):
    func = db.get(models.Funcionario, cpf)
    if not func: raise HTTPException(404, "Funcionário não encontrado")
    func.ativo = not func.ativo
    db.commit()
    return {"status": "sucesso", "novo_status": func.ativo}

@router.get("/motoboys")
def listar_motoboys(db: Session = Depends(database.get_db)):
    res = db.query(models.Pessoa.nome, models.Motoboy.cpf_motoboy, models.Motoboy.placa_veiculo)\
            .join(models.Funcionario, models.Motoboy.cpf_motoboy == models.Funcionario.cpf_funcionario)\
            .join(models.Pessoa, models.Funcionario.cpf_funcionario == models.Pessoa.cpf)\
            .filter(models.Funcionario.ativo == True).all()
    return [{"cpf": r.cpf_motoboy, "nome": r.nome, "placa": r.placa_veiculo} for r in res]

@router.get("/acerto_motoboys", dependencies=[Depends(auth.require_admin)])
def get_acerto_motoboys(db: Session = Depends(database.get_db)):
    hoje = func.current_date()
    res = db.query(
        models.Pessoa.nome,
        models.Pessoa.cpf,
        func.count(models.Pedido.id_pedido).label("total_entregas"),
        func.sum(models.Pedido.taxa_entrega).label("total_taxas")
    ).join(models.Motoboy, models.Pessoa.cpf == models.Motoboy.cpf_motoboy)\
     .join(models.Pedido, models.Motoboy.cpf_motoboy == models.Pedido.id_motoboy)\
     .filter(func.date(models.Pedido.data_hora_criacao) == hoje, models.Pedido.status == "Finalizado")\
     .group_by(models.Pessoa.nome, models.Pessoa.cpf).all()

    return [{"nome": r.nome, "cpf": r.cpf, "entregas": r.total_entregas, "valor_taxas": float(r.total_taxas or 0)} for r in res]
