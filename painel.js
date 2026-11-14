// ==========================================
// CONFIGURAÇÃO GLOBAL DO SUPABASE
// ==========================================
const SUPABASE_URL = 'https://yaxzlfxyiifyuiytkoyw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SzTAcXjJTK5bkIOfAA_2cw_X6_2w7JC';

// Inicialização ÚNICA do cliente para evitar erros e linhas vermelhas
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const statusConexaoEl = document.getElementById('status-conexao');

// ==========================================
// LÓGICA DE RECONTAGEM DIÁRIA E INICIALIZAÇÃO
// ==========================================
let dataUltimoZerar = localStorage.getItem('dataUltimoZerar') || '1970-01-01T00:00:00.000Z';

function zerarNumeracao() {
    if(confirm("Tem a certeza que deseja fechar o expediente de hoje e reiniciar a numeração dos pedidos amanhã (começando no #1)?")) {
        dataUltimoZerar = new Date().toISOString();
        localStorage.setItem('dataUltimoZerar', dataUltimoZerar);
        alert("Numeração reiniciada! Os próximos pedidos começarão no #1.");
        carregarPedidosAtivos();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Carrega os pedidos ativos ao abrir a página
    carregarPedidosAtivos();

    // Inicia a escuta em tempo real no Supabase
    supabaseClient
        .channel('painel-caixa-geral')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, payload => {
            console.log("🚨 Atualização em tempo real:", payload);
            
            // Toca o alarme APENAS se for um pedido novo (INSERT)
            if (payload.eventType === 'INSERT') {
                tocarAlarme();
            }
            
            // Recarrega a tela ativa
            carregarPedidosAtivos();
        })
        .subscribe((status) => {
            if(statusConexaoEl) {
                if (status === 'SUBSCRIBED') {
                    statusConexaoEl.textContent = 'Online (Tempo Real)';
                    statusConexaoEl.className = 'text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium';
                } else {
                    statusConexaoEl.textContent = 'A Conectar...';
                    statusConexaoEl.className = 'text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium';
                }
            }
        });
});

// ==========================================
// FUNÇÕES DE EXIBIÇÃO: ATIVOS E HISTÓRICO (Tornadas Globais com window.)
// ==========================================

// Função para carregar pedidos pendentes, em preparo ou entrega
window.carregarPedidosAtivos = async function() {
    const listaPedidosEl = document.getElementById('lista-pedidos');
    if (!listaPedidosEl) return;

    listaPedidosEl.innerHTML = '<p class="text-center py-5 text-gray-500">A carregar pedidos ativos...</p>';

    const { data: pedidos, error } = await supabaseClient
        .from('pedidos')
        .select('*')
        .neq('status', 'concluido')
        .order('created_at', { ascending: true }); // Ordena do mais antigo para o mais novo

    if (error) {
        console.error("Erro ao carregar pedidos:", error);
        if (statusConexaoEl) {
            statusConexaoEl.textContent = 'Erro de Conexão';
            statusConexaoEl.className = 'text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium';
        }
        return;
    }
    // LÓGICA DE RECONTAGEM: Filtra apenas os pedidos feitos APÓS zerar
    const dataLimite = new Date(dataUltimoZerar);
    const pedidosAtuais = pedidos.filter(pedido => new Date(pedido.created_at) > dataLimite);
    
    renderizarPedidos(pedidosAtuais);
}

// ==========================================
// LÓGICA DO HISTÓRICO COM AGRUPAMENTO POR DATA E BUSCA
// ==========================================

let historicoGlobal = [];

