# 🍕 Documentação Técnica: Madre Querida (v2.4)

Este documento descreve a arquitetura, as regras de negócio e os procedimentos de manutenção do sistema de gestão da **Pizzaria Madre Querida**.

---

## 🏗️ 1. Arquitetura do Sistema

O sistema utiliza uma arquitetura **Client-Server** moderna, separando a interface do usuário da lógica de processamento de dados.

-   **Backend:** API RESTful construída com **FastAPI** (Python 3.10+).
    -   **ORM:** SQLAlchemy para abstração do banco de dados.
    -   **Seguranca:** Autenticação baseada em Hash de senha e tokens estruturados.
-   **Frontend:** Aplicação SPA construída com **React 19** e **TypeScript**.
    -   **Build Tool:** Vite (rápido e otimizado).
    -   **Estilização:** Tailwind CSS 4.
-   **Banco de Dados:** **PostgreSQL** (Relacional).

---

## 🗄️ 2. Modelo de Dados (Atualizado)

O banco de dados segue o **Modelo Conceitual V2** com extensões para o sistema de fidelidade.

### **Fidelidade e CRM**
-   `clientes.saldo_pontos`: Saldo acumulado (R$ 1,00 gasto = 1 ponto ganho).
-   `produtos.preco_pontos` e `sabores.preco_pontos`: Custo fixo para resgate do item via pontos.

### **Núcleo de Vendas**
*   `precificado`: Matriz de preços cruzando `id_sabor` x `id_tamanho`. Essencial para pizzas com preços dinâmicos.
*   `pizza_sabores`: Relaciona quais sabores compõem uma pizza pedida, utilizando o campo `fracao` (1.0 para inteira, 0.5 para meio a meio).

---

## ⚙️ 3. Regras de Negócio Avançadas

### **Sistema de Fidelidade (Ganho e Resgate)**
1.  **Ganho de Pontos:** A cada R$ 1,00 efetivamente pago no pedido, o cliente recebe 1 ponto em seu saldo.
2.  **Resgate de Produtos:**
    *   Itens podem ser resgatados se o cliente tiver saldo suficiente.
    *   Um item resgatado entra no pedido com `preco = 0.00`.
    *   O custo em pontos do item é debitado do saldo do cliente imediatamente após a finalização.
    *   O cliente não ganha novos pontos sobre o valor de itens resgatados (apenas sobre o excedente pago em dinheiro).

### **Precificação por Tamanho**
O administrador define o preço base de cada sabor para cada tamanho disponível. Ao montar uma pizza de múltiplos sabores, o sistema aplica o **Maior Preço** entre os sabores selecionados, somando o adicional da borda.

---

## 💻 4. Organização do Frontend e Gestão

### **Painel de Gestão (Admin Only)**
O administrador tem controle total sobre o cardápio:
-   **Pizzas:** Criar novos sabores, definir preços individuais por tamanho, ajustar custo de resgate e excluir sabores.
-   **Bebidas:** Adicionar novos produtos, definir volume (ml), preço de venda e custo de resgate.
-   **Visibilidade:** Ativar/Desativar itens do cardápio sem excluí-los (Soft Toggle).

### **Modais Estilizados**
Todos os formulários de edição e criação utilizam componentes isolados em `src/components/modals/`, garantindo consistência visual e segurança contra erros de sintaxe.

---

## 🚀 5. Manutenção e Instalação

### **Passo a Passo: Banco de Dados**
Ao atualizar o sistema, garanta que o esquema físico possua as colunas de pontos:
```sql
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS preco_pontos INTEGER DEFAULT 0;
ALTER TABLE sabores ADD COLUMN IF NOT EXISTS preco_pontos INTEGER DEFAULT 0;
```

---

## 🧪 6. Guia de Verificação (Testes)

1.  **Venda com Resgate:** Adicione uma pizza paga e uma bebida via resgate. Verifique se o total reflete apenas a pizza e se os pontos da bebida foram descontados.
2.  **Nova Pizza:** Cadastre um sabor e verifique se a tabela de preços por tamanho foi preenchida corretamente na aba Gestão.
3.  **Edição de Preço:** Altere o preço de uma "Coca-Cola" na Gestão e verifique se o novo valor aparece instantaneamente no PDV.

---
*Documentação atualizada em: 20 de Abril de 2026 (v2.4)*
