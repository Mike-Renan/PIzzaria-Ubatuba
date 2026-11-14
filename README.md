# Baratella Pizzaria - Sistema Web de Delivery & PDV

Sistema completo de ponto de venda (PDV) e delivery em tempo real desenvolvido para a **Baratella Pizzaria**, localizada em Ubatuba, SP.

## 🚀 Funcionalidades

- **Cardápio Online Interativo:** Escolha de sabores (inteiras ou meias), bordas, bebidas e observações.
- **Painel do Caixa em Tempo Real (`caixa-interno-baratella-99x.html`):** 
  - Alerta sonoro automatizado com mecanismo anti-bloqueio de navegadores (Edge/Chrome).
  - Atualização instantânea de comandas via WebSockets do Supabase.
  - Gestão de status de entrega (`Pendente` ➔ `Em Preparação` ➔ `Saiu para Entrega` ➔ `Concluído`).
- **Rastreamento do Cliente com Persistência (`localStorage`):** O cliente acompanha o andamento da pizza em tempo real e pode fechar/reabrir o navegador sem perder o vínculo com o seu pedido ativo.

## 🛠️ Tecnologias Utilizadas

- **HTML5 / Tailwind CSS / JavaScript (ES6+)**
- **Supabase** (Banco de Dados PostgreSQL & Realtime Channels)
- **GitHub Pages** (Hospedagem e Deploy Contínuo)

## 📍 Localização
- **Endereço:** Rua Cascata, 930, Ubatuba - SP, CEP 11693-056

## 🔗 Links de Acesso (Produção)
- **Site do Cliente:** [[https://mike-renan.github.io/PIzzaria-Ubatuba/](https://mike-renan.github.io/PIzzaria-Ubatuba/)](https://pizzariabaratella.com.br)
- **Painel do Caixa:** [https://mike-renan.github.io/PIzzaria-******************)

---
Desenvolvido para alta performance e operação comercial local.
---

## 📂 Estrutura do Projeto

[ Cliente (Celular / Web) ] 
       │ (HTTP POST / Insert)
       ▼
┌──────────────────────────────────────────────┐
│         Supabase (Cloud PostgreSQL)          │
│  - Tabela: pedidos                           │
│  - Engine Realtime (WebSockets)              │
└──────┬────────────────────────────────┬──────┘
       │ (Notificação Realtime)         │ (Notificação Realtime)
       ▼                                ▼
[ Painel do Caixa (PC / Balcão) ]   [ Rastreio do Cliente (Atualização Automática) ]
- Toca Alerta Sonoro (Mute-Hack)    - Atualiza Barras de Progresso
- Modifica Status do Pedido         - Salva ID no localStorage