window.carregarHistoricoPedidos = async function() {
    const listaPedidosEl = document.getElementById('lista-pedidos');
    if (!listaPedidosEl) return;

    listaPedidosEl.innerHTML = '<p class="text-center py-5 text-gray-500">A carregar histórico...</p>';

    // Aumentamos o limite para 300 para garantir que puxa vários dias anteriores
    const { data: concluidos, error } = await supabaseClient
        .from('pedidos')
        .select('*')
        .eq('status', 'concluido')
        .order('created_at', { ascending: false })
        .limit(300); 

    if (error) {
        console.error("Erro ao buscar histórico:", error);
        listaPedidosEl.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar o histórico.</p>';
        return;
    }

    if (!concluidos || concluidos.length === 0) {
        listaPedidosEl.innerHTML = '<p class="text-gray-500 text-center py-10 bg-white rounded-lg shadow">Nenhum pedido concluído no histórico.</p>';
        return;
    }

    historicoGlobal = concluidos; // Armazena todos os dados para busca instantânea

    // Injeta a Barra de Busca
    listaPedidosEl.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 bg-gray-100 p-3 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-bold text-gray-800 m-0">📜 Fechamento de Caixa</h3>
            <div class="relative w-full sm:w-72">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">🔍</span>
                <input type="text" id="inputBuscaHistorico" oninput="filtrarHistorico(this.value)" 
                    placeholder="Buscar cliente, bairro ou ID..." 
                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
            </div>
        </div>
        <div id="container-cards-historico"></div>
    `;

    renderizarHistoricoAgrupado(historicoGlobal);
}

// Filtro instantâneo sem precisar consultar o banco de dados novamente
window.filtrarHistorico = function(termo) {
    const termoMinusculo = termo.toLowerCase().trim();
    const filtrados = historicoGlobal.filter(p => {
        const nomeMatch = p.cliente_nome && p.cliente_nome.toLowerCase().includes(termoMinusculo);
        const bairroMatch = p.bairro && p.bairro.toLowerCase().includes(termoMinusculo);
        const idMatch = p.id && p.id.toString().includes(termoMinusculo);
        return nomeMatch || bairroMatch || idMatch;
    });
    renderizarHistoricoAgrupado(filtrados);
}

// Função inteligente que agrupa por dia e soma o faturamento
window.renderizarHistoricoAgrupado = function(pedidos) {
    const container = document.getElementById('container-cards-historico');
    if (!container) return;
    container.innerHTML = ''; 

    if (pedidos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-5">Nenhum pedido encontrado na busca.</p>';
        return;
    }

    // 1. Agrupar os pedidos pela data
    const gruposPorData = {};

    pedidos.forEach(pedido => {
        const dataObj = new Date(pedido.created_at);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR'); // Gera formato "12/11/2026"

        if (!gruposPorData[dataFormatada]) {
            gruposPorData[dataFormatada] = {
                pedidos: [],
                totalFaturado: 0
            };
        }

        gruposPorData[dataFormatada].pedidos.push(pedido);
        gruposPorData[dataFormatada].totalFaturado += parseFloat(pedido.valor_total || 0);
    });

    // 2. Renderizar os grupos na tela (Cada dia vira um bloco fechado)
    for (const [data, grupo] of Object.entries(gruposPorData)) {
        const totalFormatado = grupo.totalFaturado.toFixed(2).replace('.', ',');

        const diaBloco = document.createElement('div');
        diaBloco.className = 'mb-8'; // Espaçamento entre os dias
        diaBloco.innerHTML = `
            <!-- Cabeçalho do Dia (Resumo Financeiro) -->
            <div class="bg-gray-800 text-white px-4 py-3 rounded-t-lg flex flex-col sm:flex-row justify-between items-center shadow">
                <span class="font-bold text-lg tracking-wide">📅 ${data}</span>
                <div class="text-sm font-semibold mt-2 sm:mt-0 flex gap-4">
                    <span class="bg-gray-700 px-3 py-1 rounded">📦 ${grupo.pedidos.length} Pedido(s)</span>
                    <span class="bg-green-600 px-3 py-1 rounded">💰 R$ ${totalFormatado}</span>
                </div>
            </div>
            
            <!-- Lista de Pedidos desse Dia -->
            <div class="bg-white border border-gray-200 border-t-0 rounded-b-lg p-3 shadow-sm flex flex-col gap-2">
            </div>
        `;

        const listaContainer = diaBloco.querySelector('div.bg-white');

        grupo.pedidos.forEach((pedido) => {
            const card = document.createElement('div');
            card.className = "bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center hover:bg-gray-100 transition";

            const valorCard = pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2).replace('.', ',') : '0,00';
            const hora = new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            // Aqui garantimos que o Histórico usa o novo número (ou o ID como segurança)
            const numeroComanda = pedido.numero_diario || pedido.id;

           card.innerHTML = `
                <div class="w-[75%]">
                    <span class="font-bold text-gray-700">Comanda #${numeroComanda}</span> 
                    <span class="text-xs text-gray-500 ml-2">🕒 ${hora}</span>
                    <p class="text-sm text-gray-800 mt-1 truncate">👤 <strong>${pedido.cliente_nome || 'N/D'}</strong> | 📍 ${pedido.bairro || 'N/D'}</p>
                    <p class="text-sm text-gray-700 mt-1">📞 Telefone: <strong>${pedido.telefone || 'Não informado'}</strong></p>
                    <p class="text-xs text-gray-600 mt-1 truncate">🍕 ${pedido.sabor}</p>
                </div>
                <div class="text-right w-[25%]">
                    <p class="text-sm font-bold text-green-700">R$ ${valorCard}</p>
                    <p class="text-xs text-gray-500 uppercase">${pedido.forma_pagamento || '-'}</p>
                </div>
            `;
            listaContainer.appendChild(card);
        });

        container.appendChild(diaBloco);
    }
}

// Função que desenha os cartões de pedido ATIVO na tela do caixa
function renderizarPedidos(pedidos) {
    const listaPedidosEl = document.getElementById('lista-pedidos'); 
    
    if (!pedidos || pedidos.length === 0) {
        listaPedidosEl.innerHTML = '<p class="text-gray-500 text-center py-10 bg-white rounded-lg shadow">Nenhum pedido em andamento...</p>';
        return;
    }
    
    listaPedidosEl.innerHTML = '';
    
    pedidos.forEach((pedido, index) => {
        const card = document.createElement('div');
        
        // Cor da borda lateral baseada no status
        let corBorda = 'border-red-500'; // pendente
        if(pedido.status === 'preparando') corBorda = 'border-blue-500';
        if(pedido.status === 'entrega') corBorda = 'border-purple-500';

        card.className = `bg-white p-5 rounded-lg shadow border-l-4 ${corBorda} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4`;
        
        // Numeração unificada (puxa o número gravado no banco ou usa o ID como segurança)
        const numeroComanda = pedido.numero_diario || pedido.id;
        
        const borda = pedido.borda && pedido.borda !== 'Sem Borda' ? `<br>🧀 <b>Borda:</b> ${pedido.borda}` : '';
        const bebida = pedido.bebida && pedido.bebida !== 'Sem Bebida' ? `<br>🥤 <b>Bebida:</b> ${pedido.bebida}` : '';
        const obs = pedido.observacao && pedido.observacao !== 'Nenhuma' ? `<br>⚠️ <b>Obs:</b> ${pedido.observacao}` : '';
        const taxaFrete = pedido.taxa_entrega ? `<br>🛵 <b>Taxa Entrega:</b> R$ ${parseFloat(pedido.taxa_entrega).toFixed(2).replace('.', ',')}` : '';
        const valorFormatado = pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2).replace('.', ',') : '0,00';
        
        card.innerHTML = 
            '<div>' +
                '<div class="flex items-center gap-2">' +
                    '<span class="font-bold text-lg text-gray-800">Pedido #' + numeroComanda + '</span>' +
                    '<span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">' + new Date(pedido.created_at).toLocaleTimeString() + '</span>' +
                '</div>' +
                '<p class="text-gray-700 font-semibold mt-1">👤 Cliente: ' + (pedido.cliente_nome || 'Não informado') + '</p>' +
                '<p class="text-gray-700 text-sm mt-1">📞 Telefone: <strong>' + (pedido.telefone || 'Não informado') + '</strong></p>' + // <--- TELEFONE INCLUÍDO AQUI NOS ATIVOS
                '<p class="text-gray-600 text-sm mt-1">📍 Endereço: ' + (pedido.endereco || '') + ' - Bairro: ' + (pedido.bairro || '') + '</p>' +
                '<p class="text-gray-600 text-sm mt-1">💳 Pagamento: ' + (pedido.forma_pagamento || '') + '</p>' +
                '<p class="text-red-600 font-bold mt-1">💰 Total: R$ ' + valorFormatado + '</p>' +
                '<div class="bg-gray-50 p-3 rounded mt-3 text-sm text-gray-800 border">' +
                    '<strong>Itens do Pedido:</strong><br>' + 
                    (pedido.quantidade || '1') + 'x ' + (pedido.sabor || '') + borda + bebida + taxaFrete + obs +
                '</div>' +
            '</div>' +
            
            '<div class="flex flex-col gap-2 w-full md:w-auto">' +
                '<select onchange="atualizarStatusPedido(' + pedido.id + ', this.value)" class="p-2 border border-gray-300 rounded font-bold text-sm bg-gray-50 mb-2 outline-none cursor-pointer">' +
                    '<option value="pendente" ' + (pedido.status === 'pendente' ? 'selected' : '') + '>⏳ Pendente / Recebido</option>' +
                    '<option value="preparando" ' + (pedido.status === 'preparando' ? 'selected' : '') + '>🍕 Em Preparação</option>' +
                    '<option value="entrega" ' + (pedido.status === 'entrega' ? 'selected' : '') + '>🛵 Saiu para Entrega</option>' +
                '</select>' +
                '<button class="btn-imp bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm transition shadow">🖨️ Imprimir Comanda</button>' +
                '<button class="btn-concluir bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded text-sm transition shadow">✅ Concluir / Finalizar</button>' +
            '</div>';

        // Atribui os eventos de clique aos botões do cartão (passando o número correto da comanda)
        const btnImp = card.querySelector('.btn-imp');
        if (btnImp) btnImp.onclick = () => imprimirPedido(pedido, numeroComanda);

        const btnConcluir = card.querySelector('.btn-concluir');
        if (btnConcluir) btnConcluir.onclick = () => concluirPedido(pedido.id);

        listaPedidosEl.appendChild(card);
    }); 
}

// ==========================================
// FUNÇÕES DE AÇÃO (ATUALIZAR, CONCLUIR E IMPRIMIR)
// ==========================================

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

async function concluirPedido(id) {
    const { error } = await supabaseClient
        .from('pedidos')
        .update({ status: 'concluido' })
        .eq('id', id);
        
    if (error) { 
        alert('Erro ao concluir pedido.'); 
    } else { 
        carregarPedidosAtivos(); 
    }
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
    const taxaFreteText = pedido.taxa_entrega ? `<br><b>Taxa Entrega:</b> R$ ${parseFloat(pedido.taxa_entrega).toFixed(2).replace('.', ',')}` : '';
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
            "<p><b>Telefone:</b> " + (pedido.telefone || 'Não informado') + "</p>" +
            "<p><b>Endereço:</b> " + (pedido.endereco || '') + "</p>" +
            "<p><b>Bairro:</b> " + (pedido.bairro || '') + "</p>" +
            "<div class='divider'></div>" +
            "<p><b>Itens do Pedido:</b><br>" + 
            (pedido.quantidade || '1') + "x " + (pedido.sabor || '') + 
            bordaText + 
            bebidaText + 
            taxaFreteText +
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

// ==========================================
// FUNÇÕES DE ÁUDIO / ALARME
// ==========================================

function desbloquearSom() {
    const som = document.getElementById('som-alarme');
    
    if (som) {
        som.volume = 0; // Coloca no mudo para ativar a permissão do browser
        som.play().catch(e => console.log("Aguardando interação..."));
    }

    const btnSom = document.getElementById('btn-som');
    if (btnSom) {
        btnSom.innerHTML = "🔊 Som Ativado (Modo PDV)";
        btnSom.className = "bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-sm transition";
    }
}

function tocarAlarme() {
    const som = document.getElementById('som-alarme');
    
    if (som) {
        som.currentTime = 0;
        som.volume = 1; // Aumenta o volume
        
        // Muta após 4 segundos
        setTimeout(() => {
            som.volume = 0;
        }, 4000); 
    }
}