# Documentação do Modelo Lógico: Pizzaria Madre Querida
**Projeto:** Pizzaria Madre Querida  
**SGBD:** PostgreSQL 15  
**Contexto:** Gestão completa de delivery com rastreabilidade operacional e imutabilidade financeira.

![Diagrama Lógico Pizzaria](diagrama-logico-pizzaria.png)

---

## 1. Domínios de Dados (Enums / Tipos)

### `status_pedido_enum`
Controla os estados válidos de um pedido no fluxo operacional.
*   **Recebido**: Pedido registrado, aguardando início da produção.
*   **Em Preparo**: O item está sendo montado ou está no forno.
*   **Aguardando Entrega**: Produção finalizada, aguardando coleta do motoboy.
*   **Em Rota**: Pedido em trânsito (logística externa).
*   **Finalizado**: Pedido entregue e pago.
*   **Cancelado**: Pedido interrompido por erro ou desistência.

### `origem_pedido_enum`
Identifica o canal de entrada da venda para análise de conversão.
*   **WhatsApp**: Venda manual via chat.
*   **Telefone**: Venda manual via voz.
*   **Balcão**: Retirada presencial ou consumo local.
*   **iFood**: Venda via marketplace externo.

---

## 2. Estrutura das Tabelas

### 2.1 Módulo de Identificação e Segurança

#### Tabela: `pessoas`
Raiz da generalização de seres humanos no sistema.
*   **`cpf`** (VARCHAR(14)): **PK**. Identificador único nacional. Garante histórico unificado.
*   **`nome`** (VARCHAR(100)): **NOT NULL**. Nome completo.
*   **`data_nascimento`** (DATE): Data para CRM e fidelidade.
*   **`criado_em`** (TIMESTAMPTZ): Data de entrada no sistema.

#### Tabela: `usuarios`
Contas de acesso ao sistema.
*   **`id_usuario`** (SERIAL): **PK**.
*   **`username`** (VARCHAR(50)): **UNIQUE / NOT NULL**.
*   **`senha_hash`** (VARCHAR(255)): PBKDF2.
*   **`role`** (VARCHAR(20)): 'admin' ou 'funcionario'.
*   **`ativo`** (BOOLEAN): Controle de acesso.
*   **`ultima_login`** (TIMESTAMPTZ): Registro do último acesso bem-sucedido.

#### Tabela: `telefones_pessoa`
*   **`id_telefone`** (SERIAL): **PK**.
*   **`cpf_pessoa`** (VARCHAR(14)): **FK** para `pessoas`.
*   **`numero`** (VARCHAR(20)): **NOT NULL**.
*   **`e_principal`** (BOOLEAN): Destaque no PDV.

#### Tabela: `enderecos_pessoa`
*   **`id_endereco`** (SERIAL): **PK**.
*   **`cpf_pessoa`** (VARCHAR(14)): **FK** para `pessoas`.
*   **`logradouro`** (VARCHAR(100)): Rua/Avenida.
*   **`numero`** (VARCHAR(10)): Número ou S/N.
*   **`bairro`** (VARCHAR(50)): Bairro para logística.
*   **`ponto_referencia`** (TEXT): Apoio ao motoboy.
*   **`e_principal`** (BOOLEAN): Endereço padrão.

---

### 2.2 Módulo de CRM e Recursos Humanos

#### Tabela: `clientes`
*   **`cpf_cliente`** (VARCHAR(14)): **PK / FK** para `pessoas`.
*   **`saldo_pontos`** (INTEGER): Acúmulo de fidelidade.
*   **`observacao`** (TEXT): Notas de preferência do cliente.
*   **`ativo`** (BOOLEAN): Status do cliente na base.
*   **`ultima_visita`** (TIMESTAMPTZ): Automatizado pela última venda.

#### Tabela: `funcionarios`
*   **`cpf_funcionario`** (VARCHAR(14)): **PK / FK** para `pessoas`.
*   **`cargo`** (VARCHAR(50)): Função na pizzaria.
*   **`salario`** (NUMERIC(10,2)): Valor bruto mensal.
*   **`data_admissao`** (DATE): Data de contratação.
*   **`ativo`** (BOOLEAN): Vínculo ativo/inativo.

