// ==========================================
// 1. TABELA DE TAXAS DE ENTREGA (UBATUBA)
// ==========================================
const tabelaTaxasEntrega = {
    "ipiranguinha": 5,
    "vale sol": 5,
    "parque ministerios": 6,
    "morro das mocas": 7,
    "cachoeira macacos": 8,
    "cach macacos p final": 10,
    "figueira": 10,
    "colonia": 15,
    "cdhu": 6,
    "marafunda": 7,
    "bela vista": 7,
    "mato dentro": 8,
    "jd carolina": 7,
    "monte valerio": 10,
    "ressaca": 10,
    "centro": 10,
    "silop": 10,
    "umuarama": 10,
    "sumare": 10,
    "anchieta": 10,
    "estufa 1": 10,
    "estufa 2": 10,
    "itagua": 10,
    "pq vivamar": 10,
    "praia grande": 15,
    "tenorio": 15,
    "acarau": 10,
    "pedreira alta": 10,
    "pedreira bx": 10,
    "pereque acu": 10,
    "taquaral": 13,
    "angelin": 13
};

// Função auxiliar para normalizar o texto (retira acentos e deixa minúsculo)
function normalizarTexto(texto) {
    return texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
}

// ==========================================
// 2. LÓGICA DE EXIBIÇÃO E CÁLCULO DE PREÇOS
// ==========================================

