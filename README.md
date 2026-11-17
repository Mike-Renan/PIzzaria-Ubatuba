# Baratella Pizzaria - Sistema Web de Delivery & PDV

# 🍕 Sistema Autônomo de Pedidos e Gestão - Pizzaria Ubatuba

Sistema web completo e automatizado para atendimento de clientes, gestão de pedidos em tempo real, impressão térmica otimizada e autonomia total na administração de cardápio e preços.

---

## 🚀 Funcionalidades do Sistema

### 📱 1. Site do Cliente (Cardápio & Pedidos)
* **Cardápio Dinâmico:** Os sabores de pizzas (salgadas e doces) e bebidas são carregados diretamente do banco de dados em tempo real.
* **Flexibilidade de Sabores:** Suporte para pedido de pizzas inteiras ou "meia a meia" (2 sabores), aplicando automaticamente o cálculo do maior valor conforme as regras da casa.
* **Bordas e Adicionais:** Seleção de bordas e adicionais customizados por item.
* **Taxa de Entrega Inteligente:** Cálculo automático baseado na tabela de bairros de Ubatuba-SP, com suporte opcional para "Retirada no Balcão".
* **Rastreamento em Tempo Real:** O cliente acompanha o andamento do pedido diretamente no celular (Pendente, Em Preparação, Saiu para Entrega, Concluído).

### 🖥️ 2. Painel de Controle Interno (Caixa & Cozinha)
* **Tempo Real (Supabase Realtime):** Novos pedidos aparecem instantaneamente na tela sem necessidade de atualizar a página.
* **Alarme Sonoro Automático:** Notificação sonora disparada imediatamente a cada novo pedido recebido.
* **Numeração Diária de Comandas:** Controle sequencial diário com botão prático para fechar o expediente e reiniciar a contagem no dia seguinte.
* **Gestão de Status:** Alteração rápida do status do pedido com feedback visual imediato.

### 🖨️ 3. Impressão Térmica Otimizada (58mm)
* Formatação de comanda desenhada especificamente para impressoras térmicas de 58mm.
* Quebra de linha automática e alinhamento milimétrico para evitar cortes de texto e garantir clareza na cozinha.

### ⚙️ 4. Gestão Autônoma de Preços e Promoções
* Painel administrativo exclusivo onde a própria pizzaria pode alterar preços de pizzas e bebidas ou criar promoções instantâneas.
* Alterações refletem imediatamente no site do cliente, sem necessidade de novas alterações de código.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (ES6+), Tailwind CSS.
* **Backend & Banco de Dados:** Supabase (PostgreSQL + Realtime Channels).
* **Hospedagem & Deploy:** cPanel / Hospedagem Web (Compatível com GitHub Pages / Vercel).

---

## 📂 Estrutura de Arquivos

* `index.html` — Interface de cardápio e checkout do cliente.
* `script.js` — Lógica do cliente, cálculo de valores, comunicação com Supabase e rastreio.
* `painel.html` — Tela de controle para o caixa, cozinha e gestão de preços.
* `painel.js` — Lógica do painel, tempo real, alarme, impressora térmica e atualizador de cardápio.

---

## 💡 Como Configurar o Projeto

1. **Banco de Dados (Supabase):**
   * Crie as tabelas `pedidos` e `cardapio` utilizando o editor SQL do Supabase.
   * Certifique-se de ativar o **Realtime** nas configurações de replicação das tabelas.
2. **Credenciais:**
   * Configure a `SUPABASE_URL` e a `SUPABASE_ANON_KEY` nos arquivos `script.js` e `painel.js`.
3. **Publicação:**
   * Hospede os arquivos no seu servidor (cPanel) e configure o domínio para acesso da pizzaria.
## 🔗 Links de Acesso (Produção)
- **Site do Cliente:** [[https://mike-renan.github.io/PIzzaria-Ubatuba/](https://mike-renan.github.io/PIzzaria-Ubatuba/)](https://pizzariabaratella.com.br)
- **Painel do Caixa:** [https://mike-renan.github.io/PIzzaria-******************)

---
Desenvolvido para alta performance e operação comercial local.
---

##
