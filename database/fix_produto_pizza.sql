-- Garante que o ID 1 seja uma Pizza Customizada
-- Primeiro, removemos qualquer coisa que use o ID 1 para evitar conflitos
DELETE FROM bebidas WHERE id_bebida = 1;
DELETE FROM produtos WHERE id_produto = 1;

-- Insere o produto base para todas as pizzas
INSERT INTO produtos (id_produto, nome, disponivel, tipo_produto) 
VALUES (1, 'Pizza Customizada', true, 'Pizza');
