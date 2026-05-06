-- -----------------------------------------------------
-- Esquema Físico: Pizzaria Madre Querida (PostgreSQL)
-- -----------------------------------------------------

-- 0. LIMPEZA (FACILITA O RE-RUN DURANTE O DESENVOLVIMENTO)
DROP TABLE IF EXISTS promocao_tamanhos CASCADE;
DROP TABLE IF EXISTS promocao_sabores CASCADE;
DROP TABLE IF EXISTS promocao_produtos CASCADE;
DROP TABLE IF EXISTS promocoes CASCADE;
DROP TABLE IF EXISTS pizza_sabores CASCADE;
DROP TABLE IF EXISTS item_pizza_detalhe CASCADE;
DROP TABLE IF EXISTS itens_pedido CASCADE;
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS historico_status_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS precificado CASCADE;
DROP TABLE IF EXISTS sabores CASCADE;
DROP TABLE IF EXISTS bordas CASCADE;
DROP TABLE IF EXISTS tamanhos CASCADE;
DROP TABLE IF EXISTS bebidas CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS motoboys CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS telefones_pessoa CASCADE;
DROP TABLE IF EXISTS enderecos_pessoa CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS pessoas CASCADE;
DROP TYPE IF EXISTS status_pedido_enum CASCADE;
DROP TYPE IF EXISTS origem_pedido_enum CASCADE;

-- 1. ENUMS (GARANTEM INTEGRIDADE NOS ESTADOS)
CREATE TYPE status_pedido_enum AS ENUM (
    'Recebido', 'Em Preparo', 'Aguardando Entrega', 'Em Rota', 'Finalizado', 'Cancelado'
);

CREATE TYPE origem_pedido_enum AS ENUM (
    'WhatsApp', 'Telefone', 'Balcão', 'iFood'
);

-- 2. MÓDULO DE SEGURANÇA E ACESSO
CREATE TABLE pessoas (
    cpf VARCHAR(14) PRIMARY KEY, -- Formato: 000.000.000-00
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'funcionario', -- 'admin', 'funcionario'
    ativo BOOLEAN DEFAULT TRUE,
    ultima_login TIMESTAMPTZ
);

CREATE TABLE enderecos_pessoa (
    id_endereco SERIAL PRIMARY KEY,
    cpf_pessoa VARCHAR(14) NOT NULL CONSTRAINT fk_enderecos_pessoa_pessoas REFERENCES pessoas(cpf) ON DELETE CASCADE,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(50),
    cidade VARCHAR(50) DEFAULT 'São João del Rei',
    cep VARCHAR(9),
    ponto_referencia TEXT,
    e_principal BOOLEAN DEFAULT FALSE
);

CREATE TABLE telefones_pessoa (
    id_telefone SERIAL PRIMARY KEY,
    cpf_pessoa VARCHAR(14) NOT NULL CONSTRAINT fk_telefones_pessoa_pessoas REFERENCES pessoas(cpf) ON DELETE CASCADE,
    numero VARCHAR(20) NOT NULL,
    e_principal BOOLEAN DEFAULT FALSE
);

