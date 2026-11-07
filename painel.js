// ATENÇÃO: Cole a sua chave anônima completa do Supabase abaixo!
const SUPABASE_URL = 'https://yaxzlfxyiifyuiytkoyw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SzTAcXjJTK5bkIOfAA_2cw_X6_2w7JC';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const listaPedidosEl = document.getElementById('lista-pedidos');
const statusConexaoEl = document.getElementById('status-conexao');

function tocarAlarme() {
    try {
        if (!audioCtx) return; // Se não clicou no botão, não faz nada
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        
        // Define o volume do bipe
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5); // Toca por meio segundo
    } catch (e) {
        console.log("Áudio bloqueado ou erro ao tocar.");
    }
}
// Variável global para guardar o contexto de áudio
let audioCtx = null;

function desbloquearSom() {
    // Inicia o sistema de áudio após o clique do utilizador
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Toca um bipe "mudo" e ultra-rápido só para o navegador perceber que o utilizador autorizou o som
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0; // Volume zero
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);

    // Muda o visual do botão para verde
    const btnSom = document.getElementById('btn-som');
    btnSom.innerHTML = "🔊 Som Ativado";
    btnSom.className = "bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-sm transition";
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
    renderizarPedidos(data);
}

function renderizarPedidos(pedidos) {
    if (!pedidos || pedidos.length === 0) {
        listaPedidosEl.innerHTML = '<p class="text-gray-500 text-center py-10 bg-white rounded-lg shadow">Nenhum pedido pendente no momento...</p>';
        return;
    }
    
    listaPedidosEl.innerHTML = '';
    
    pedidos.forEach(pedido => {
        const card = document.createElement('div');
        card.className = 'bg-white p-5 rounded-lg shadow border-l-4 border-red-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4';
        
        card.innerHTML = 
            '<div>' +
                '<div class="flex items-center gap-2">' +
                    '<span class="font-bold text-lg text-gray-800">Pedido #' + pedido.id + '</span>' +
                    '<span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">' + new Date(pedido.created_at).toLocaleTimeString() + '</span>' +
                '</div>' +
                '<p class="text-gray-700 font-semibold mt-1">👤 Cliente: ' + (pedido.cliente_nome || 'Não informado') + '</p>' +
                '<p class="text-gray-600 text-sm mt-1">📍 Endereço: ' + (pedido.endereco || '') + ' - Bairro: ' + (pedido.bairro || '') + '</p>' +
                '<p class="text-gray-600 text-sm mt-1">💳 Pagamento: ' + (pedido.forma_pagamento || '') + '</p>' +
                '<div class="bg-gray-50 p-3 rounded mt-3 text-sm text-gray-800 border">' +
                    '<strong>Pedido:</strong><br>' + (pedido.quantidade || '') + 'x ' + (pedido.sabor || '') +
                '</div>' +
            '</div>' +
            '<div class="flex flex-col gap-2 w-full md:w-auto">' +
                '<button class="btn-imp bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm transition shadow">🖨️ Imprimir Comanda</button>' +
                '<button class="btn-concluir bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded text-sm transition shadow">✅ Concluir / Finalizar</button>' +
            '</div>';

        card.querySelector('.btn-imp').onclick = () => imprimirPedido(pedido);
        card.querySelector('.btn-concluir').onclick = () => concluirPedido(pedido.id);

        listaPedidosEl.appendChild(card);
    });
}

function imprimirPedido(pedido) {
    let janela = window.open('', '', 'width=350,height=600');
    if (!janela) {
        alert('Permita os pop-ups no navegador para conseguir imprimir.');
        return;
    }
    
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
            "<p><b>Pedido: #" + pedido.id + "</b></p>" +
            "<p>Data: " + new Date().toLocaleString() + "</p>" +
            "<div class='divider'></div>" +
            "<p><b>Cliente:</b> " + (pedido.cliente_nome || 'Balcão') + "</p>" +
            "<p><b>Endereço:</b> " + (pedido.endereco || '') + "</p>" +
            "<p><b>Bairro:</b> " + (pedido.bairro || '') + "</p>" +
            "<div class='divider'></div>" +
            "<p><b>Item(ns):</b><br>" + (pedido.quantidade || '') + "x " + (pedido.sabor || '') + "</p>" +
            "<div class='divider'></div>" +
            "<p><b>Forma de Pagamento:</b><br>" + (pedido.forma_pagamento || '') + "</p>" +
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

supabaseClient.channel('public:pedidos')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, payload => {
        tocarAlarme();
        carregarPedidos();
    })
    .subscribe();

// Inicia o painel
carregarPedidos();