#### Tabela: `motoboys`
*   **`cpf_motoboy`** (VARCHAR(14)): **PK / FK** para `funcionarios`.
*   **`placa_veiculo`** (VARCHAR(10)): Identificação da moto.
*   **`tipo_vinculo`** (VARCHAR(20)): 'Próprio' ou 'Freelancer'.

---

### 2.3 Módulo de Catálogo e Precificação

#### Tabela: `produtos`
*   **`id_produto`** (SERIAL): **PK**.
*   **`nome`** (VARCHAR(100)): Nome comercial.
*   **`tipo_produto`** (VARCHAR(20)): 'Pizza', 'Bebida', 'Acompanhamento'.
*   **`preco_pontos`** (INTEGER): Custo para resgate fidelidade.

#### Tabela: `bebidas`
*   **`id_bebida`** (INT): **PK / FK** para `produtos`.
*   **`volume_ml`** (INT): Capacidade.
*   **`preco_venda`** (NUMERIC(10,2)): Preço unitário.
*   **`quantidade`** (INT): **Estoque Atual**.

#### Tabela: `sabores`
*   **`id_sabor`** (INT): **PK**.
*   **`nome_sabor`** (VARCHAR(50)): Nome da pizza.
*   **`ingredientes`** (TEXT): Composição detalhada.
*   **`disponivel`** (BOOLEAN): Status de venda.
*   **`preco_pontos`** (INTEGER): Custo de resgate do sabor.

#### Tabela: `precificado`
*   **`id_sabor`** (INT): **PK / FK**.
*   **`id_tamanho`** (INT): **PK / FK**.
*   **`preco_base`** (NUMERIC(10,2)): Valor da combinação Sabor/Tamanho.

---

### 2.4 Módulo de Vendas e Operação

#### Tabela: `pedidos`
*   **`id_pedido`** (SERIAL): **PK**.
*   **`id_cliente`** (VARCHAR(14)): **FK** para `clientes`.
*   **`id_endereco_entrega`** (INT): **FK** para `enderecos_pessoa`.
*   **`id_motoboy`** (VARCHAR(14)): **FK** para `motoboys`.
*   **`status`** (status_pedido_enum): Estado operacional.
*   **`valor_total`** (NUMERIC(10,2)): Total líquido.
*   **`valor_recebido`** (NUMERIC(10,2)): Dinheiro em mãos.
*   **`troco`** (NUMERIC(10,2)): Devolução calculada.
*   **`taxa_entrega`** (NUMERIC(10,2)): Custo do frete.
*   **`quilometragem`** (NUMERIC(10,2)): Distância da entrega.
*   **`pontos_resgatados`** (INTEGER): Pontos usados como desconto.
*   **`origem`** (origem_pedido_enum): Canal de entrada.
*   **`data_hora_criacao`** (TIMESTAMPTZ): Registro inicial.

#### Tabela: `itens_pedido`
*   **`id_item`** (SERIAL): **PK**.
*   **`id_pedido`** (INT): **FK** para `pedidos`.
*   **`id_produto`** (INT): **FK** para `produtos`.
*   **`tipo_item`** (VARCHAR(20)): 'Pizza' ou 'Bebida'.
*   **`quantidade`** (INTEGER): Unidades vendidas.
*   **`preco_unitario_vendido`** (NUMERIC(10,2)): **Imutabilidade**.
*   **`observacao`** (TEXT): Notas do item.

#### Tabela: `item_pizza_detalhe`
*   **`id_item`** (INT): **PK / FK** para `itens_pedido`.
*   **`id_tamanho`** (INT): **FK** para `tamanhos`.
*   **`id_borda`** (INT): **FK** para `bordas`.

#### Tabela: `pizza_sabores`
*   **`id_item`** (INT): **PK / FK** para `item_pizza_detalhe`.
*   **`id_sabor`** (INT): **PK / FK** para `sabores`.
*   **`fracao`** (NUMERIC(3,2)): Proporção (0.50, 1.00, etc).