-- 3. MÓDULO DE CRM E RH
CREATE TABLE clientes (
    cpf_cliente VARCHAR(14) PRIMARY KEY CONSTRAINT fk_clientes_pessoas REFERENCES pessoas(cpf) ON DELETE CASCADE,
    saldo_pontos INTEGER DEFAULT 0,
    ultima_visita TIMESTAMPTZ,
    observacao TEXT,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE funcionarios (
    cpf_funcionario VARCHAR(14) PRIMARY KEY CONSTRAINT fk_funcionarios_pessoas REFERENCES pessoas(cpf) ON DELETE CASCADE,
    cargo VARCHAR(50),
    salario NUMERIC(10,2),
    data_admissao DATE DEFAULT CURRENT_DATE,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE motoboys (
    cpf_motoboy VARCHAR(14) PRIMARY KEY CONSTRAINT fk_motoboys_funcionarios REFERENCES funcionarios(cpf_funcionario) ON DELETE CASCADE,
    placa_veiculo VARCHAR(10) NOT NULL,
    tipo_vinculo VARCHAR(20) DEFAULT 'Freelancer' -- 'Próprio', 'Freelancer'
);

-- 3. MÓDULO DE PRODUTOS E CARDÁPIO
CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    descricao TEXT,
    tipo_produto VARCHAR(20) NOT NULL, -- 'Bebida', 'Pizza', 'Adicional'
    preco_pontos INTEGER DEFAULT 0     -- Custo para resgate via pontos
);

CREATE TABLE bebidas (
    id_bebida INT PRIMARY KEY CONSTRAINT fk_bebidas_produtos REFERENCES produtos(id_produto) ON DELETE CASCADE,
    preco_venda NUMERIC(10,2) NOT NULL CHECK (preco_venda >= 0),
    quantidade INT NOT NULL DEFAULT 0 CHECK (quantidade >= 0)
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
    disponivel BOOLEAN DEFAULT TRUE,
    preco_pontos INTEGER DEFAULT 0     -- Custo para resgate via pontos
);

-- MATRIZ DE PRECIFICAÇÃO (Crucial para o negócio)
CREATE TABLE precificado (
    id_sabor INT NOT NULL CONSTRAINT fk_precificado_sabores REFERENCES sabores(id_sabor) ON DELETE CASCADE,
    id_tamanho INT NOT NULL CONSTRAINT fk_precificado_tamanhos REFERENCES tamanhos(id_tamanho) ON DELETE CASCADE,
    preco_base NUMERIC(10,2) NOT NULL CHECK (preco_base > 0),
    PRIMARY KEY (id_sabor, id_tamanho)
);

-- MÓDULO DE PROMOÇÕES
CREATE TABLE promocoes (
    id_promo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    valor_desconto NUMERIC(10,2) NOT NULL CHECK (valor_desconto >= 0)
);

CREATE TABLE promocao_produtos (
    id_promo INT NOT NULL CONSTRAINT fk_promocao_produtos_promocoes REFERENCES promocoes(id_promo) ON DELETE CASCADE,
    id_produto INT NOT NULL CONSTRAINT fk_promocao_produtos_produtos REFERENCES produtos(id_produto) ON DELETE CASCADE,
    PRIMARY KEY (id_promo, id_produto)
);

CREATE TABLE promocao_sabores (
    id_promo INT NOT NULL CONSTRAINT fk_promocao_sabores_promocoes REFERENCES promocoes(id_promo) ON DELETE CASCADE,
    id_sabor INT NOT NULL CONSTRAINT fk_promocao_sabores_sabores REFERENCES sabores(id_sabor) ON DELETE CASCADE,
    PRIMARY KEY (id_promo, id_sabor)
);

CREATE TABLE promocao_tamanhos (
    id_promo INT NOT NULL CONSTRAINT fk_promocao_tamanhos_promocoes REFERENCES promocoes(id_promo) ON DELETE CASCADE,
    id_tamanho INT NOT NULL CONSTRAINT fk_promocao_tamanhos_tamanhos REFERENCES tamanhos(id_tamanho) ON DELETE CASCADE,
    PRIMARY KEY (id_promo, id_tamanho)
);

-- 4. MÓDULO OPERACIONAL (VENDAS E RASTREABILIDADE)
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente VARCHAR(14) CONSTRAINT fk_pedidos_clientes REFERENCES clientes(cpf_cliente) ON DELETE RESTRICT,
    id_motoboy VARCHAR(14) CONSTRAINT fk_pedidos_motoboys REFERENCES motoboys(cpf_motoboy) ON DELETE RESTRICT,
    id_endereco_entrega INT CONSTRAINT fk_pedidos_enderecos_pessoa REFERENCES enderecos_pessoa(id_endereco) ON DELETE RESTRICT,
    status status_pedido_enum DEFAULT 'Recebido',
    origem origem_pedido_enum DEFAULT 'WhatsApp',
    valor_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
    valor_recebido NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor_recebido >= 0),
    troco NUMERIC(10,2) DEFAULT 0 CHECK (troco >= 0),
    taxa_entrega NUMERIC(10,2) DEFAULT 0 CHECK (taxa_entrega >= 0),
    quilometragem NUMERIC(10,2) DEFAULT 0 CHECK (quilometragem >= 0),
    pontos_resgatados INTEGER DEFAULT 0,
    data_hora_criacao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- O "FILME" (Histórico de Status para Auditoria/BI)
