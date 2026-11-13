// ==========================================
// 1. TABELA DE TAXAS DE ENTREGA (UBATUBA)
// ==========================================
const tabelaTaxasEntrega = {
    "ipiranguinha": 5,
    "vale sol": 5,
    "parque ministerios": 6,
    "morro das mocas": 7,
    "cachoeira macacos": 8,
    "Ca honorários macacos": 10,
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
    "usina velha": 10,
    "pedreira alta": 10,
    "pedreira bx": 10,
    "pereque acu": 10,
    "taquaral": 15,
    "angelin": 15
    
};

function normalizarTexto(texto) {
    return texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
}

// ==========================================
// 2. CATÁLOGO OFICIAL 2026 (PIZZAS SALGADAS E DOCES)
// ==========================================
const catalogoSabores = [
    // --- Salgadas R$ 30,00 ---
    { nome: "Alho (Mussarela, alho)", preco: 30.00 },
    { nome: "Boris (Presunto, mussarela)", preco: 30.00 },
    { nome: "Calabresa (Calabresa, cebola)", preco: 30.00 },
    { nome: "Frango c/ Catupiry (Frango desfiado, catupiry)", preco: 30.00 },
    { nome: "Marguerita (Mussarela, tomate, manjericão)", preco: 30.00 },
    { nome: "Milho (Mussarela, milho)", preco: 30.00 },
    { nome: "Mussarela (Mussarela, Tomate)", preco: 30.00 },

    // --- Salgadas R$ 34,90 ---
    { nome: "Palmito 1 (Mussarela, palmito)", preco: 34.90 },
    { nome: "Pepperoni (Mussarela, pepperoni)", preco: 34.90 },
    { nome: "Baiana (Mussarela, calabresa, cebola, ovo, pimenta)", preco: 34.90 },
    { nome: "A Moda da Casa (Calabresa, mussarela, milho, ovo)", preco: 34.90 },
    { nome: "Paulista (Atum, ervilha, cebola, mussarela)", preco: 34.90 },
    { nome: "Toscana (Calabresa, cebola, mussarela)", preco: 34.90 },
    { nome: "Bacon 2 (Mussarela, catupiry, bacon, milho)", preco: 34.90 },
    { nome: "Portuguesa (Presunto, mussarela, ervilha, ovo, cebola)", preco: 34.90 },
    { nome: "Fransbacon (Frango desfiado, catupiry, bacon)", preco: 34.90 },
    { nome: "Frango com Mussarela (Frango desfiado, mussarela)", preco: 34.90 },
    { nome: "Lombo (Lombo fatiado, catupiry, cebola)", preco: 34.90 },
    { nome: "Caipira 1 (Frango desfiado, bacon, milho, catupiry)", preco: 34.90 },
    { nome: "Brócolis (Mussarela, brócolis, bacon, alho)", preco: 34.90 },
    { nome: "Jardineira (Presunto, cebola, ervilha, ovo, palmito, mussarela)", preco: 34.90 },
    { nome: "Atum (Mussarela, atum, cebola)", preco: 34.90 },

    // --- Salgadas R$ 39,90 ---
    { nome: "Pepperoni 2 (Mussarela, pepperoni, catupiry)", preco: 39.90 },
    { nome: "Baratella Especial (Mussarela, catupiry, bacon, tomate, cebola, champion)", preco: 39.90 },
    { nome: "Mineirinha (Calabresa, catupiry, bacon, milho)", preco: 39.90 },
    { nome: "Caiçara (Calabresa, frango desfiado, catupiry e bacon)", preco: 39.90 },
    { nome: "Palmito 2 (Catupiry, palmito, bacon)", preco: 39.90 },
    { nome: "Três Queijos (Mussarela, catupiry, parmesão)", preco: 39.90 },

    // --- Salgadas R$ 45,00 ---
    { nome: "Quatro Queijos (Catupiry, gorgonzola, parmesão, mussarela,)", preco: 45.00 },
    { nome: "Caipira 2 (Frango desfiado, bacon, milho, cheddar)", preco: 45.00 },

    // --- Salgadas R$ 55,00 ---
    { nome: "Cinco Queijos (Mussarela, catupiry, parmesão, provolone e gorgonzola)", preco: 55.00 },

    // --- Salgadas R$ 59,90 ---
    { nome: "Contra Filé (Mussarela, contra filé, cebola, pasta de alho)", preco: 59.90 },
    { nome: "Temaki (Atum, cream cheese, cebolinha, gergelim)", preco: 59.90 },

    // --- Doces R$ 37,90 ---
    { nome: "Brigadeiro (Chocolate, granulado)", preco: 37.90 },
    { nome: "Chocolate (Chocolate)", preco: 37.90 },
    { nome: "Paçoca com Chocolate (Paçoca, chocolate)", preco: 37.90 },
    { nome: "Prestígio (Chocolate, coco ralado)", preco: 37.90 },
    { nome: "Romeu e Julieta (Mussarela e goiabada)", preco: 37.90 },

    // --- Doces R$ 44,90 ---
    { nome: "Confete (Chocolate, confete colorido)", preco: 44.90 },

    // --- Doces R$ 49,90 ---
    { nome: "Banoffe (Banana, doce de leite e canela)", preco: 49.90 },
    { nome: "Banana Nevada (Banana, chocolate branco, mussarela, canela)", preco: 49.90 },
    { nome: "Morango com Chocolate (Morango e chocolate)", preco: 49.90 },
    { nome: "Uva com Chocolate (Chocolate e uva verde)", preco: 49.90 },
    { nome: "Chocobranco (Chocolate preto e chocolate branco)", preco: 49.90 },
    { nome: "Marshmalow (Chocolate preto, marshmalow e confete)", preco: 49.90 },

    // --- Doces R$ 55,00 ---
    { nome: "Oreo (Chocolate preto, bolacha Oreo e chocolate branco)", preco: 55.00 }
];

