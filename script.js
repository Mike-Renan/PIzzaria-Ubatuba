/**
 * Padrão de UX: Seleção Inteligente
 */
function selecionarSabor(nomeSabor) {
    const selectSabor = document.getElementById('pizzaFlavor');

    if (selectSabor) {
        selectSabor.value = nomeSabor;
        const checkoutSection = document.getElementById('checkout');
        if (checkoutSection) {
            checkoutSection.scrollIntoView({ behavior: 'smooth' });
        }
        selectSabor.focus();
    } else {
        console.error("Elemento 'pizzaFlavor' não encontrado no HTML.");
    }
}

/**
 * INTEGRAÇÃO: Enviar Pedido para o Painel (Supabase) + WhatsApp
 */
document.addEventListener("DOMContentLoaded", function () {

    // 1. Inicializar Supabase com as suas credenciais
    const SUPABASE_URL = 'https://yaxzlfxyiifyuiytkoyw.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_SzTAcXjJTK5bkIOfAA_2cw_X6_2w7JC';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const form = document.getElementById('pizzaOrderForm');

    if (form) {
        // Transformamos a função num "async function" para poder usar a base de dados
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Captura os dados do formulário
            const nomeCliente = document.getElementById('clientName').value.trim();
            const quantidade = document.getElementById('pizzaQuantity').value;
            const saborEscolhido = document.getElementById('pizzaFlavor').value;
            const endereco = document.getElementById('clientAddress').value.trim();
            const bairro = document.getElementById('clientNeighborhood').value.trim();
            const formaPagamento = document.getElementById('paymentMethod').value;

            if (!nomeCliente || !saborEscolhido || !endereco || !bairro || !formaPagamento) {
                alert("Por favor, preencha todos os campos antes de enviar.");
                return;
            }

            // Feedback visual no botão
            const botaoEnvio = form.querySelector('.btn-checkout');
            const textoOriginal = botaoEnvio.innerHTML;
            botaoEnvio.innerHTML = "<span>Enviando para a cozinha...</span>";
            botaoEnvio.style.opacity = "0.7";
            botaoEnvio.disabled = true;

            // Formata os textos para guardar na base de dados
            const itensFormatados = `${quantidade}x Pizza ${saborEscolhido}`;
            // Se o formulário não tiver campo para telefone, colocamos um aviso para o atendente
            const telefoneCliente = "Não preenchido";

            // Junta endereço e bairro para o atendente ver no painel
            const enderecoCompleto = `${endereco}, Bairro: ${bairro} (Pag. via ${formaPagamento})`;

            // 2. Enviar para o banco de dados (Supabase)
            const { error } = await supabaseClient
                .from('pedidos')
                .insert([
                    {
                        cliente_nome: nomeCliente,
                        quantidade: quantidade,
                        sabor: saborEscolhido,
                        endereco: endereco,
                        bairro: bairro,
                        forma_pagamento: formaPagamento,
                        status: 'pendente'
                    }
                ]);

            if (error) {
                console.error("Erro no Supabase:", error);
                alert("Houve um pequeno atraso na rede. Vamos redirecionar para o WhatsApp por segurança.");
                enviarParaWhatsApp();
            } else {
                alert("🎉 Pedido recebido na cozinha com sucesso!");
                form.reset();

                // Opcional: Se a pizzaria quiser continuar a receber também no WhatsApp, descomente a linha abaixo
                // enviarParaWhatsApp();
            }

            // Restaura o botão
            botaoEnvio.innerHTML = textoOriginal;
            botaoEnvio.style.opacity = "1";
            botaoEnvio.disabled = false;


            // ==========================================
            // FUNÇÃO DE FALLBACK PARA O WHATSAPP
            // ==========================================
            function enviarParaWhatsApp() {
                const numeroTelefone = "5512996353271";
                const textoMensagem =
                    "* NOVO PEDIDO - Baratella Pizzaria*\n\n" +
                    "*Cliente:* " + nomeCliente + "\n" +
                    "*Pedido:* " + quantidade + "x Pizza " + saborEscolhido + "\n" +
                    "*Endereço:* " + endereco + "\n" +
                    "*Bairro:* " + bairro + "\n" +
                    "*Forma de Pagamento:* " + formaPagamento + "\n\n" +
                    "_Enviado pelo sistema Web._";

                const messagingFormatada = encodeURIComponent(textoMensagem);
                const urlLinear = "https://wa.me/" + numeroTelefone + "?text=" + messagingFormatada;
                window.location.href = urlLinear;
            }
        });
    }
});