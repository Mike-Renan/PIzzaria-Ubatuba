// ==========================================
// 1. LÓGICA DE EXIBIÇÃO E CÁLCULO DE PREÇOS
// ==========================================

// Mostra ou esconde o Sabor 2 dependendo da escolha
function verificarMeiaMeia() {
    const tipo = document.getElementById('tipoPizza').value;
    const divSabor2 = document.getElementById('divSabor2');
    
    if (tipo === 'meia') {
        divSabor2.style.display = 'block'; // Mostra o campo
    } else {
        divSabor2.style.display = 'none';  // Esconde o campo
    }
    
    calcularTotal(); // Recalcula o preço sempre que muda
}

// NOVA FUNÇÃO: Mostra ou esconde a caixa do PIX
function verificarPix() {
    const metodo = document.getElementById('paymentMethod').value;
    const areaPix = document.getElementById('areaPix');
    
    if (areaPix) {
        if (metodo === 'Pix') {
            areaPix.style.display = 'block';
        } else {
            areaPix.style.display = 'none';
        }
    }
}

let valorFinalTotal = 0;

// Calcula o valor total dinamicamente
function calcularTotal() {
    const selectSabor1 = document.getElementById('pizzaFlavor');
    const precoSabor1 = parseFloat(selectSabor1.options[selectSabor1.selectedIndex]?.getAttribute('data-preco') || 0);
    
    let precoPizza = precoSabor1;

    // Se for meia a meia, compara os preços e cobra a mais cara
    const tipo = document.getElementById('tipoPizza').value;
    if (tipo === 'meia') {
        const selectSabor2 = document.getElementById('pizzaFlavor2');
        const precoSabor2 = parseFloat(selectSabor2.options[selectSabor2.selectedIndex]?.getAttribute('data-preco') || 0);
        
        if (precoSabor2 > precoSabor1) {
            precoPizza = precoSabor2;
        }
    }

    const selectBorda = document.getElementById('pizzaBorda');
    const precoBorda = parseFloat(selectBorda.options[selectBorda.selectedIndex]?.getAttribute('data-preco') || 0);

    const selectBebida = document.getElementById('pizzaBebida');
    const precoBebida = parseFloat(selectBebida.options[selectBebida.selectedIndex]?.getAttribute('data-preco') || 0);

    const quantidade = parseInt(document.getElementById('pizzaQuantity').value || 1);

    valorFinalTotal = (precoPizza + precoBorda + precoBebida) * quantidade;
    
    // Atualiza o valor na tela principal
    const exibicao = document.getElementById('valorTotalExibicao');
    if(exibicao) {
        exibicao.innerText = valorFinalTotal.toFixed(2).replace('.', ',');
    }
    
    // ATUALIZAÇÃO: Atualiza o valor também na caixinha do PIX
    const exibicaoPix = document.getElementById('valorPixExibicao');
    if(exibicaoPix) {
        exibicaoPix.innerText = valorFinalTotal.toFixed(2).replace('.', ',');
    }
}


// ==========================================
// ENVIO PARA O SUPABASE E WHATSAPP
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    
    // Inicializa o Supabase (Já com a sua chave que usou no painel)
    const SUPABASE_URL = 'https://yaxzlfxyiifyuiytkoyw.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_SzTAcXjJTK5bkIOfAA_2cw_X6_2w7JC'; 
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const form = document.getElementById('pizzaOrderForm');

    // Faz o cálculo inicial quando a página carrega
    calcularTotal();

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Captura dados do cliente
            const nomeCliente = document.getElementById('clientName').value.trim();
            const quantidade = document.getElementById('pizzaQuantity').value;
            const endereco = document.getElementById('clientAddress').value.trim();
            const bairro = document.getElementById('clientNeighborhood').value.trim();
            const formaPagamento = document.getElementById('paymentMethod').value;

            // Captura os sabores e define se é meia a meia
            const tipoPizza = document.getElementById('tipoPizza').value;
            const sabor1 = document.getElementById('pizzaFlavor').value;
            const sabor2 = document.getElementById('pizzaFlavor2').value;
            
            let saborFinal = sabor1;
            if (tipoPizza === 'meia') {
                if(!sabor2) {
                    alert("Por favor, selecione o segundo sabor da pizza.");
                    return;
                }
                saborFinal = `Meia ${sabor1} / Meia ${sabor2}`;
            }

            // Captura os adicionais
            const bordaEscolhida = document.getElementById('pizzaBorda').value;
            const bebidaEscolhida = document.getElementById('pizzaBebida').value;
            const obs = document.getElementById('pizzaObservacao')?.value.trim() || 'Nenhuma';

            // Feedback visual de carregamento
            const botaoEnvio = form.querySelector('.btn-checkout');
            const textoOriginal = botaoEnvio.innerHTML;
            botaoEnvio.innerHTML = "<span>Enviando para a cozinha...</span>";
            botaoEnvio.style.opacity = "0.7";
            botaoEnvio.disabled = true;

            // Enviar para o banco de dados (Supabase)
            const { error } = await supabaseClient
                .from('pedidos')
                .insert([
                    { 
                        cliente_nome: nomeCliente, 
                        quantidade: quantidade,
                        sabor: saborFinal,
                        borda: bordaEscolhida,
                        bebida: bebidaEscolhida,
                        observacao: obs,
                        endereco: endereco,
                        bairro: bairro,
                        forma_pagamento: formaPagamento,
                        valor_total: valorFinalTotal,
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
                calcularTotal(); // Reseta o preço para 0
                verificarMeiaMeia(); // Esconde o Sabor 2 novamente
                verificarPix(); // Esconde a caixa do Pix
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
                
                let textoMensagem = 
                    "* NOVO PEDIDO - Baratella Pizzaria*\n\n" +
                    "*Cliente:* " + nomeCliente + "\n" +
                    "*Pedido:* " + quantidade + "x Pizza " + saborFinal + "\n";
                
                if(bordaEscolhida && bordaEscolhida !== 'Sem Borda') textoMensagem += "*Borda:* " + bordaEscolhida + "\n";
                if(bebidaEscolhida && bebidaEscolhida !== 'Sem Bebida') textoMensagem += "*Bebida:* " + bebidaEscolhida + "\n";
                if(obs && obs !== 'Nenhuma') textoMensagem += "*Obs:* " + obs + "\n";
                
                textoMensagem += 
                    "\n*Endereço:* " + endereco + "\n" +
                    "*Bairro:* " + bairro + "\n" +
                    "*Forma de Pagamento:* " + formaPagamento + "\n" +
                    "*Total: R$ " + valorFinalTotal.toFixed(2).replace('.', ',') + "*\n\n" +
                    "_Enviado pelo sistema Web._";

                const messagingFormatada = encodeURIComponent(textoMensagem);
                const urlLinear = "https://wa.me/" + numeroTelefone + "?text=" + messagingFormatada;
                window.location.href = urlLinear;
            }
        });
    }
});