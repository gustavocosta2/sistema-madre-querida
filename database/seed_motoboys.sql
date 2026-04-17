-- Inserindo Pessoas/Funcionários como Motoboys
-- Motoboy 1 (Fixo)
INSERT INTO pessoas (cpf, nome) VALUES ('222.222.222-22', 'Carlos Entregador') ON CONFLICT (cpf) DO NOTHING;
INSERT INTO funcionarios (cpf_funcionario, cargo, salario, ativo) VALUES ('222.222.222-22', 'Motoboy', 1800.00, true) ON CONFLICT (cpf_funcionario) DO NOTHING;
INSERT INTO motoboys (cpf_motoboy, placa_veiculo, tipo_vinculo) VALUES ('222.222.222-22', 'ABC-1234', 'Próprio') ON CONFLICT (cpf_motoboy) DO NOTHING;

-- Motoboy 2 (Freelancer)
-- Ajustado: Salário de 1.00 (simbólico) para passar na regra do banco (salario > 0)
INSERT INTO pessoas (cpf, nome) VALUES ('333.333.333-33', 'Ricardo Veloz') ON CONFLICT (cpf) DO NOTHING;
INSERT INTO funcionarios (cpf_funcionario, cargo, salario, ativo) VALUES ('333.333.333-33', 'Motoboy', 1.00, true) ON CONFLICT (cpf_funcionario) DO NOTHING;
INSERT INTO motoboys (cpf_motoboy, placa_veiculo, tipo_vinculo) VALUES ('333.333.333-33', 'XYZ-9999', 'Freelancer') ON CONFLICT (cpf_motoboy) DO NOTHING;