function verificarPix() {
    const metodo = document.getElementById('paymentMethod')?.value;
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
let taxaEntregaAtual = 0;

// Atalho de segurança global
function calcularTotal() {
    if (typeof calcularTotalGeral === 'function') {
        calcularTotalGeral();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const inputQuantidade = document.getElementById('pizzaQuantity');
    const containerSabores = document.getElementById('containerSaboresDinamicos');
    const selectBorda = document.getElementById('pizzaBorda');
    const selectBebida = document.getElementById('pizzaBebida');
    const inputBairro = document.getElementById('clientNeighborhood');
    const spanTotal = document.getElementById('valorTotalExibicao'); 
    const exibicaoPix = document.getElementById('valorPixExibicao');
    const spanTaxaVisual = document.getElementById('textoTaxaEntrega');

    // Catálogo de sabores com preços exatos
    const catalogoSabores = [
        { nome: "Margherita Clássica", preco: 52 },
        { nome: "Diavola (Pepperoni)", preco: 58 },
        { nome: "Quattro Formaggi", preco: 62 },
        { nome: "Frango Premium", preco: 56 },
        { nome: "Calabresa Defumada", preco: 54 },
        { nome: "Parma e Rúcula", preco: 68 },
        { nome: "Funghi Trufado", preco: 72 },
        { nome: "Brigadeiro Gourmet", preco: 48 },
        { nome: "Mussarela", preco: 48 }
    ];

    function gerarCamposDeSabores() {
        if (!containerSabores || !inputQuantidade) return;
        
        const qtd = parseInt(inputQuantidade.value) || 1;
        containerSabores.innerHTML = ''; 

        for (let i = 1; i <= qtd; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = "bloco-pizza-item mb-3";
            const sufixo = qtd > 1 ? ` #${i}` : '';

            let opcoesHtml = `<option value="" data-preco="0" disabled selected>Escolha um sabor...</option>`;
            catalogoSabores.forEach(s => {
                opcoesHtml += `<option value="${s.nome}" data-preco="${s.preco}">${s.nome} - R$ ${s.preco},00</option>`;
            });

            wrapper.innerHTML = `
                <div class="form-group">
                    <label>Tipo de Pizza${sufixo}</label>
                    <select class="form-control tipo-pizza-indiv">
                        <option value="inteira">Pizza Inteira (1 Sabor)</option>
                        <option value="meia">Meia a Meia (2 Sabores)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Sabor da Pizza${sufixo} (Ou Sabor 1)</label>
                    <select class="form-control sabor-1" required>
                        ${opcoesHtml}
                    </select>
                </div>

                <div class="form-group div-sabor-2" style="display: none;">
                    <label>Sabor 2 (Metade)${sufixo}</label>
                    <select class="form-control sabor-2">
                        ${opcoesHtml}
                    </select>
                </div>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #ddd;">
            `;

            const selectTipo = wrapper.querySelector('.tipo-pizza-indiv');
            const divSabor2 = wrapper.querySelector('.div-sabor-2');
            const selectSabor1 = wrapper.querySelector('.sabor-1');
            const selectSabor2 = wrapper.querySelector('.sabor-2');

            selectTipo.addEventListener('change', (e) => {
                if (e.target.value === 'meia') {
                    divSabor2.style.display = 'block';
                } else {
                    divSabor2.style.display = 'none';
                    selectSabor2.selectedIndex = 0;
                }
                calcularTotalGeral();
            });

            selectSabor1.addEventListener('change', calcularTotalGeral);
            selectSabor2.addEventListener('change', calcularTotalGeral);

            containerSabores.appendChild(wrapper);
        }
        
        calcularTotalGeral();
    }

    // Função principal de cálculo do total (incluindo subtotal de pizzas, bordas, bebidas e taxa de entrega)
    window.calcularTotalGeral = function() {
        let subtotalPizzas = 0;
        
        if (containerSabores) {
            const blocosPizzas = containerSabores.querySelectorAll('.bloco-pizza-item');
            blocosPizzas.forEach(bloco => {
                const tipo = bloco.querySelector('.tipo-pizza-indiv')?.value || 'inteira';
                const select1 = bloco.querySelector('.sabor-1');
                const select2 = bloco.querySelector('.sabor-2');

                let preco1 = 0;
                if (select1 && select1.selectedIndex > 0) {
                    preco1 = parseFloat(select1.options[select1.selectedIndex].getAttribute('data-preco')) || 0;
                }

                if (tipo === 'meia') {
                    let preco2 = 0;
                    if (select2 && select2.selectedIndex > 0) {
                        preco2 = parseFloat(select2.options[select2.selectedIndex].getAttribute('data-preco')) || 0;
                    }
                    subtotalPizzas += Math.max(preco1, preco2); // Regra comercial: cobra o maior valor
                } else {
                    subtotalPizzas += preco1;
                }
            });
        }

        let precoBorda = 0;
        if (selectBorda && selectBorda.selectedIndex > 0) {
            precoBorda = parseFloat(selectBorda.options[selectBorda.selectedIndex].getAttribute('data-preco')) || 0;
        }

        let precoBebida = 0;
        if (selectBebida && selectBebida.selectedIndex > 0) {
            precoBebida = parseFloat(selectBebida.options[selectBebida.selectedIndex].getAttribute('data-preco')) || 0;
        }

        // Calcula a taxa de entrega com base no bairro digitado
        taxaEntregaAtual = 0;
        if (inputBairro) {
            const bairroDigitado = normalizarTexto(inputBairro.value);
            if (tabelaTaxasEntrega.hasOwnProperty(bairroDigitado)) {
                taxaEntregaAtual = tabelaTaxasEntrega[bairroDigitado];
            }
        }

        valorFinalTotal = subtotalPizzas + precoBorda + precoBebida + taxaEntregaAtual;
        window.valorFinalTotal = valorFinalTotal;

        if (spanTotal) {
            spanTotal.innerText = valorFinalTotal.toFixed(2).replace('.', ',');
        }
        if (exibicaoPix) {
            exibicaoPix.innerText = valorFinalTotal.toFixed(2).replace('.', ',');
        }

        // Atualiza o texto visual da taxa de entrega abaixo do total
        if (spanTaxaVisual) {
            if (taxaEntregaAtual > 0) {
                spanTaxaVisual.innerHTML = `Taxa de entrega: <strong>R$ ${taxaEntregaAtual.toFixed(2).replace('.', ',')}</strong>`;
                spanTaxaVisual.style.color = "#333";
            } else {
                const bairroDigitado = inputBairro ? inputBairro.value.trim() : "";
                if (bairroDigitado === "") {
                    spanTaxaVisual.innerHTML = `Digite o bairro para calcular a taxa de entrega`;
                    spanTaxaVisual.style.color = "#888";
                } else {
                    spanTaxaVisual.innerHTML = `Taxa de entrega: <strong>Grátis / A combinar</strong>`;
                    spanTaxaVisual.style.color = "#27ae60";
                }
            }
        }
    }

    if (inputQuantidade) {
        inputQuantidade.addEventListener('input', gerarCamposDeSabores);
        gerarCamposDeSabores(); 
    }

    if (selectBorda) selectBorda.addEventListener('change', calcularTotalGeral);
    if (selectBebida) selectBebida.addEventListener('change', calcularTotalGeral);
    if (inputBairro) inputBairro.addEventListener('input', calcularTotalGeral);
});


// ==========================================
// 3. ENVIO PARA O SUPABASE E RASTREIO
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const SUPABASE_URL = 'https://yaxzlfxyiifyuiytkoyw.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_SzTAcXjJTK5bkIOfAA_2cw_X6_2w7JC'; 
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const form = document.getElementById('pizzaOrderForm');
    const areaPix = document.getElementById('areaPix');
    const telaRastreio = document.getElementById('telaRastreio');
    const containerSabores = document.getElementById('containerSaboresDinamicos');

    const pedidoSalvo = localStorage.getItem('meuPedidoBaratella');
    if (pedidoSalvo) {
        verificarStatusAnterior(pedidoSalvo);
    }

    async function verificarStatusAnterior(id) {
        if(form) form.style.display = 'none';
        if(areaPix) areaPix.style.display = 'none';
        if(telaRastreio) telaRastreio.style.display = 'block';

        const { data } = await supabaseClient.from('pedidos').select('status').eq('id', id).single();

        if (data) {
            atualizarVisualRastreio(data.status);
            
            if (data.status === 'concluido') {
                localStorage.removeItem('meuPedidoBaratella');
                telaRastreio.innerHTML += '<br><button onclick="window.location.reload()" style="margin-top:15px; padding:10px 20px; background:#b30000; color:white; border:none; border-radius:5px; font-weight:bold;">Fazer Novo Pedido</button>';
            } else {
                supabaseClient.channel('rastreio-' + id)
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: 'id=eq.' + id }, payload => {
                        atualizarVisualRastreio(payload.new.status);
                        if(payload.new.status === 'concluido') {
                            localStorage.removeItem('meuPedidoBaratella');
                        }
                    }).subscribe();
            }
        } else {
            localStorage.removeItem('meuPedidoBaratella');
            window.location.reload();
        }
    }

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const nomeCliente = document.getElementById('clientName').value.trim();
            const quantidade = document.getElementById('pizzaQuantity').value;
            const endereco = document.getElementById('clientAddress').value.trim();
            const bairro = document.getElementById('clientNeighborhood').value.trim();
            const formaPagamento = document.getElementById('paymentMethod').value;
            
            // Varre todas as pizzas geradas no ecrã para montar o texto final dos sabores
            let saboresArray = [];
            if (containerSabores) {
                const blocos = containerSabores.querySelectorAll('.bloco-pizza-item');
                blocos.forEach((bloco, index) => {
                    const tipo = bloco.querySelector('.tipo-pizza-indiv').value;
                    const s1 = bloco.querySelector('.sabor-1').value;
                    if (tipo === 'meia') {
                        const s2 = bloco.querySelector('.sabor-2').value;
                        saboresArray.push(`Pizza ${index+1}: Meia ${s1} / Meia ${s2}`);
                    } else {
                        saboresArray.push(`Pizza ${index+1}: ${s1}`);
                    }
                });
            }
            const saborFinal = saboresArray.join(' | ');

            const bordaEscolhida = document.getElementById('pizzaBorda').value;
            const bebidaEscolhida = document.getElementById('pizzaBebida').value;
            const obs = document.getElementById('pizzaObservacao')?.value.trim() || 'Nenhuma';

            const botaoEnvio = form.querySelector('.btn-checkout');
            if(botaoEnvio) {
                botaoEnvio.innerHTML = "<span>Enviando...</span>";
                botaoEnvio.disabled = true;
            }

            const { data, error } = await supabaseClient
                .from('pedidos')
                .insert([{ 
                    cliente_nome: nomeCliente, 
                    quantidade: quantidade, 
                    sabor: saborFinal,
                    borda: bordaEscolhida, 
                    bebida: bebidaEscolhida, 
                    observacao: obs,
                    endereco: endereco, 
                    bairro: bairro, 
                    taxa_entrega: taxaEntregaAtual, // Grava a taxa calculada
                    forma_pagamento: formaPagamento,
                    valor_total: valorFinalTotal, 
                    status: 'pendente'
                }])
                .select();

            if (error) {
                console.error("Erro:", error);
                alert("Erro ao enviar pedido. Tente novamente.");
                if(botaoEnvio) {
                    botaoEnvio.innerHTML = "<span>Fazer Pedido</span>";
                    botaoEnvio.disabled = false;
                }
            } else {
                const pedidoId = data[0].id;
                localStorage.setItem('meuPedidoBaratella', pedidoId);
                verificarStatusAnterior(pedidoId);
            }
        });
    }

    function atualizarVisualRastreio(statusAtual) {
        const cores = {
            'pendente':   { id: 'status-pendente',   cor: '#f59e0b', bg: '#fef3c7' },
            'preparando': { id: 'status-preparando', cor: '#3b82f6', bg: '#eff6ff' },
            'entrega':    { id: 'status-entrega',    cor: '#8b5cf6', bg: '#f5f3ff' },
            'concluido':  { id: 'status-concluido',  cor: '#10b981', bg: '#ecfdf5' }
        };

        ['pendente', 'preparando', 'entrega', 'concluido'].forEach(s => {
            const el = document.getElementById('status-' + s);
            if(el) {
                el.style.borderLeft = '4px solid #ccc';
                el.style.background = 'transparent';
                el.style.color = '#aaa';
                el.style.fontWeight = 'normal';
            }
        });

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