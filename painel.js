// ATENÇÃO: Cole a sua chave anônima completa do Supabase abaixo!
const SUPABASE_URL = 'https://yaxzlfxyiifyuiytkoyw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SzTAcXjJTK5bkIOfAA_2cw_X6_2w7JC';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const listaPedidosEl = document.getElementById('lista-pedidos');
const statusConexaoEl = document.getElementById('status-conexao');

// --- LÓGICA DE RECONTAGEM DIÁRIA ---
let dataUltimoZerar = localStorage.getItem('dataUltimoZerar') || '1970-01-01T00:00:00.000Z';

function zerarNumeracao() {
    if(confirm("Tem a certeza que deseja fechar o expediente de hoje e reiniciar a numeração dos pedidos amanhã (começando no #1)?")) {
        dataUltimoZerar = new Date().toISOString();
        localStorage.setItem('dataUltimoZerar', dataUltimoZerar);
        alert("Numeração reiniciada! Os próximos pedidos começarão no #1.");
        carregarPedidos();
    }
}
// -----------------------------------

// 1. Função ligada ao botão (Deixa o som a tocar, mas no MUDO)
function desbloquearSom() {
    const som = document.getElementById('som-alarme');
    
    if (som) {
        som.volume = 0; // Coloca no mudo
        som.play().catch(e => console.log("Aguardando interação..."));
    }

    // Muda o visual do botão
    const btnSom = document.getElementById('btn-som');
    if (btnSom) {
        btnSom.innerHTML = "🔊 Som Ativado (Modo PDV)";
        btnSom.className = "bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-sm transition";
    }
}

// 2. Quando o pedido chega, o Supabase chama esta função (Apenas aumenta o volume!)
function tocarAlarme() {
    const som = document.getElementById('som-alarme');
    
    if (som) {
        som.currentTime = 0; // Volta a música para o início
        som.volume = 1;      // Aumenta o volume para o máximo (toca de verdade!)
        
        // Depois de 4 segundos, volta a colocar no mudo para não ficar a tocar para sempre
        // (Se o seu sompedido.wav for muito longo, pode aumentar este número "4000" para "6000")
        setTimeout(() => {
            som.volume = 0;
        }, 4000); 
    }
}

async function carregarPedidos() {
    const { data, error } = await supabaseClient
        .from('pedidos')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        statusConexaoEl.textContent = 'Erro de Conexão';
        statusConexaoEl.className = 'text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium';
        return;
    }
    
    statusConexaoEl.textContent = 'Online (Tempo Real)';
    statusConexaoEl.className = 'text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium';
    
    // --- LÓGICA DE RECONTAGEM: Filtra apenas os pedidos feitos APÓS zerar ---
    const dataLimite = new Date(dataUltimoZerar);
    const pedidosAtuais = data.filter(pedido => new Date(pedido.created_at) > dataLimite);
    
    renderizarPedidos(pedidosAtuais);
}