#### Tabela: `pagamentos`
*   **`id_transacao`** (SERIAL): **PK**.
*   **`id_pedido`** (INT): **FK** para `pedidos`.
*   **`forma_pagamento`** (VARCHAR(30)): Dinheiro, Pix, Cartão.
*   **`valor_pago`** (NUMERIC(10,2)): Valor da parcela.

---

### 2.5 Módulo Financeiro e Auditoria

#### Tabela: `caixas`
*   **`id_caixa`** (SERIAL): **PK**.
*   **`id_usuario_abertura`** (INT): **FK** para `usuarios`.
*   **`id_usuario_fechamento`** (INT): **FK** para `usuarios`.
*   **`data_abertura`** (TIMESTAMPTZ): Início do turno.
*   **`data_fechamento`** (TIMESTAMPTZ): Fim do turno.
*   **`valor_abertura`** (NUMERIC(10,2)): Fundo de troco.
*   **`valor_fechamento_esperado`** (NUMERIC(10,2)): Calculado pelo sistema.
*   **`valor_fechamento_informado`** (NUMERIC(10,2)): Contagem física.
*   **`status`** (VARCHAR(20)): 'Aberto' ou 'Fechado'.
*   **`observacao`** (TEXT): Ocorrências do turno.

#### Tabela: `fluxo_caixa`
*   **`id_movimentacao`** (SERIAL): **PK**.
*   **`id_caixa`** (INT): **FK** para `caixas`.
*   **`id_pedido`** (INT): **FK** para `pedidos`. (Opcional, se for venda).
*   **`tipo_movimentacao`** (VARCHAR(20)): 'Venda', 'Suprimento', 'Sangria'.
*   **`forma_pagamento`** (VARCHAR(30)): Origem do valor.
*   **`valor`** (NUMERIC(10,2)): Valor do lançamento.
*   **`descricao`** (TEXT): Motivo detalhado.
*   **`data_hora`** (TIMESTAMPTZ): Carimbo do registro.

---

## 3. Regras de Integridade Referencial

Para garantir a consistência dos dados e a confiabilidade dos relatórios financeiros, o modelo lógico define as seguintes políticas de relacionamento:

### 3.1 Propagação de Deleção (`ON DELETE CASCADE`)
Aplicada a dependências existenciais onde o registro "filho" não faz sentido sem o "pai":
*   **Identidade:** `enderecos_pessoa` e `telefones_pessoa` ➔ `pessoas`. (Apagar a pessoa remove todos os seus contatos).
*   **Composição de Venda:** `itens_pedido`, `item_pizza_detalhe` e `pagamentos` ➔ `pedidos`. (Apagar um pedido limpa toda a sua estrutura financeira e itens).
*   **Detalhamento Técnico:** `pizza_sabores` ➔ `item_pizza_detalhe`.

### 3.2 Restrição de Deleção (`ON DELETE RESTRICT / NO ACTION`)
Aplicada para blindar o histórico transacional e evitar "buracos" na auditoria:
*   **Vendas Realizadas:** É proibido apagar um `Cliente`, `Motoboy` ou `Endereco` que possua vínculo com qualquer registro na tabela `pedidos`.
*   **Sessões Financeiras:** É proibido apagar um `Usuario` ou uma sessão de `Caixa` que possua lançamentos registrados na tabela `fluxo_caixa`.
*   **Cardápio Histórico:** `Sabores` e `Tamanhos` não podem ser removidos se houver registros de vendas (`itens_pedido`) associados a eles.

### 3.3 Gestão de Nulidade (`SET NULL / DEFAULT`)
*   **Rastreabilidade de Entrega:** Se um `Motoboy` for removido (e não tiver entregas realizadas), o campo `id_motoboy` em `pedidos` é mantido, mas em casos de cancelamento de escala, pode ser setado como nulo para reatribuição.

---
*Documentação de integridade lógica finalizada em 06 de Maio de 2026.*
