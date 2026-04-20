-- Inserindo múltiplos endereços para o cliente de teste
-- Cliente: 111.111.111-11

-- Endereço 1: Casa
INSERT INTO enderecos_pessoa (cpf_pessoa, logradouro, numero, bairro, cidade, cep, ponto_referencia, e_principal) 
VALUES ('111.111.111-11', 'Rua das Flores', '500', 'Centro', 'São João del Rei', '36300-000', 'Perto da Praça', true)
ON CONFLICT DO NOTHING;

-- Endereço 2: Trabalho
INSERT INTO enderecos_pessoa (cpf_pessoa, logradouro, numero, bairro, cidade, cep, ponto_referencia, e_principal) 
VALUES ('111.111.111-11', 'Av. Industrial', '1000', 'Distrito', 'São João del Rei', '36300-100', 'Fábrica de Tecidos', false)
ON CONFLICT DO NOTHING;