// Função que desenha os cartões de pedido na tela do caixa
function renderizarPedidos(pedidos) {
    const listaPedidosEl = document.getElementById('lista-pedidos'); // Certifique-se que o ID bate com o seu HTML principal
    
    if (!pedidos || pedidos.length === 0) {
        listaPedidosEl.innerHTML = '<p class="text-gray-500 text-center py-10 bg-white rounded-lg shadow">Nenhum pedido em andamento...</p>';
        return;
    }
    
    listaPedidosEl.innerHTML = '';
    const totalPedidos = pedidos.length;
    
    pedidos.forEach((pedido, index) => {
        const card = document.createElement('div');
        
        // Muda a cor da borda lateral do cartão dependendo do status atual
        let corBorda = 'border-red-500'; // pendente (Padrão)
        if(pedido.status === 'preparando') corBorda = 'border-blue-500';
        if(pedido.status === 'entrega') corBorda = 'border-purple-500';

        card.className = `bg-white p-5 rounded-lg shadow border-l-4 ${corBorda} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`;
        
        const numeroDiario = totalPedidos - index;
        
        const borda = pedido.borda && pedido.borda !== 'Sem Borda' ? `<br>🧀 <b>Borda:</b> ${pedido.borda}` : '';
        const bebida = pedido.bebida && pedido.bebida !== 'Sem Bebida' ? `<br>🥤 <b>Bebida:</b> ${pedido.bebida}` : '';
        const obs = pedido.observacao && pedido.observacao !== 'Nenhuma' ? `<br>⚠️ <b>Obs:</b> ${pedido.observacao}` : '';
        const valorFormatado = pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2).replace('.', ',') : '0,00';
        
        // Montagem do HTML de cada cartão
        card.innerHTML = 
            '<div>' +
                '<div class="flex items-center gap-2">' +
                    '<span class="font-bold text-lg text-gray-800">Pedido #' + numeroDiario + '</span>' +
                    '<span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">' + new Date(pedido.created_at).toLocaleTimeString() + '</span>' +
                '</div>' +
                '<p class="text-gray-700 font-semibold mt-1">👤 Cliente: ' + (pedido.cliente_nome || 'Não informado') + '</p>' +
                '<p class="text-gray-600 text-sm mt-1">📍 Endereço: ' + (pedido.endereco || '') + ' - Bairro: ' + (pedido.bairro || '') + '</p>' +
                '<p class="text-gray-600 text-sm mt-1">💳 Pagamento: ' + (pedido.forma_pagamento || '') + '</p>' +
                '<p class="text-red-600 font-bold mt-1">💰 Total: R$ ' + valorFormatado + '</p>' +
                '<div class="bg-gray-50 p-3 rounded mt-3 text-sm text-gray-800 border">' +
                    '<strong>Itens do Pedido:</strong><br>' + 
                    (pedido.quantidade || '1') + 'x ' + (pedido.sabor || '') + borda + bebida + obs +
                '</div>' +
            '</div>' +
            
            // ==========================================
            // ÁREA DOS BOTÕES LATERAIS E MUDANÇA DE STATUS
            // ==========================================
            '<div class="flex flex-col gap-2 w-full md:w-auto">' +
                
                // CAIXA DE SELEÇÃO DO STATUS DO PEDIDO (Novo)
                '<select onchange="atualizarStatusPedido(' + pedido.id + ', this.value)" class="p-2 border border-gray-300 rounded font-bold text-sm bg-gray-50 mb-2 outline-none cursor-pointer">' +
                    '<option value="pendente" ' + (pedido.status === 'pendente' ? 'selected' : '') + '>⏳ Pendente / Recebido</option>' +
                    '<option value="preparando" ' + (pedido.status === 'preparando' ? 'selected' : '') + '>🍕 Em Preparação</option>' +
                    '<option value="entrega" ' + (pedido.status === 'entrega' ? 'selected' : '') + '>🛵 Saiu para Entrega</option>' +
                '</select>' +
                
                // BOTÕES ORIGINAIS DE IMPRESSÃO E CONCLUSÃO
                '<button class="btn-imp bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm transition shadow">🖨️ Imprimir Comanda</button>' +
                '<button class="btn-concluir bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded text-sm transition shadow">✅ Concluir / Finalizar</button>' +
            '</div>';

        // Atribuição de eventos de clique para os botões do cartão
        const btnImp = card.querySelector('.btn-imp');
        if(btnImp) {
            btnImp.onclick = () => {
                if(typeof imprimirPedido === 'function') imprimirPedido(pedido, numeroDiario);
            };
        }

        const btnConcluir = card.querySelector('.btn-concluir');
        if(btnConcluir) {
            btnConcluir.onclick = () => {
                if(typeof concluirPedido === 'function') concluirPedido(pedido.id);
            };
        }

        listaPedidosEl.appendChild(card);
    });
}

