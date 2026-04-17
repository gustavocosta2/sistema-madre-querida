-- -----------------------------------------------------
-- Esquema Físico: Pizzaria Madre Querida (PostgreSQL)
-- Versão: 2.2
-- -----------------------------------------------------

-- 0. LIMPEZA (FACILITA O RE-RUN DURANTE O DESENVOLVIMENTO)
DROP TABLE IF EXISTS promocao_produtos, promocao_sabores, promocao_tamanhos, promocoes CASCADE;
DROP TABLE IF EXISTS pizza_sabores, item_pizza_detalhe, itens_pedido, pagamentos, historico_status_pedido, pedidos CASCADE;
DROP TABLE IF EXISTS precificado, sabores, bordas, tamanhos, bebidas, produtos CASCADE;
DROP TABLE IF EXISTS motoboys, funcionarios, clientes, enderecos_pessoa, telefones_pessoa, pessoas CASCADE;
DROP TYPE IF EXISTS status_pedido_enum, origem_pedido_enum, tipo_vinculo_enum CASCADE;

-- 1. TIPOS CUSTOMIZADOS (ENGENHARIA DE ESTADOS)
CREATE TYPE status_pedido_enum AS ENUM ('Recebido', 'Em Preparo', 'Aguardando Entrega', 'Em Rota', 'Finalizado', 'Cancelado');
CREATE TYPE origem_pedido_enum AS ENUM ('WhatsApp', 'Telefone', 'Balcão', 'iFood');
CREATE TYPE tipo_vinculo_enum AS ENUM ('Próprio', 'Freelancer');

-- 2. MÓDULO DE PESSOAS E ATORES (HERANÇA E ENDEREÇAMENTO)
CREATE TABLE pessoas (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cpf_format CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' OR cpf ~ '^\d{11}$')
);

CREATE TABLE telefones_pessoa (
    id_telefone SERIAL PRIMARY KEY,
    cpf_pessoa VARCHAR(14) NOT NULL REFERENCES pessoas(cpf) ON DELETE CASCADE,
    numero VARCHAR(20) NOT NULL,
    tipo VARCHAR(20) -- Celular, Fixo, Trabalho
);

-- SUPORTE A MÚLTIPLOS ENDEREÇOS (Solução Sênior)
CREATE TABLE enderecos_pessoa (
    id_endereco SERIAL PRIMARY KEY,
    cpf_pessoa VARCHAR(14) NOT NULL REFERENCES pessoas(cpf) ON DELETE CASCADE,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(10),
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) DEFAULT 'São João del Rei',
    uf CHAR(2) DEFAULT 'MG',
    cep VARCHAR(9) NOT NULL,
    ponto_referencia TEXT,
    e_principal BOOLEAN DEFAULT FALSE
);

CREATE TABLE clientes (
    cpf_cliente VARCHAR(14) PRIMARY KEY REFERENCES pessoas(cpf) ON DELETE CASCADE,
    saldo_pontos INT DEFAULT 0 CHECK (saldo_pontos >= 0),
    ultima_visita TIMESTAMPTZ
);

CREATE TABLE funcionarios (
    cpf_funcionario VARCHAR(14) PRIMARY KEY REFERENCES pessoas(cpf) ON DELETE CASCADE,
    cargo VARCHAR(50) NOT NULL,
    salario NUMERIC(10,2) CHECK (salario > 0),
    data_admissao DATE DEFAULT CURRENT_DATE,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE motoboys (
    cpf_motoboy VARCHAR(14) PRIMARY KEY REFERENCES funcionarios(cpf_funcionario) ON DELETE CASCADE,
    placa_veiculo VARCHAR(10) NOT NULL UNIQUE,
    tipo_vinculo tipo_vinculo_enum DEFAULT 'Freelancer'
);

-- 3. MÓDULO DE PRODUTOS (CATÁLOGO DINÂMICO)
CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    descricao TEXT,
    tipo_produto VARCHAR(20) NOT NULL -- 'Bebida', 'Pizza', 'Adicional'
);

CREATE TABLE bebidas (
    id_bebida INT PRIMARY KEY REFERENCES produtos(id_produto) ON DELETE CASCADE,
    volume_ml INT NOT NULL CHECK (volume_ml > 0),
    preco_venda NUMERIC(10,2) NOT NULL CHECK (preco_venda >= 0)
);

