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

// 1. Função ligada ao botão para autorizar o navegador a tocar som
function desbloquearSom() {
    const som = document.getElementById('som-alarme');
    
    if (som) {
        // Toca o som e pausa imediatamente (o navegador agora sabe que o utilizador autorizou o áudio)
        som.play().then(() => {
            som.pause();
            som.currentTime = 0;
        }).catch(e => console.log("Aguardando interação..."));
    }

    // Muda o visual do botão para verde indicando que está pronto
    const btnSom = document.getElementById('btn-som');
    if (btnSom) {
        btnSom.innerHTML = "🔊 Som Ativado";
        btnSom.className = "bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-sm transition";
    }
}

// 2. Função que o Supabase vai chamar quando chegar um pedido novo
function tocarAlarme() {
    const som = document.getElementById('som-alarme');
    
    if (som) {
        // Reinicia o som caso já esteja a tocar
        som.currentTime = 0; 
        
        // Tenta reproduzir o som
        som.play().catch(function(erro) {
            console.log("O navegador bloqueou o som. O utilizador precisa de clicar na página primeiro.");
        });
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

function renderizarPedidos(pedidos) {
    if (!pedidos || pedidos.length === 0) {
        listaPedidosEl.innerHTML = '<p class="text-gray-500 text-center py-10 bg-white rounded-lg shadow">Nenhum pedido pendente no momento...</p>';
        return;
    }
    
    listaPedidosEl.innerHTML = '';
    const totalPedidos = pedidos.length;
    
    pedidos.forEach((pedido, index) => {
        const card = document.createElement('div');
        card.className = 'bg-white p-5 rounded-lg shadow border-l-4 border-red-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4';
        
        const numeroDiario = totalPedidos - index;
        
        // Proteções caso a coluna ainda não exista em pedidos antigos
        const borda = pedido.borda && pedido.borda !== 'Sem Borda' ? `<br>🧀 <b>Borda:</b> ${pedido.borda}` : '';
        const bebida = pedido.bebida && pedido.bebida !== 'Sem Bebida' ? `<br>🥤 <b>Bebida:</b> ${pedido.bebida}` : '';
        const obs = pedido.observacao && pedido.observacao !== 'Nenhuma' ? `<br>⚠️ <b>Obs:</b> ${pedido.observacao}` : '';
        const valorFormatado = pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2).replace('.', ',') : '0,00';
        
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
                    (pedido.quantidade || '1') + 'x ' + (pedido.sabor || '') +
                    borda +
                    bebida +
                    obs +
                '</div>' +
            '</div>' +
            '<div class="flex flex-col gap-2 w-full md:w-auto">' +
                '<button class="btn-imp bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm transition shadow">🖨️ Imprimir Comanda</button>' +
                '<button class="btn-concluir bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded text-sm transition shadow">✅ Concluir / Finalizar</button>' +
            '</div>';

        card.querySelector('.btn-imp').onclick = () => imprimirPedido(pedido, numeroDiario);
        card.querySelector('.btn-concluir').onclick = () => concluirPedido(pedido.id);

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

supabaseClient.channel('public:pedidos')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, payload => {
        tocarAlarme();
        carregarPedidos();
    })
    .subscribe();

// Inicia o painel
carregarPedidos();