function imprimirPedido(pedido, numeroDiario) {
    let janela = window.open('', '', 'width=350,height=600');
    if (!janela) {
        alert('Permita os pop-ups no navegador para conseguir imprimir.');
        return;
    }
    
    const bordaText = pedido.borda && pedido.borda !== 'Sem Borda' ? `<br><b>Adicional:</b> ${pedido.borda}` : '';
    const bebidaText = pedido.bebida && pedido.bebida !== 'Sem Bebida' ? `<br><b>Bebida:</b> ${pedido.bebida}` : '';
    const obsText = pedido.observacao && pedido.observacao !== 'Nenhuma' ? `<br><b>OBS:</b> ${pedido.observacao}` : '';
    const valorFormatado = pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2).replace('.', ',') : '0,00';

    const htmlConteudo = 
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
            "<meta charset='UTF-8'>" +
            "<style>" +
                "body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0; padding: 10px; }" +
                "h2, p { margin: 5px 0; text-align: left; }" +
                "h2 { text-align: center; margin-bottom: 10px; }" +
                ".divider { border-bottom: 1px dashed #000; margin: 10px 0; }" +
            "</style>" +
        "</head>" +
        "<body>" +
            "<h2>PIZZARIA UBATUBA</h2>" +
            "<p style='text-align: center;'>Comanda de Produção</p>" +
            "<div class='divider'></div>" +
            "<p><b>Pedido: #" + numeroDiario + "</b></p>" +
            "<p>Data: " + new Date().toLocaleString() + "</p>" +
            "<div class='divider'></div>" +
            "<p><b>Cliente:</b> " + (pedido.cliente_nome || 'Balcão') + "</p>" +
            "<p><b>Endereço:</b> " + (pedido.endereco || '') + "</p>" +
            "<p><b>Bairro:</b> " + (pedido.bairro || '') + "</p>" +
            "<div class='divider'></div>" +
            "<p><b>Itens do Pedido:</b><br>" + 
            (pedido.quantidade || '1') + "x " + (pedido.sabor || '') + 
            bordaText + 
            bebidaText + 
            "</p>" +
            obsText +
            "<div class='divider'></div>" +
            "<p><b>Forma de Pagamento:</b><br>" + (pedido.forma_pagamento || '') + "</p>" +
            "<p align='right' style='font-size: 14px;'><b>TOTAL: R$ " + valorFormatado + "</b></p>" +
            "<div class='divider'></div>" +
            "<p style='text-align: center;'><i>Impresso via Sistema Web</i></p>" +
        "</body>" +
        "</html>";

    janela.document.write(htmlConteudo);
    janela.document.close();
    janela.focus();
    
    setTimeout(() => {
        janela.print();
        janela.close();
    }, 500);
}

async function concluirPedido(id) {
    const { error } = await supabaseClient.from('pedidos').update({ status: 'concluido' }).eq('id', id);
    if (error) { 
        alert('Erro ao concluir pedido.'); 
    } else { 
        carregarPedidos(); 
    }
}
// Função para o funcionário mudar o status (Pendente -> Preparando -> Entrega)
async function atualizarStatusPedido(id, novoStatus) {
    const { error } = await supabaseClient
        .from('pedidos')
        .update({ status: novoStatus })
        .eq('id', id);
        
    if (error) {
        console.error('Erro ao mudar status:', error);
        alert('Erro de conexão ao tentar atualizar o pedido.');
    }
}

// ==========================================
// SUBSCRIÇÃO EM TEMPO REAL (COM DIAGNÓSTICO)
// ==========================================
console.log("A tentar ligar ao Supabase Realtime...");

supabaseClient.channel('public:pedidos')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, payload => {
        console.log("🚨 AVISO: Novo pedido chegou no banco de dados!", payload);
        tocarAlarme();
        carregarPedidos();
    })
    .subscribe((status) => {
        console.log("Status da ligação Realtime:", status);
        if (status === 'SUBSCRIBED') {
            console.log("✅ Ligação em tempo real estabelecida com sucesso!");
        }
    });

// Inicia o painel
carregarPedidos();