// ==========================================
// 3. LÓGICA DE EXIBIÇÃO E CÁLCULO DE PREÇOS
// ==========================================
function verificarPix() {
    const metodo = document.getElementById('paymentMethod')?.value;
    const areaPix = document.getElementById('areaPix');
    
    if (areaPix) {
        areaPix.style.display = (metodo === 'Pix') ? 'block' : 'none';
    }
}

let valorFinalTotal = 0;
let taxaEntregaAtual = 0;

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
                opcoesHtml += `<option value="${s.nome}" data-preco="${s.preco}">${s.nome} - R$ ${s.preco.toFixed(2).replace('.', ',')}</option>`;
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

                <!-- CAMPO DE BORDA INDIVIDUAL -->
                <div class="form-group" style="margin-top: 15px;">
                    <label style="font-weight: bold; color: #555;">Borda da Pizza${sufixo}</label>
                    <select class="form-control borda-indiv" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                        <option value="Sem Borda" data-preco="0">Tradicional (Sem Borda) - Grátis</option>
                        <option value="Catupiry" data-preco="15">Borda de Catupiry - R$ 15,00</option>
                        <option value="Cheddar" data-preco="15">Borda de Cheddar - R$ 15,00</option>
                        <option value="Chocolate" data-preco="15">Borda de Chocolate - R$ 15,00</option>
                        <option value="Mussarela" data-preco="20">Borda de Mussarela - R$ 20,00</option>
                    </select>
                </div>
                <!-- FIM DO CAMPO DE BORDA -->

                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #ddd;">
            `;

            const selectTipo = wrapper.querySelector('.tipo-pizza-indiv');
            const divSabor2 = wrapper.querySelector('.div-sabor-2');
            const selectSabor1 = wrapper.querySelector('.sabor-1');
            const selectSabor2 = wrapper.querySelector('.sabor-2');
            const selectBorda = wrapper.querySelector('.borda-indiv');

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
            selectBorda.addEventListener('change', calcularTotalGeral);

            containerSabores.appendChild(wrapper);
        }
        
        calcularTotalGeral();
    }

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
                    subtotalPizzas += Math.max(preco1, preco2); 
                } else {
                    subtotalPizzas += preco1;
                }
            });
        }

        let totalBordas = 0;
        const selectsBorda = document.querySelectorAll('.borda-indiv');
        selectsBorda.forEach(select => {
            if (select.options.length > 0 && select.selectedIndex >= 0) {
                const precoOpcao = parseFloat(select.options[select.selectedIndex].getAttribute('data-preco')) || 0;
                totalBordas += precoOpcao;
            }
        });

        let precoBebida = 0;
        if (selectBebida && selectBebida.selectedIndex > 0) {
            precoBebida = parseFloat(selectBebida.options[selectBebida.selectedIndex].getAttribute('data-preco')) || 0;
        }

        taxaEntregaAtual = 0;
        if (inputBairro) {
            const bairroDigitado = normalizarTexto(inputBairro.value);
            if (tabelaTaxasEntrega.hasOwnProperty(bairroDigitado)) {
                taxaEntregaAtual = tabelaTaxasEntrega[bairroDigitado];
            }
        }

        // CORREÇÃO AQUI: Substituída a variável antiga 'precoBorda' por 'totalBordas'
        valorFinalTotal = subtotalPizzas + totalBordas + precoBebida + taxaEntregaAtual;
        window.valorFinalTotal = valorFinalTotal;

        if (spanTotal) {
            spanTotal.innerText = valorFinalTotal.toFixed(2).replace('.', ',');
        }
        if (exibicaoPix) {
            exibicaoPix.innerText = valorFinalTotal.toFixed(2).replace('.', ',');
        }

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
// 4. ENVIO PARA O SUPABASE E RASTREIO
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

        // ATUALIZAÇÃO: Buscamos também o 'numero_diario' no Supabase
        const { data } = await supabaseClient.from('pedidos').select('status, numero_diario').eq('id', id).single();

        if (data) {
            atualizarVisualRastreio(data.status);
            
            // EXIBE O NÚMERO DO PEDIDO NA TELA DO CLIENTE
            const spanNumCliente = document.getElementById('numeroPedidoCliente');
            if (spanNumCliente && data.numero_diario) {
                spanNumCliente.innerText = `#` + data.numero_diario;
            }
            
            if (data.status === 'concluido') {
                localStorage.removeItem('meuPedidoBaratella');
                telaRastreio.innerHTML += '<br><button onclick="window.location.reload()" style="margin-top:15px; padding:10px 20px; background:#b30000; color:white; border:none; border-radius:5px; font-weight:bold;">Fazer Novo Pedido</button>';
            } else {
                supabaseClient.channel('rastreio-' + id)
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: 'id=eq.' + id }, payload => {
                        atualizarVisualRastreio(payload.new.status);
                        
                        // Atualiza também via Realtime caso mude
                        if (spanNumCliente && payload.new.numero_diario) {
                            spanNumCliente.innerText = `#` + payload.new.numero_diario;
                        }

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
            
            let saboresArray = [];
            let bordasArray = []; 
            
            if (containerSabores) {
                const blocos = containerSabores.querySelectorAll('.bloco-pizza-item');
                blocos.forEach((bloco, index) => {
                    const tipo = bloco.querySelector('.tipo-pizza-indiv').value;
                    const s1 = bloco.querySelector('.sabor-1').value;
                    
                    const selectBorda = bloco.querySelector('.borda-indiv');
                    const bordaIndiv = selectBorda ? selectBorda.value : 'Sem Borda';

                    if (tipo === 'meia') {
                        const s2 = bloco.querySelector('.sabor-2').value;
                        saboresArray.push(`Pizza ${index+1}: Meia ${s1} / Meia ${s2}`);
                    } else {
                        saboresArray.push(`Pizza ${index+1}: ${s1}`);
                    }
                    
                    bordasArray.push(`Pizza ${index+1}: ${bordaIndiv}`);
                });
            }
            
            const saborFinal = saboresArray.join(' | ');
            const bordaFinal = bordasArray.join(' | '); 

            const bebidaEscolhida = document.getElementById('pizzaBebida').value;
            const obs = document.getElementById('pizzaObservacao')?.value.trim() || 'Nenhuma';

            const botaoEnvio = form.querySelector('.btn-checkout');
            if(botaoEnvio) {
                botaoEnvio.innerHTML = "<span>Enviando...</span>";
                botaoEnvio.disabled = true;
            }

            const dataHoje = new Date().toISOString().split('T')[0];
            const { count, error: erroCount } = await supabaseClient
                .from('pedidos')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', dataHoje + 'T00:00:00Z');

            const proximoNumero = (count || 0) + 1;

            const { data, error } = await supabaseClient
                .from('pedidos')
                .insert([{ 
                    cliente_nome: nomeCliente, 
                    quantidade: quantidade, 
                    sabor: saborFinal,
                    borda: bordaFinal, 
                    bebida: bebidaEscolhida, 
                    observacao: obs,
                    endereco: endereco, 
                    bairro: bairro, 
                    taxa_entrega: taxaEntregaAtual, 
                    forma_pagamento: formaPagamento,
                    valor_total: valorFinalTotal, 
                    status: 'pendente',
                    numero_diario: proximoNumero
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