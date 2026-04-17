-- -----------------------------------------------------
-- Script de Preços Completo (Fix)
-- Garante que TODOS os sabores tenham preços em TODOS os tamanhos
-- -----------------------------------------------------

-- Limpa preços antigos para não dar erro de duplicata
DELETE FROM precificado;

-- Sabores: 1 (Calabresa), 2 (Marguerita), 3 (Frango), 4 (Portuguesa), 5 (Quatro Queijos)
-- Tamanhos: 1 (Brotinho), 2 (Média), 3 (Grande), 4 (Gigante)

-- CALABRESA (Sabor 1)
INSERT INTO precificado (id_sabor, id_tamanho, preco_base) VALUES 
(1, 1, 25.00), (1, 2, 40.00), (1, 3, 55.00), (1, 4, 70.00);

-- MARGUERITA (Sabor 2)
INSERT INTO precificado (id_sabor, id_tamanho, preco_base) VALUES 
(2, 1, 22.00), (2, 2, 38.00), (2, 3, 50.00), (2, 4, 65.00);

-- FRANGO COM CATUPIRY (Sabor 3)
INSERT INTO precificado (id_sabor, id_tamanho, preco_base) VALUES 
(3, 1, 28.00), (3, 2, 45.00), (3, 3, 60.00), (3, 4, 75.00);

-- PORTUGUESA (Sabor 4)
INSERT INTO precificado (id_sabor, id_tamanho, preco_base) VALUES 
(4, 1, 28.00), (4, 2, 45.00), (4, 3, 60.00), (4, 4, 75.00);

-- QUATRO QUEIJOS (Sabor 5)
INSERT INTO precificado (id_sabor, id_tamanho, preco_base) VALUES 
(5, 1, 30.00), (5, 2, 48.00), (5, 3, 65.00), (5, 4, 80.00);
