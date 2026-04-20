from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

# --- LEITURA ---
class Sabor(BaseModel):
    id_sabor: int
    nome_sabor: str
    ingredientes: Optional[str]
    disponivel: bool = True
    class Config: from_attributes = True

class Tamanho(BaseModel):
    id_tamanho: int
    nome_tamanho: str
    qtd_sabor_max: int
    class Config: from_attributes = True

class Borda(BaseModel):
    id_borda: int
    tipo: str
    preco_adicional: Decimal
    class Config: from_attributes = True

class Precificado(BaseModel):
    id_sabor: int
    id_tamanho: int
    preco_base: Decimal
    class Config: from_attributes = True

# --- SEGURANÇA / CRM ---
class EnderecoCreate(BaseModel):
    cpf_pessoa: str
    logradouro: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cep: str
    ponto_referencia: Optional[str] = None

class ClienteCompletoCreate(BaseModel):
    cpf: str
    nome: str
    logradouro: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cep: str
    ponto_referencia: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

# --- CRIAÇÃO DE PEDIDO (REFATORADO) ---
class ItemPedidoCreate(BaseModel):
    tipo: str  # "pizza" ou "bebida"
    id_produto: Optional[int] = None  # Usado para bebidas
    sabores: Optional[List[int]] = []  # Lista de IDs de sabores para pizzas
    id_tamanho: Optional[int] = None
    id_borda: Optional[int] = None
    preco: Decimal

class PedidoCreate(BaseModel):
    cpf_cliente: str
    id_endereco_entrega: int
    itens: List[ItemPedidoCreate]
