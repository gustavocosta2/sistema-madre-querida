-- -----------------------------------------------------
-- Script de População Inicial (Seed)
-- Pizzaria Madre Querida
-- -----------------------------------------------------

-- 1. Inserir Tamanhos
INSERT INTO tamanhos (nome_tamanho, qtd_sabor_max) VALUES 
('Brotinho', 1),
('Média', 2),
('Grande', 3),
('Gigante', 4);

-- 2. Inserir Sabores
INSERT INTO sabores (nome_sabor, ingredientes, disponivel) VALUES 
('Calabresa', 'Molho de tomate, mussarela, calabresa fatiada e cebola.', true),
('Marguerita', 'Molho de tomate, mussarela, manjericão fresco e tomate.', true),
('Frango com Catupiry', 'Molho de tomate, mussarela, frango desfiado e catupiry original.', true),
('Portuguesa', 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitona.', true),
('Quatro Queijos', 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola.', true);

-- 3. Inserir Bordas
INSERT INTO bordas (tipo, preco_adicional) VALUES 
('Sem Borda', 0.00),
('Catupiry', 5.00),
('Cheddar', 5.00),
('Chocolate', 7.00);

-- 4. Matriz de Precificação (Exemplo para Calabresa e Marguerita)
-- id_sabor 1 (Calabresa), id_sabor 2 (Marguerita)
INSERT INTO precificado (id_sabor, id_tamanho, preco_base) VALUES 
(1, 1, 25.00), -- Calabresa Brotinho
(1, 2, 40.00), -- Calabresa Média
(1, 3, 55.00), -- Calabresa Grande
(2, 1, 22.00), -- Marguerita Brotinho
(2, 2, 38.00), -- Marguerita Média
(2, 3, 50.00); -- Marguerita Grande

-- 5. Produtos (Bebidas)
INSERT INTO produtos (nome, disponivel, descricao, tipo_produto) VALUES 
('Coca-Cola 2L', true, 'Refrigerante pet 2 litros', 'Bebida'),
('Guaraná Antarctica 2L', true, 'Refrigerante pet 2 litros', 'Bebida'),
('Cerveja Heineken 330ml', true, 'Long neck', 'Bebida'),
('Suco de Laranja 500ml', true, 'Suco natural', 'Bebida');

-- Detalhamento das Bebidas (Preços e Volumes)
-- Os IDs serão 1, 2, 3, 4 se o banco estiver limpo
INSERT INTO bebidas (id_bebida, preco_venda) VALUES 
(1, 12.00),
(2, 10.00),
(3, 9.00),
(4, 7.00);

-- 6. Cliente de Teste
INSERT INTO pessoas (cpf, nome) VALUES ('111.111.111-11', 'Cliente de Teste');
INSERT INTO clientes (cpf_cliente, saldo_pontos) VALUES ('111.111.111-11', 10);
INSERT INTO enderecos_pessoa (cpf_pessoa, logradouro, numero, bairro, cep) VALUES 
('111.111.111-11', 'Rua das Pizzas', '123', 'Centro', '36300-000');
11-11', 'Rua das Pizzas', '123', 'Centro', '36300-000');

-- 7. Usuários de Acesso ao Sistema
INSERT INTO usuarios (username, senha_hash, role) VALUES 
('admin', 'pbkdf2_sha256$600000$z8I6Oa8Ua8uS$36e9c1d0f8d0f1f1d9e7b6d0e9a1c1d0f8d0f1f1d9e7b6d0e9a1c1d0f8d0f1f1', 'admin'),
('equipe', 'pbkdf2_sha256$600000$oP8e3Xz2a8uS$47f0d2e1c9d0f1f1d9e7b6d0e9a1c1d0f8d0f1f1d9e7b6d0e9a1c1d0f8d0f1f1', 'funcionario');


-- Versão final com hashes reais
DELETE FROM usuarios WHERE username IN ("admin", "equipe");
INSERT INTO usuarios (username, senha_hash, role) VALUES ("admin", "$pbkdf2-sha256$29000$nDOmdE5pzbm39v4fIyTk3A$OkZNtzPo2TK.X4xB7652qm0gXLd53g8bfhAHEHu8y5U", "admin");
INSERT INTO usuarios (username, senha_hash, role) VALUES ("equipe", "$pbkdf2-sha256$29000$t3aO0XovpbT2fk/J2Zszpg$Dgwgsfqq0DdO5Bfh.EsgHOjvsbk0ltO1c1ixvGkV9.o", "funcionario");
