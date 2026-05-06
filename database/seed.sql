-- -----------------------------------------------------
-- Script de População Inicial Unificado (Seed)
-- Pizzaria Madre Querida
-- -----------------------------------------------------

-- 1. USUÁRIOS DE ACESSO
DELETE FROM usuarios;
INSERT INTO usuarios (id_usuario, username, senha_hash, role) VALUES 
(1, 'admin', '$pbkdf2-sha256$29000$nDOmdE5pzbm39v4fIyTk3A$OkZNtzPo2TK.X4xB7652qm0gXLd53g8bfhAHEHu8y5U', 'admin'),
(2, 'equipe', '$pbkdf2-sha256$29000$obRWqjWm9F7L2dt77x1DCA$WwKglVxnvsLkUDQGpgptlDNdcTYkFd70qK/YsjoDDDU', 'funcionario');

-- 2. CONFIGURAÇÕES DO CARDÁPIO (TAMANHOS E BORDAS)
INSERT INTO tamanhos (id_tamanho, nome_tamanho, qtd_sabor_max) VALUES 
(1, 'Brotinho', 1),
(2, 'Média', 2),
(3, 'Grande', 3),
(4, 'Gigante', 4);

INSERT INTO bordas (id_borda, tipo, preco_adicional) VALUES 
(1, 'Sem Borda', 0.00),
(2, 'Catupiry', 5.00),
(3, 'Cheddar', 5.00),
(4, 'Chocolate', 7.00);

-- 3. PRODUTO BASE PARA PIZZAS (Obrigatório ID 1 para lógica do sistema)
INSERT INTO produtos (id_produto, nome, disponivel, tipo_produto) 
VALUES (1, 'Pizza Customizada', true, 'Pizza');

-- 4. SABORES
INSERT INTO sabores (id_sabor, nome_sabor, ingredientes, disponivel) VALUES 
(1, 'Calabresa', 'Molho de tomate, mussarela, calabresa fatiada e cebola.', true),
(2, 'Marguerita', 'Molho de tomate, mussarela, manjericão fresco e tomate.', true),
(3, 'Frango com Catupiry', 'Molho de tomate, mussarela, frango desfiado e catupiry original.', true),
(4, 'Portuguesa', 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitona.', true),
(5, 'Quatro Queijos', 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola.', true);

-- 5. MATRIZ DE PRECIFICAÇÃO (Sabor x Tamanho)
INSERT INTO precificado (id_sabor, id_tamanho, preco_base) VALUES 
(1, 1, 25.00), (1, 2, 40.00), (1, 3, 55.00),
(2, 1, 22.00), (2, 2, 38.00), (2, 3, 50.00),
(3, 1, 28.00), (3, 2, 45.00), (3, 3, 60.00),
(4, 1, 28.00), (4, 2, 45.00), (4, 3, 60.00),
(5, 1, 30.00), (5, 2, 48.00), (5, 3, 65.00);

-- 6. BEBIDAS (Produtos 2 a 5)
INSERT INTO produtos (id_produto, nome, disponivel, tipo_produto) VALUES 
(2, 'Coca-Cola 2L', true, 'Bebida'),
(3, 'Guaraná Antarctica 2L', true, 'Bebida'),
(4, 'Cerveja Heineken 330ml', true, 'Bebida'),
(5, 'Suco de Laranja 500ml', true, 'Bebida');

INSERT INTO bebidas (id_bebida, preco_venda, quantidade) VALUES 
(2, 12.00, 20),
(3, 10.00, 15),
(4, 9.00, 50),
(5, 7.00, 10);

-- 7. DADOS DE TESTE (CLIENTES E MOTOBOYS)
-- Cliente de Teste
INSERT INTO pessoas (cpf, nome) VALUES ('111.111.111-11', 'Cliente de Teste');
INSERT INTO clientes (cpf_cliente, saldo_pontos, ativo) VALUES ('111.111.111-11', 100, true);
INSERT INTO enderecos_pessoa (cpf_pessoa, logradouro, numero, bairro, cidade, cep, e_principal) VALUES 
('111.111.111-11', 'Rua das Flores', '500', 'Centro', 'São João del Rei', '36300-000', true);

-- Motoboys
INSERT INTO pessoas (cpf, nome) VALUES ('222.222.222-22', 'Carlos Entregador');
INSERT INTO funcionarios (cpf_funcionario, cargo, salario, ativo) VALUES ('222.222.222-22', 'Motoboy', 1800.00, true);
INSERT INTO motoboys (cpf_motoboy, placa_veiculo, tipo_vinculo) VALUES ('222.222.222-22', 'ABC-1234', 'Próprio');

INSERT INTO pessoas (cpf, nome) VALUES ('333.333.333-33', 'Ricardo Veloz');
INSERT INTO funcionarios (cpf_funcionario, cargo, salario, ativo) VALUES ('333.333.333-33', 'Motoboy', 1200.00, true);
INSERT INTO motoboys (cpf_motoboy, placa_veiculo, tipo_vinculo) VALUES ('333.333.333-33', 'XYZ-9999', 'Freelancer');