CREATE TABLE tamanhos (
    id_tamanho SERIAL PRIMARY KEY,
    nome_tamanho VARCHAR(30) NOT NULL UNIQUE, 
    qtd_sabor_max INT NOT NULL CHECK (qtd_sabor_max > 0)
);

CREATE TABLE bordas (
    id_borda SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE,
    preco_adicional NUMERIC(10,2) DEFAULT 0.00 CHECK (preco_adicional >= 0)
);

CREATE TABLE sabores (
    id_sabor SERIAL PRIMARY KEY,
    nome_sabor VARCHAR(50) NOT NULL,
    ingredientes TEXT,
    disponivel BOOLEAN DEFAULT TRUE
);

-- MATRIZ DE PRECIFICAÇÃO (Crucial para o negócio)
CREATE TABLE precificado (
    id_sabor INT NOT NULL REFERENCES sabores(id_sabor) ON DELETE CASCADE,
    id_tamanho INT NOT NULL REFERENCES tamanhos(id_tamanho) ON DELETE CASCADE,
    preco_base NUMERIC(10,2) NOT NULL CHECK (preco_base > 0),
    PRIMARY KEY (id_sabor, id_tamanho)
);

-- 4. MÓDULO OPERACIONAL (VENDAS E RASTREABILIDADE)
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente VARCHAR(14) REFERENCES clientes(cpf_cliente),
    id_motoboy VARCHAR(14) REFERENCES motoboys(cpf_motoboy),
    id_endereco_entrega INT REFERENCES enderecos_pessoa(id_endereco),
    status status_pedido_enum DEFAULT 'Recebido',
    origem origem_pedido_enum DEFAULT 'WhatsApp',
    valor_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
    valor_recebido NUMERIC(10,2) CHECK (valor_recebido >= 0),
    troco NUMERIC(10,2) DEFAULT 0 CHECK (troco >= 0),
    taxa_entrega NUMERIC(10,2) DEFAULT 0 CHECK (taxa_entrega >= 0),
    data_hora_criacao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- O "FILME" (Histórico de Status para Auditoria/BI)
CREATE TABLE historico_status_pedido (
    id_historico SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    status status_pedido_enum NOT NULL,
    data_hora TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT
);

CREATE TABLE pagamentos (
    id_pagamento SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    forma_pagamento VARCHAR(30) NOT NULL, -- Dinheiro, PIX, Débito, Crédito
    valor_pago NUMERIC(10,2) NOT NULL CHECK (valor_pago > 0)
);

-- REGISTRO DE ITENS COM PREÇO HISTÓRICO (Auditável)
CREATE TABLE itens_pedido (
    id_item SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_produto INT NOT NULL REFERENCES produtos(id_produto),
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario_vendido NUMERIC(10,2) NOT NULL CHECK (preco_unitario_vendido >= 0),
    observacao TEXT,
    subtotal_item NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario_vendido) STORED
);

-- DETALHAMENTO DE PIZZAS CUSTOMIZADAS
CREATE TABLE item_pizza_detalhe (
    id_item INT PRIMARY KEY REFERENCES itens_pedido(id_item) ON DELETE CASCADE,
    id_tamanho INT NOT NULL REFERENCES tamanhos(id_tamanho),
    id_borda INT REFERENCES bordas(id_borda)
);

-- SABORES DA PIZZA (Permite frações: 1/2, 1/3, etc)
CREATE TABLE pizza_sabores (
    id_item INT NOT NULL REFERENCES item_pizza_detalhe(id_item) ON DELETE CASCADE,
    id_sabor INT NOT NULL REFERENCES sabores(id_sabor),
    fracao NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (fracao > 0 AND fracao <= 1.00),
    PRIMARY KEY (id_item, id_sabor)
);

-- 5. ÍNDICES DE PERFORMANCE (VELOCIDADE DE RESPOSTA)
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX idx_pedidos_data ON pedidos(data_hora_criacao);
CREATE INDEX idx_produtos_tipo ON produtos(tipo_produto);
CREATE INDEX idx_enderecos_cliente ON enderecos_pessoa(cpf_pessoa);
CREATE INDEX idx_historico_pedido ON historico_status_pedido(id_pedido);

-- 6. METADADOS E DOCUMENTAÇÃO
COMMENT ON TABLE historico_status_pedido IS 'Armazena cada mudança de estado do pedido para cálculo de tempo de entrega e auditoria.';
COMMENT ON COLUMN itens_pedido.preco_unitario_vendido IS 'Congela o preço do produto no ato da venda para evitar distorções em relatórios futuros.';
