/**
 * Padrão de UX: Seleção Inteligente
 * Permite que o usuário clique em um sabor no menu e preencha automaticamente o formulário abaixo.
 */
function selecionarSabor(nomeSabor) {
    const selectSabor = document.getElementById('pizzaFlavor');
    
    if (selectSabor) {
        selectSabor.value = nomeSabor;
        
        // Rola a tela suavemente até o formulário de checkout
        const checkoutSection = document.getElementById('checkout');
        if (checkoutSection) {
            checkoutSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Aplica um leve foco visual para guiar o olhar do usuário
        selectSabor.focus();
    } else {
        console.error("Elemento 'pizzaFlavor' não encontrado no HTML.");
    }
}

/**
 * Lógica de Processamento e Integração com WhatsApp (Chaves corrigidas)
 */
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('pizzaOrderForm');

    // O bloco "if" agora está corretamente posicionado dentro do escopo do DOMContentLoaded
    if (form) {
        form.addEventListener('submit', function(event) {
            // Evita o recarregamento padrão da página
            event.preventDefault();

            // Captura e limpa os dados inseridos
            const nomeCliente = document.getElementById('clientName').value.trim();
            const quantidade = document.getElementById('pizzaQuantity').value;
            const saborEscolhido = document.getElementById('pizzaFlavor').value;
            const endereco = document.getElementById('clientAddress').value.trim();
            const bairro = document.getElementById('clientNeighborhood').value.trim();
            const formaPagamento = document.getElementById('paymentMethod').value;

            // Validação de segurança básica antes do envio
            if (!nomeCliente || !saborEscolhido || !endereco || !bairro || !formaPagamento) {
                alert("Por favor, preencha todos os campos antes de enviar.");
                return;
            }

            // Seu número do WhatsApp comercial configurado (Apenas números)
            const numeroTelefone = "5511998803853"; 

            // Construção do texto limpo usando a sintaxe tradicional de strings para máxima compatibilidade
            const textoMensagem = 
                "*🍕 NOVO PEDIDO - BELLA VITA*\n\n" +
                "*Cliente:* " + nomeCliente + "\n" +
                "*Pedido:* " + quantidade + "x Pizza " + saborEscolhido + "\n" +
                "*Endereço:* " + endereco + "\n" +
                "*Bairro:* " + bairro + "\n" +
                "*Forma de Pagamento:* " + formaPagamento + "\n\n" +
                "_Enviado automaticamente pelo site da pizzaria._";

            // Codificação segura para a URL
            const messagingFormatada = encodeURIComponent(textoMensagem);

            // Geração da URL linear infalível e sem erros de template literal
            const urlLinear = "https://wa.me/" + numeroTelefone + "?text=" + messagingFormatada;

            // Feedback visual e UX Transicional
            const botaoEnvio = form.querySelector('.btn-checkout');
            const textoOriginal = botaoEnvio.innerHTML;
            
            botaoEnvio.innerHTML = "<span>Processando... Redirecionando</span>";
            botaoEnvio.style.opacity = "0.7";
            botaoEnvio.disabled = true;

            setTimeout(() => {
                // Abre o link do WhatsApp na mesma aba (padrão ideal para mobile)
                window.location.href = urlLinear;
                
                // Restaura o estado do botão caso o usuário decida voltar
                botaoEnvio.innerHTML = textoOriginal;
                botaoEnvio.style.opacity = "1";
                botaoEnvio.disabled = false;
            }, 800);
        });
    }
});