CREATE TABLE historico_status_pedido (
    id_historico SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL CONSTRAINT fk_historico_status_pedido_pedidos REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    status status_pedido_enum NOT NULL,
    data_hora TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT
);

CREATE TABLE pagamentos (
    id_pagamento SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL CONSTRAINT fk_pagamentos_pedidos REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    forma_pagamento VARCHAR(30) NOT NULL, -- Dinheiro, PIX, Débito, Crédito
    valor_pago NUMERIC(10,2) NOT NULL CHECK (valor_pago > 0)
);

-- ITENS DO PEDIDO (Fração para Meio a Meio)
CREATE TABLE itens_pedido (
    id_item SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL CONSTRAINT fk_itens_pedido_pedidos REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_produto INT NOT NULL CONSTRAINT fk_itens_pedido_produtos REFERENCES produtos(id_produto),
    tipo_item VARCHAR(20), -- 'Pizza', 'Bebida'
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    preco_unitario_vendido NUMERIC(10,2) NOT NULL, -- Congela o preço no ato da venda
    observacao TEXT
);

-- Detalhes exclusivos para itens do tipo 'Pizza'
CREATE TABLE item_pizza_detalhe (
    id_item INT PRIMARY KEY CONSTRAINT fk_item_pizza_detalhe_itens_pedido REFERENCES itens_pedido(id_item) ON DELETE CASCADE,
    id_tamanho INT NOT NULL CONSTRAINT fk_item_pizza_detalhe_tamanhos REFERENCES tamanhos(id_tamanho),
    id_borda INT CONSTRAINT fk_item_pizza_detalhe_bordas REFERENCES bordas(id_borda)
);

-- Junção de sabores para cada item pizza (N:N)
CREATE TABLE pizza_sabores (
    id_item INT NOT NULL CONSTRAINT fk_pizza_sabores_item_pizza_detalhe REFERENCES item_pizza_detalhe(id_item) ON DELETE CASCADE,
    id_sabor INT NOT NULL CONSTRAINT fk_pizza_sabores_sabores REFERENCES sabores(id_sabor),
    fracao NUMERIC(3,2) NOT NULL DEFAULT 1.00, -- 1.00 (inteira), 0.50 (meio a meio)
    PRIMARY KEY (id_item, id_sabor)
);

-- 5. MÓDULO FINANCEIRO E CONTROLE DE CAIXA
CREATE TABLE caixas (
    id_caixa SERIAL PRIMARY KEY,
    id_usuario_abertura INT NOT NULL CONSTRAINT fk_caixas_usuarios_abertura REFERENCES usuarios(id_usuario),
    id_usuario_fechamento INT CONSTRAINT fk_caixas_usuarios_fechamento REFERENCES usuarios(id_usuario),
    data_abertura TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMPTZ,
    valor_abertura NUMERIC(10,2) DEFAULT 0.00,
    valor_fechamento_esperado NUMERIC(10,2) DEFAULT 0.00,
    valor_fechamento_informado NUMERIC(10,2),
    status VARCHAR(20) DEFAULT 'Aberto',
    observacao TEXT
);

CREATE TABLE fluxo_caixa (
    id_movimentacao SERIAL PRIMARY KEY,
    id_caixa INT NOT NULL CONSTRAINT fk_fluxo_caixa_caixas REFERENCES caixas(id_caixa) ON DELETE RESTRICT,
    id_pedido INT CONSTRAINT fk_fluxo_caixa_pedidos REFERENCES pedidos(id_pedido) ON DELETE SET NULL,
    tipo_movimentacao VARCHAR(20) NOT NULL, -- 'Entrada Venda', 'Suprimento', 'Sangria', 'Acerto Motoboy'
    forma_pagamento VARCHAR(30) NOT NULL,
    valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    descricao VARCHAR(255),
    data_hora TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. DOCUMENTAÇÃO ADICIONAL (COMENTÁRIOS PARA AUDITORIA)
COMMENT ON TABLE historico_status_pedido IS 'Armazena cada mudança de estado do pedido para cálculo de tempo de entrega e auditoria.';
COMMENT ON COLUMN itens_pedido.preco_unitario_vendido IS 'Congela o preço do produto no ato da venda para evitar distorções em relatórios futuros.';
