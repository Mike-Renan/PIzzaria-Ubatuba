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
// FUNÇÕES DE EXIBIÇÃO: ATIVOS E HISTÓRICO
// ==========================================

window.carregarPedidosAtivos = async function() {
    const listaPedidosEl = document.getElementById('lista-pedidos');
    if (!listaPedidosEl) return;

    listaPedidosEl.innerHTML = '<p class="text-center py-5 text-gray-500">A carregar pedidos ativos...</p>';

    const { data: pedidos, error } = await supabaseClient
        .from('pedidos')
        .select('*')
        .neq('status', 'concluido')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Erro ao carregar pedidos:", error);
        if (statusConexaoEl) {
            statusConexaoEl.textContent = 'Erro de Conexão';
            statusConexaoEl.className = 'text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium';
        }
        return;
    }
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

    historicoGlobal = concluidos;

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

window.renderizarHistoricoAgrupado = function(pedidos) {
    const container = document.getElementById('container-cards-historico');
    if (!container) return;
    container.innerHTML = ''; 

    if (pedidos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-5">Nenhum pedido encontrado na busca.</p>';
        return;
    }

    const gruposPorData = {};

    pedidos.forEach(pedido => {
        const dataObj = new Date(pedido.created_at);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');

        if (!gruposPorData[dataFormatada]) {
            gruposPorData[dataFormatada] = {
                pedidos: [],
                totalFaturado: 0
            };
        }

        gruposPorData[dataFormatada].pedidos.push(pedido);
        gruposPorData[dataFormatada].totalFaturado += parseFloat(pedido.valor_total || 0);
    });

    for (const [data, grupo] of Object.entries(gruposPorData)) {
        const totalFormatado = grupo.totalFaturado.toFixed(2).replace('.', ',');

        const diaBloco = document.createElement('div');
        diaBloco.className = 'mb-8';
        diaBloco.innerHTML = `
            <div class="bg-gray-800 text-white px-4 py-3 rounded-t-lg flex flex-col sm:flex-row justify-between items-center shadow">
                <span class="font-bold text-lg tracking-wide">📅 ${data}</span>
                <div class="text-sm font-semibold mt-2 sm:mt-0 flex gap-4">
                    <span class="bg-gray-700 px-3 py-1 rounded">📦 ${grupo.pedidos.length} Pedido(s)</span>
                    <span class="bg-green-600 px-3 py-1 rounded">💰 R$ ${totalFormatado}</span>
                </div>
            </div>
            <div class="bg-white border border-gray-200 border-t-0 rounded-b-lg p-3 shadow-sm flex flex-col gap-2"></div>
        `;

        const listaContainer = diaBloco.querySelector('div.bg-white');

        grupo.pedidos.forEach((pedido) => {
            const card = document.createElement('div');
            card.className = "bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center hover:bg-gray-100 transition";

            const valorCard = pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2).replace('.', ',') : '0,00';
            const hora = new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

function renderizarPedidos(pedidos) {
    const listaPedidosEl = document.getElementById('lista-pedidos'); 
    
    if (!pedidos || pedidos.length === 0) {
        listaPedidosEl.innerHTML = '<p class="text-gray-500 text-center py-10 bg-white rounded-lg shadow">Nenhum pedido em andamento...</p>';
        return;
    }
    
    listaPedidosEl.innerHTML = '';
    
    pedidos.forEach((pedido, index) => {
        const card = document.createElement('div');
        
        let corBorda = 'border-red-500';
        if(pedido.status === 'preparando') corBorda = 'border-blue-500';
        if(pedido.status === 'entrega') corBorda = 'border-purple-500';

        card.className = `bg-white p-5 rounded-lg shadow border-l-4 ${corBorda} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4`;
        
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
                '<p class="text-gray-700 text-sm mt-1">📞 Telefone: <strong>' + (pedido.telefone || 'Não informado') + '</strong></p>' +
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
    
    const valorFormatado = pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2).replace('.', ',') : '0,00';

    function quebrarTexto(texto, tamanhoMax) {
        let palavras = texto.split(' ');
        let linhas = [];
        let linhaAtual = '';
        
        palavras.forEach(palavra => {
            if ((linhaAtual + palavra).length > tamanhoMax) {
                if (linhaAtual.trim() !== '') linhas.push(linhaAtual.trim());
                linhaAtual = palavra + ' ';
            } else {
                linhaAtual += palavra + ' ';
            }
        });
        if (linhaAtual.trim() !== '') linhas.push(linhaAtual.trim());
        return linhas;
    }

    let linhasItens = [];
    const larguraMaximaLinha = 28;
    
    if (pedido.sabor && pedido.sabor.includes('|')) {
        let sabores = pedido.sabor.split(' | ');
        let bordas = pedido.borda ? pedido.borda.split(' | ') : [];
        
        sabores.forEach((saborItem, index) => {
            let saborLimpo = saborItem.replace(/^pizza\s*\d+:\s*/i, '').trim().toUpperCase();
            let textoSabor = "PIZZA " + (index + 1) + ": " + saborLimpo;
            let pedacosSabor = quebrarTexto(textoSabor, larguraMaximaLinha);
            pedacosSabor.forEach(p => linhasItens.push(p));

            // CORREÇÃO APLICADA AQUI: Exibe "BORDA:" em vez de "ADICIONAL:"
            if (bordas[index]) {
                let nomeBorda = bordas[index].includes(':') ? bordas[index].split(':').pop().trim() : bordas[index];
                if (nomeBorda.toUpperCase() !== 'SEM BORDA' && nomeBorda.toUpperCase() !== 'TRADICIONAL') {
                    let textoBorda = "BORDA: " + nomeBorda.toUpperCase();
                    let pedacosBorda = quebrarTexto(textoBorda, larguraMaximaLinha);
                    pedacosBorda.forEach(p => linhasItens.push(p));
                }
            }
            if (index < sabores.length - 1) {
                linhasItens.push("");
            }
        });
    } else {
        let saborLimpo = (pedido.sabor || '').replace(/^pizza\s*\d+:\s*/i, '').trim().toUpperCase();
        let textoSabor = (pedido.quantidade || '1') + "X " + saborLimpo;
        let pedacosSabor = quebrarTexto(textoSabor, larguraMaximaLinha);
        pedacosSabor.forEach(p => linhasItens.push(p));

        if (pedido.borda) {
            let nomeBorda = pedido.borda.includes(':') ? pedido.borda.split(':').pop().trim() : pedido.borda;
            if (nomeBorda.toUpperCase() !== 'SEM BORDA' && nomeBorda.toUpperCase() !== 'TRADICIONAL') {
                let textoBorda = "BORDA: " + nomeBorda.toUpperCase();
                let pedacosBorda = quebrarTexto(textoBorda, larguraMaximaLinha);
                pedacosBorda.forEach(p => linhasItens.push(p));
            }
        }
    }

    if (pedido.bebida && pedido.bebida !== 'Sem Bebida') {
        if (linhasItens.length > 0) linhasItens.push("");
        let textoBebida = "BEBIDA: " + pedido.bebida.toUpperCase();
        let pedacosBebida = quebrarTexto(textoBebida, larguraMaximaLinha);
        pedacosBebida.forEach(p => linhasItens.push(p));
    }

    if (pedido.taxa_entrega && parseFloat(pedido.taxa_entrega) > 0) {
        linhasItens.push("TAXA ENTREGA: R$ " + parseFloat(pedido.taxa_entrega).toFixed(2).replace('.', ','));
    }

    if (pedido.observacao && pedido.observacao !== 'Nenhuma') {
        if (linhasItens.length > 0) linhasItens.push("");
        let textoObs = "OBS: " + pedido.observacao.toUpperCase();
        let pedacosObs = quebrarTexto(textoObs, larguraMaximaLinha);
        pedacosObs.forEach(p => linhasItens.push(p));
    }

    const larguraCaixa = 30;
    
    function criarLinhaCaixa(texto) {
        let textoLimpo = texto.padEnd(larguraCaixa, ' ');
        return "│ " + textoLimpo + " │";
    }

    let topoCaixa = "┌" + "─".repeat(larguraCaixa + 2) + "┐";
    let fundoCaixa = "└" + "─".repeat(larguraCaixa + 2) + "┘";
    let linhaVaziaCaixa = "│ " + " ".repeat(larguraCaixa) + " │";

    let htmlItensTexto = topoCaixa + "<br>";
    htmlItensTexto += criarLinhaCaixa("ITENS DO PEDIDO:") + "<br>";
    
    linhasItens.forEach(linha => {
        if (linha === "") {
            htmlItensTexto += linhaVaziaCaixa + "<br>";
        } else {
            htmlItensTexto += criarLinhaCaixa(linha) + "<br>";
        }
    });
    
    htmlItensTexto += fundoCaixa;

    const htmlConteudo = 
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
            "<meta charset='UTF-8'>" +
            "<style>" +
                "body { font-family: 'Courier New', monospace; font-size: 11px; width: 280px; margin: 0; padding: 5px; line-height: 1.15; font-weight: bold; }" +
                "h2, p { margin: 3px 0; text-align: left; font-weight: bold; }" +
                "h2 { text-align: center; margin-bottom: 5px; font-size: 14px; font-weight: bold; }" +
                ".divider { border-bottom: 1px dashed #000; margin: 6px 0; }" +
                ".box-itens { font-weight: bold; white-space: pre; }" +
            "</style>" +
        "</head>" +
        "<body>" +
            "<h2>PIZZARIA BARATELLA</h2>" +
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
            "<div class='box-itens'>" + htmlItensTexto + "</div>" +
            "<div class='divider'></div>" +
            "<p><b>Forma de Pagamento:</b><br>" + (pedido.forma_pagamento || '') + "</p>" +
            "<p align='right' style='font-size: 13px;'><b>TOTAL: R$ " + valorFormatado + "</b></p>" +
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
        som.volume = 0;
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
        som.volume = 1;
        setTimeout(() => {
            som.volume = 0;
        }, 4000); 
    }
}

// ==========================================
// PAINEL DE GESTÃO DE PREÇOS, PROMOÇÕES E ITENS
// ==========================================
window.carregarPainelCardapio = async function() {
    const containerEl = document.getElementById('lista-pedidos');
    if (!containerEl) return;

    containerEl.innerHTML = '<p class="text-center py-5 text-gray-500">A carregar cardápio...</p>';

    const { data: itens, error } = await supabaseClient
        .from('cardapio')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        containerEl.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar o cardápio.</p>';
        return;
    }

    containerEl.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow border mb-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h3 class="text-xl font-bold text-gray-800">🍕 Gestão de Cardápio, Preços e Promoções</h3>
                <button onclick="carregarPedidosAtivos()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition">
                    ⬅️ Voltar para Pedidos Ativos
                </button>
            </div>

            <p class="text-sm text-gray-600 mb-6">Altere preços, pause itens em falta ou cadastre novos sabores/bebidas com atualização imediata no site.</p>

            <!-- Formulário para adicionar novo produto -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h4 class="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">➕ Adicionar Novo Produto</h4>
                <div class="flex flex-col md:flex-row gap-3">
                    <input type="text" id="novo-produto-nome" placeholder="Ex: Portuguesa Especial (Presunto, mussarela...)"
                        class="flex-1 p-2 border rounded text-sm bg-white outline-none focus:ring-2 focus:ring-red-500">
                    <select id="novo-produto-categoria" class="p-2 border rounded text-sm bg-white outline-none focus:ring-2 focus:ring-red-500">
                        <option value="salgada">Pizza Salgada</option>
                        <option value="doce">Pizza Doce</option>
                        <option value="bebida">Bebida</option>
                    </select>
                    <input type="number" step="0.10" min="0.10" id="novo-produto-preco" placeholder="Preço (ex: 39.90)"
                        class="w-full md:w-32 p-2 border rounded text-sm bg-white outline-none focus:ring-2 focus:ring-red-500">
                    <button onclick="adicionarProdutoCardapio()"
                        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold transition shadow whitespace-nowrap">
                        + Adicionar
                    </button>
                </div>
            </div>

            <div class="flex flex-col gap-3" id="form-atualiza-precos"></div>
        </div>
    `;

    const subContainer = document.getElementById('form-atualiza-precos');

    itens.forEach(item => {
        const estaAtivo = item.ativo !== false;
        const linha = document.createElement('div');
        linha.className = `flex flex-col lg:flex-row justify-between items-start lg:items-center p-3 rounded border gap-3 ${estaAtivo ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200 opacity-80'}`;

        const badgeStatus = estaAtivo
            ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold">Ativo</span>'
            : '<span class="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold">Desativado</span>';

        const textoBotaoToggle = estaAtivo ? '⏸️ Desativar' : '▶️ Ativar';
        const classeBotaoToggle = estaAtivo
            ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white';

        linha.innerHTML = `
            <div class="w-full lg:w-1/2 flex flex-wrap items-center gap-2">
                <span class="font-medium text-gray-800">${item.nome}</span>
                ${badgeStatus}
            </div>
            <div class="flex flex-wrap items-center gap-2 w-full lg:w-1/2 justify-start lg:justify-end">
                <span class="text-sm text-gray-500">R$</span>
                <input type="number" step="0.10" id="preco-${item.id}" value="${item.preco}" 
                    class="w-24 p-1.5 border rounded text-right font-bold text-green-700 bg-white focus:ring-2 focus:ring-red-500 outline-none">
                <button onclick="atualizarPrecoItem(${item.id})" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition shadow">
                    Salvar
                </button>
                <button onclick="alternarStatusProduto(${item.id}, ${estaAtivo})" 
                    class="${classeBotaoToggle} px-3 py-1.5 rounded text-sm font-medium transition shadow">
                    ${textoBotaoToggle}
                </button>
            </div>
        `;
        subContainer.appendChild(linha);
    });
}

window.adicionarProdutoCardapio = async function() {
    const nomeInput = document.getElementById('novo-produto-nome');
    const categoriaInput = document.getElementById('novo-produto-categoria');
    const precoInput = document.getElementById('novo-produto-preco');

    const nome = nomeInput ? nomeInput.value.trim() : '';
    const categoria = categoriaInput ? categoriaInput.value : 'salgada';
    const preco = precoInput ? parseFloat(precoInput.value) : NaN;

    if (!nome) {
        alert("Digite o nome do produto.");
        return;
    }
    if (isNaN(preco) || preco <= 0) {
        alert("Insira um preço válido maior que zero.");
        return;
    }

    const { error } = await supabaseClient
        .from('cardapio')
        .insert([{ nome: nome, categoria: categoria, preco: preco, ativo: true }]);

    if (error) {
        console.error("Erro ao adicionar produto:", error);
        alert("Erro ao adicionar o produto.");
    } else {
        alert("Produto adicionado ao cardápio com sucesso!");
        carregarPainelCardapio();
    }
}

window.alternarStatusProduto = async function(id, statusAtual) {
    const novoStatus = !statusAtual;
    const { error } = await supabaseClient
        .from('cardapio')
        .update({ ativo: novoStatus })
        .eq('id', id);

    if (error) {
        console.error("Erro ao alterar status do produto:", error);
        alert("Erro ao atualizar o status do produto.");
    } else {
        carregarPainelCardapio();
    }
}

window.atualizarPrecoItem = async function(id) {
    const inputPreco = document.getElementById(`preco-${id}`);
    const novoPreco = parseFloat(inputPreco.value);

    if (isNaN(novoPreco) || novoPreco <= 0) {
        alert("Por favor, insira um preço válido.");
        return;
    }

    const { error } = await supabaseClient
        .from('cardapio')
        .update({ preco: novoPreco })
        .eq('id', id);

    if (error) {
        console.error("Erro ao atualizar preço:", error);
        alert("Erro ao salvar o novo preço.");
    } else {
        alert("Preço atualizado com sucesso! Já está valendo no site para os clientes.");
    }
}