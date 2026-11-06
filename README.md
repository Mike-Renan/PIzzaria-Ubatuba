# 🍕 Bella Vita - Pizzaria Artesanal (SPA & WhatsApp Checkout)

Uma **Landing Page / Single Page Application (SPA)** de alta conversão desenvolvida sob medida para o setor de gastronomia e turismo. O projeto foi estruturado com foco em **Performance Extrema**, **Experiência do Usuário (UX)** impecável e **Automação de Pedidos** via integração direta com a API do WhatsApp.

---

## 🚀 Diferenciais de UX & Estratégia de Negócio

Este projeto não é apenas um site institucional; é uma **ferramenta de vendas automatizada** projetada para converter acessos em pedidos instantâneos:

*   **Redução Drástica de Atrito:** O cliente não precisa fazer downloads pesados (como iFood ou aplicativos nativos). O acesso é instantâneo via navegador, o que aumenta a conversão de novos usuários em até **30%**.
*   **Gatilho de Seleção Inteligente:** Ao navegar pelo cardápio de sabores, o botão "Selecionar Sabor" preenche automaticamente o formulário final e realiza uma rolagem suave (*smooth scroll*) com foco visual para o campo. Isso encurta a jornada de compra e diminui o esforço cognitivo do cliente.
*   **Design Imersivo e Sofisticado:** Paleta de cores baseada na identidade tradicional italiana (Vermelho, Verde e Branco) com tipografia de luxo (`Italiana` + `Plus Jakarta Sans`). O cabeçalho translúcido integrado sobre o carrossel de fotos amplia o apetite visual (*food appeal*) logo no primeiro segundo de carregamento.
*   **Automação Sem Erros no WhatsApp:** O atendente ou a cozinha da pizzaria recebe a mensagem no WhatsApp 100% estruturada (Nome, Quantidade, Sabor, Endereço, Bairro e Forma de Pagamento), eliminando erros humanos de digitação e agilizando o tempo de preparo.

---

## 🛠️ Stack Técnica e Performance

O site foi construído utilizando o conceito **Vanilla Stack** (tecnologias puras), sem o uso de frameworks pesados (como React, Angular ou Vue) ou bibliotecas de terceiros (como jQuery ou Bootstrap).

*   **HTML5 Semântico:** Estrutura otimizada para SEO local e acessibilidade.
*   **CSS3 Fluido & Responsivo:** Layout baseado em *CSS Variables*, *Flexbox* e *CSS Grid*, garantindo que a interface funcione perfeitamente desde telas de smartphones antigos até monitores UltraWide. Possui transições suaves (`cubic-bezier`) em todas as micro-interações de botões.
*   **JavaScript Vanilla Puro:** Código leve e veloz. Utiliza `encodeURIComponent` para empacotamento de strings seguro, garantindo que o redirecionamento via URL para o domínio oficial do WhatsApp (`wa.me`) seja infalível e livre de quebras por caracteres especiais ou acentos.

---

## 📂 Estrutura de Arquivos

Mantenha os arquivos organizados na mesma pasta raiz:

```text
├── index.html       # Estrutura semântica da SPA, seções e formulários
├── style.css        # Tokens de design, responsividade e animações fluidas
├── script.js        # Lógica do carrossel, seleção rápida e envio para o WhatsApp
└── img/             # Pasta contendo as imagens locais das pizzas e logo
    ├── marga.jpg
    ├── pepe.jpg
    ├── quart.jpg
    ├── fran.jpg
    ├── cala.jpg
    ├── rucula.jpg
    ├── parma.jpg
    ├── choco.jpg
    └── mussa.jpg
```

---

## ⚙️ Configuração e Instalação

Como o projeto é estático e puramente Front-End, ele não exige instalação de dependências ou servidores de backend node/PHP:

1.  Faça o download ou clone este repositório.
2.  Insira as fotos correspondentes na pasta `img/` respeitando os nomes definidos no HTML.
3.  Abra o arquivo `script.js` e altere a variável `numeroTelefone` para o WhatsApp real da pizzaria:
    ```javascript
    // Formato: Código do País (55) + DDD + Número comercial
    const numeroTelefone = "5511998803853"; 
    ```
4.  Pronto! Para testar localmente, basta dar um duplo clique no arquivo `index.html`.

---

## 📋 Licença e Uso

Este projeto foi desenvolvido como um produto digital exclusivo de alta performance. Sinta-se livre para customizar os sabores, preços e identidade visual para se adequar perfeitamente ao modelo de operação do cliente final.

---
*Desenvolvido com ❤️ focando em performance, conversão e gastronomia gourmet.*
