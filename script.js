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
    
    // Inicializa o Supabase
    const SUPABASE_URL = 'https://yaxzlfxyiifyuiytkoyw.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_SzTAcXjJTK5bkIOfAA_2cw_X6_2w7JC'; 
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const form = document.getElementById('pizzaOrderForm');
    const areaPix = document.getElementById('areaPix');
    const telaRastreio = document.getElementById('telaRastreio');

    // ========================================================
    // 1. VERIFICA A MEMÓRIA DO CELULAR (LOCALSTORAGE) AO ABRIR O SITE
    // ========================================================
    const pedidoSalvo = localStorage.getItem('meuPedidoBaratella');
    
    if (pedidoSalvo) {
        verificarStatusAnterior(pedidoSalvo);
    } else {
        calcularTotal(); // Cliente novo, calcula os preços normais
    }

    async function verificarStatusAnterior(id) {
        // Esconde o cardápio e mostra o rastreio
        if(form) form.style.display = 'none';
        if(areaPix) areaPix.style.display = 'none';
        if(telaRastreio) telaRastreio.style.display = 'block';

        // Consulta o status atual no Supabase
        const { data, error } = await supabaseClient.from('pedidos').select('status').eq('id', id).single();

        if (data) {
            atualizarVisualRastreio(data.status);
            
            if (data.status === 'concluido') {
                // Se já comeu a pizza, limpa a memória para poder pedir de novo outro dia
                localStorage.removeItem('meuPedidoBaratella');
                telaRastreio.innerHTML += '<br><button onclick="window.location.reload()" style="margin-top:15px; padding:10px 20px; background:#b30000; color:white; border:none; border-radius:5px; font-weight:bold;">Fazer Novo Pedido</button>';
            } else {
                // Fica a ouvir as mudanças do caixa em tempo real
                supabaseClient.channel('rastreio-' + id)
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: 'id=eq.' + id }, payload => {
                        atualizarVisualRastreio(payload.new.status);
                        if(payload.new.status === 'concluido') {
                            localStorage.removeItem('meuPedidoBaratella');
                        }
                    }).subscribe();
            }
        } else {
            // Se não encontrou o pedido (foi apagado), limpa a memória
            localStorage.removeItem('meuPedidoBaratella');
            window.location.reload();
        }
    }

    // ========================================================
    // 2. ENVIO DE UM NOVO PEDIDO
    // ========================================================
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            // (Captura de dados omitida aqui para ser mais direto, mantenha as suas variáveis de nome, quantidade, etc...)
            const nomeCliente = document.getElementById('clientName').value.trim();
            const quantidade = document.getElementById('pizzaQuantity').value;
            const endereco = document.getElementById('clientAddress').value.trim();
            const bairro = document.getElementById('clientNeighborhood').value.trim();
            const formaPagamento = document.getElementById('paymentMethod').value;
            
            let saborFinal = document.getElementById('pizzaFlavor').value;
            const tipoPizza = document.getElementById('tipoPizza').value;
            if (tipoPizza === 'meia') {
                saborFinal = `Meia ${saborFinal} / Meia ${document.getElementById('pizzaFlavor2').value}`;
            }

            const bordaEscolhida = document.getElementById('pizzaBorda').value;
            const bebidaEscolhida = document.getElementById('pizzaBebida').value;
            const obs = document.getElementById('pizzaObservacao')?.value.trim() || 'Nenhuma';

            const botaoEnvio = form.querySelector('.btn-checkout');
            botaoEnvio.innerHTML = "<span>Enviando...</span>";
            botaoEnvio.disabled = true;

            // Envia para o Supabase e usa .select() para pegar o ID de volta
            const { data, error } = await supabaseClient
                .from('pedidos')
                .insert([{ 
                    cliente_nome: nomeCliente, quantidade: quantidade, sabor: saborFinal,
                    borda: bordaEscolhida, bebida: bebidaEscolhida, observacao: obs,
                    endereco: endereco, bairro: bairro, forma_pagamento: formaPagamento,
                    valor_total: valorFinalTotal, status: 'pendente'
                }])
                .select(); // IMPORTANTE PARA RECEBER O ID

            if (error) {
                console.error("Erro:", error);
                alert("Erro na rede. Enviando pelo WhatsApp...");
                // Chame a sua função de whatsapp aqui
            } else {
                const pedidoId = data[0].id; // Pega o número do pedido
                
                // GRAVA NA MEMÓRIA DO CELULAR
                localStorage.setItem('meuPedidoBaratella', pedidoId);
                
                // Ativa a tela de rastreio imediatamente
                verificarStatusAnterior(pedidoId);
            }
        });
    }
    const numeroWhats = "5511998803853";
    const textoMensagem = encodeURIComponent(
        `Olá! Gostaria de fazer uma reserva na Pousada Ubatuba Itaguá. \n\n🏨 Acomodação: ${quartoEscolhido} \n📅 Data de Entrada (Check-in): ${formatadorBR(dataEntrada)} \n📅 Data de Saída (Check-out): ${formatadorBR(dataSaida)} \n\nPor favor, verifique os valores e a disponibilidade!`
    );
    const urlLinkWhatsApp = "https://wa.me/" + numeroWhats + "?text=" + textoMensagem;
  

    // ========================================================
    // 3. FUNÇÃO QUE MUDA AS CORES DO RASTREIO
    // ========================================================
    function atualizarVisualRastreio(statusAtual) {
        const cores = {
            'pendente':   { id: 'status-pendente',   cor: '#f59e0b', bg: '#fef3c7' },
            'preparando': { id: 'status-preparando', cor: '#3b82f6', bg: '#eff6ff' },
            'entrega':    { id: 'status-entrega',    cor: '#8b5cf6', bg: '#f5f3ff' },
            'concluido':  { id: 'status-concluido',  cor: '#10b981', bg: '#ecfdf5' }
        };

        // Reseta tudo para cinzento
        ['pendente', 'preparando', 'entrega', 'concluido'].forEach(s => {
            const el = document.getElementById('status-' + s);
            if(el) {
                el.style.borderLeft = '4px solid #ccc';
                el.style.background = 'transparent';
                el.style.color = '#aaa';
                el.style.fontWeight = 'normal';
            }
        });

        // Pinta apenas o status atual com as cores da pizzaria
        if (cores[statusAtual]) {
            const ativo = document.getElementById(cores[statusAtual].id);
            if(ativo) {
                ativo.style.borderLeft = `4px solid ${cores[statusAtual].cor}`;
                ativo.style.background = cores[statusAtual].bg;
                ativo.style.color = '#333';
                ativo.style.fontWeight = 'bold';
            }
        }
    }
});