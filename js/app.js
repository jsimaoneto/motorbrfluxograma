// +Motor BR Fluxograma · interface
// Painel, veículos com checklist das 13 fases, clientes com perfil de gosto, agenda e backup.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const moeda = (v) => (v === '' || v == null || isNaN(v)) ? '' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const ic = {
  painel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  carro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M3 12l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-4z"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></svg>',
  gente: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>',
  agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  lista: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  dados: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.7-4 3-9 3s-9-1.3-9-3M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/></svg>',
  fluxo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><rect x="15" y="3" width="6" height="5" rx="1"/><path d="M9 5.5h6M18 8v8M6 8v10.5h9"/></svg>',
  grafico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/></svg>',
  prancheta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V4z"/><path d="M9 11l1.5 1.5L13 10M9 16h6"/></svg>',
  baixar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  subir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M4 21h16"/></svg>',
  mais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  volta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  foto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
};

let estado = { pagina: 'painel', veiculoId: null, clienteId: null, aba: 'dados', mesAgenda: new Date() };

// ---------------------------------------------------------------- avisos e modal
let timerAviso;
function avisar(texto) {
  const el = $('#aviso');
  el.textContent = texto;
  el.classList.add('aberto');
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => el.classList.remove('aberto'), 2600);
}

function abrirModal(titulo, corpoHtml, botoes) {
  $('#modal').innerHTML = `
    <div class="modal-cabeca"><h3>${esc(titulo)}</h3><button class="fechar" onclick="fecharModal()">×</button></div>
    <div class="modal-corpo">${corpoHtml}</div>
    <div class="modal-pe">${(botoes || []).map((b, i) =>
      `<button class="btn ${b.classe || ''}" data-mb="${i}">${esc(b.texto)}</button>`).join('')}</div>`;
  $('#modal').classList.add('aberto');
  $('#sobreposicao').classList.add('aberta');
  (botoes || []).forEach((b, i) => {
    $(`[data-mb="${i}"]`, $('#modal')).onclick = () => { if (b.acao) b.acao(); };
  });
  const p = $('#modal input, #modal select, #modal textarea');
  if (p) setTimeout(() => p.focus(), 60);
}

function fecharModal() {
  $('#modal').classList.remove('aberto');
  $('#sobreposicao').classList.remove('aberta');
}
$('#sobreposicao').onclick = fecharModal;
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { fecharModal(); $('#lightbox').classList.remove('aberto'); } });

function verFoto(url) {
  $('#lightbox-img').src = url;
  $('#lightbox').classList.add('aberto');
}
$('#fechar-lb').onclick = () => $('#lightbox').classList.remove('aberto');
$('#lightbox').onclick = (e) => { if (e.target.id === 'lightbox') $('#lightbox').classList.remove('aberto'); };

function confirmar(titulo, texto, aoConfirmar, textoBotao) {
  abrirModal(titulo, `<p style="font-size:13.5px;line-height:1.6">${texto}</p>`, [
    { texto: 'Cancelar', acao: fecharModal },
    { texto: textoBotao || 'Confirmar', classe: 'perigo', acao: () => { fecharModal(); aoConfirmar(); } },
  ]);
}

// ---------------------------------------------------------------- senha
const SENHA_PADRAO = 'motorbr2026';
async function hash(txt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function senhaAtualHash() {
  return localStorage.getItem('mbrfluxo_senha') || await hash(SENHA_PADRAO);
}

$('#form-senha').onsubmit = async (e) => {
  e.preventDefault();
  const tentativa = await hash($('#campo-senha').value);
  if (tentativa === await senhaAtualHash()) {
    sessionStorage.setItem('mbrfluxo_ok', '1');
    entrar();
  } else {
    $('#erro-senha').style.display = 'block';
    $('#campo-senha').value = '';
  }
};

function entrar() {
  $('#tela-senha').style.display = 'none';
  $('#app').classList.add('pronto');
  carregar();
  montarMenu();
  ir('painel');
}

// ---------------------------------------------------------------- navegação
const PAGINAS = [
  { id: 'painel', nome: 'Painel', icone: 'painel' },
  { id: 'veiculos', nome: 'Veículos', icone: 'carro' },
  { id: 'fluxogramas', nome: 'Fluxogramas', icone: 'fluxo' },
  { id: 'dashboard', nome: 'Dashboard', icone: 'grafico' },
  { id: 'clientes', nome: 'Clientes', icone: 'gente' },
  { id: 'agenda', nome: 'Agenda', icone: 'agenda' },
  { id: 'processo', nome: 'O processo', icone: 'lista' },
  { id: 'checklists', nome: 'Checklists', icone: 'prancheta' },
  { id: 'dados', nome: 'Dados e backup', icone: 'dados' },
];

function montarMenu() {
  $('#menu').innerHTML = PAGINAS.map((p) =>
    `<button data-pg="${p.id}">${ic[p.icone]}<span>${p.nome}</span></button>`).join('');
  $$('#menu button').forEach((b) => { b.onclick = () => { ir(b.dataset.pg); $('#barra-lateral').classList.remove('aberta'); }; });
}

$('#abrir-menu').onclick = () => $('#barra-lateral').classList.toggle('aberta');

function ir(pagina, extra) {
  estado.pagina = pagina;
  if (extra && extra.veiculoId !== undefined) estado.veiculoId = extra.veiculoId;
  if (extra && extra.clienteId !== undefined) estado.clienteId = extra.clienteId;
  if (extra && extra.aba) estado.aba = extra.aba;
  if (extra && extra.cargo !== undefined) estado.cargo = extra.cargo;
  $$('#menu button').forEach((b) => b.classList.toggle('ativo', b.dataset.pg === pagina));
  desenhar();
  window.scrollTo(0, 0);
}

function desenhar() {
  const telas = {
    painel: telaPainel, veiculos: telaVeiculos, veiculo: telaVeiculo,
    clientes: telaClientes, cliente: telaCliente, agenda: telaAgenda,
    processo: telaProcesso, checklists: telaChecklists, dados: telaDados,
    fluxogramas: telaFluxogramas, dashboard: telaDashboard,
  };
  (telas[estado.pagina] || telaPainel)();
}
aoMudar(() => { if ($('#app').classList.contains('pronto')) desenhar(); });

function topo(titulo, sub, acoesHtml) {
  $('#titulo-pagina').innerHTML = esc(titulo) + (sub ? `<span class="sub">${esc(sub)}</span>` : '');
  $('#acoes-topo').innerHTML = acoesHtml || '';
}

// ---------------------------------------------------------------- cálculos do processo
function progresso(v) {
  let total = 0, feitos = 0;
  for (const f of FASES) {
    for (const g of itensDaFase(f, v.origem)) {
      for (const it of g.itens) {
        total++;
        if (v.concluido[chaveItem(f.n, it.i)]) feitos++;
      }
    }
  }
  return { total, feitos, pct: total ? Math.round((feitos / total) * 100) : 0 };
}

function progressoFase(v, fase) {
  let total = 0, feitos = 0;
  for (const g of itensDaFase(fase, v.origem)) {
    for (const it of g.itens) {
      total++;
      if (v.concluido[chaveItem(fase.n, it.i)]) feitos++;
    }
  }
  return { total, feitos, completa: total > 0 && feitos === total };
}

// primeira fase ainda não concluída
function faseAtual(v) {
  for (const f of FASES) {
    if (!progressoFase(v, f).completa) return f.n;
  }
  return 13;
}

const nomeVeiculo = (v) => [v.marca, v.modelo, v.versao].filter(Boolean).join(' ') || 'Veículo sem nome';
const anoVeiculo = (v) => [v.anoFab, v.anoMod].filter(Boolean).join('/');

// ---------------------------------------------------------------- painel
function telaPainel() {
  const d = dados();
  topo('Painel', 'Visão geral do processo', `<button class="btn principal" onclick="novoVeiculo()">${ic.mais} Novo veículo</button>`);

  const emEstoque = d.veiculos.filter((v) => v.status === 'estoque');
  const vendidos = d.veiculos.filter((v) => v.status === 'vendido');
  const parados = emEstoque.filter((v) => diasEntre(v.entrada) > 30);
  const leads = d.clientes.filter((c) => c.status === 'lead' || c.status === 'negociacao');

  // compromissos dos próximos 14 dias
  const hj = hoje();
  const limite = new Date(); limite.setDate(limite.getDate() + 14);
  const ano = new Date().getFullYear();
  const proximos = calendarioDoAno(ano, d.clientes, d.eventos)
    .concat(calendarioDoAno(ano + 1, d.clientes, d.eventos))
    .filter((e) => e.data >= hj && e.data <= iso(limite))
    .filter((e) => e.tipo !== 'janela')
    .slice(0, 8);

  const indicadores = [
    { l: emEstoque, r: 'veículos em estoque', c: 'destaque' },
    { l: emEstoque.filter((v) => faseAtual(v) <= 4), r: 'em preparação' },
    { l: emEstoque.filter((v) => faseAtual(v) >= 5 && v.status === 'estoque'), r: 'anunciados' },
    { l: parados, r: 'parados há mais de 30 dias', c: parados.length ? 'alerta' : '' },
    { l: leads, r: 'leads e negociações', tipo: 'c' },
    { l: vendidos, r: 'vendidos' },
  ].map((i) => ({ ...i, n: i.l.length }));
  // cada número abre o que ele conta (ver abrirIndicador em cargos.js)
  estado.painelListas = indicadores.map((i) => ({ titulo: i.r, tipo: i.tipo || 'v', ids: i.l.map((x) => x.id) }));

  const colunas = FASES.map((f) => {
    const lista = d.veiculos.filter((v) => v.status !== 'vendido' && faseAtual(v) === f.n);
    return { f, lista };
  }).filter((c) => c.lista.length > 0);

  $('#pagina').innerHTML = `
    <div class="indicadores">
      ${indicadores.map((i, k) => `<div class="indicador clicavel ${i.c || ''}" onclick="abrirIndicador(${k})" title="Abrir"><div class="n">${i.n}</div><div class="r">${i.r}</div></div>`).join('')}
    </div>

    <div class="cartao" style="margin-bottom:20px">
      <div class="cartao-cabeca"><h3>Onde está cada veículo</h3>
        <span class="so-desktop" style="font-size:11.5px;color:var(--texto-fraco)">Clique no veículo para abrir a ficha</span></div>
      <div class="cartao-corpo">
        ${colunas.length ? `<div class="trilha">${colunas.map(({ f, lista }) => `
          <div class="coluna-fase ${f.jornada === 'cliente' ? 'j-cliente' : ''}">
            <h4><span>${f.n}. ${esc(f.t.length > 22 ? f.t.slice(0, 21) + '…' : f.t)}</span><b>${lista.length}</b></h4>
            ${lista.map((v) => {
              const p = progresso(v);
              const dias = diasEntre(v.entrada);
              return `<div class="mini-card" onclick="ir('veiculo',{veiculoId:'${v.id}'})">
                <div class="mc-t">${esc(nomeVeiculo(v))}</div>
                <div class="mc-s"><span class="etiqueta ${ORIGENS[v.origem].cor}" style="font-size:9.5px;padding:1px 6px">${ORIGENS[v.origem].nome}</span>
                  <span>${dias}d em estoque</span></div>
                <div class="barra-mini"><i style="width:${p.pct}%"></i></div>
              </div>`;
            }).join('')}
          </div>`).join('')}</div>`
        : vazioHtml('Nenhum veículo no processo', 'Cadastre o primeiro veículo para ver aqui em que fase ele está.', 'novoVeiculo()', 'Cadastrar veículo')}
      </div>
    </div>

    <div class="grade-2" style="gap:18px">
      <div class="cartao">
        <div class="cartao-cabeca"><h3>Próximos 14 dias</h3>
          <button class="btn pequeno" onclick="ir('agenda')">Ver agenda</button></div>
        <div class="cartao-corpo">
          ${proximos.length ? `<div class="lista-proximos">${proximos.map((e) => {
            const [a, m, dd] = e.data.split('-');
            const tp = TIPOS_EVENTO[e.tipo] || TIPOS_EVENTO.outro;
            return `<div class="pr-item">
              <div class="pr-data"><div class="d">${dd}</div><div class="m">${MES_CURTO[+m - 1]}</div></div>
              <div class="ponto" style="background:${tp.cor}"></div>
              <div class="pr-texto"><div class="t">${esc(e.nome)}</div>
                <div class="s">${tp.rotulo}${e.obs ? ' · ' + esc(e.obs) : ''}</div></div>
            </div>`;
          }).join('')}</div>` : '<p style="color:var(--texto-fraco);font-size:13px">Nada marcado para os próximos 14 dias.</p>'}
        </div>
      </div>

      <div class="cartao">
        <div class="cartao-cabeca"><h3>Precisa de atenção</h3></div>
        <div class="cartao-corpo">
          ${alertasHtml(d, parados)}
        </div>
      </div>
    </div>`;
}

function alertasHtml(d, parados) {
  const linhas = [];
  parados.slice(0, 5).forEach((v) => linhas.push({
    cor: 'var(--vermelho)', t: `${nomeVeiculo(v)} está há ${diasEntre(v.entrada)} dias em estoque`,
    s: 'Prioridade de conteúdo e revisão de preço', ac: `ir('veiculo',{veiculoId:'${v.id}'})`,
  }));
  d.veiculos.filter((v) => v.status === 'estoque' && faseAtual(v) <= 4 && diasEntre(v.entrada) > 7).slice(0, 4).forEach((v) => linhas.push({
    cor: 'var(--amarelo)', t: `${nomeVeiculo(v)} ainda não foi para a vitrine`,
    s: `${diasEntre(v.entrada)} dias desde a entrada. A meta sugerida é de 3 a 7 dias`, ac: `ir('veiculo',{veiculoId:'${v.id}'})`,
  }));
  d.eventos.filter((e) => !e.feito && e.data < hoje()).slice(0, 5).forEach((e) => linhas.push({
    cor: 'var(--vermelho)', t: e.nome, s: `Estava marcado para ${dataBR(e.data)}`, ac: `ir('agenda')`,
  }));
  d.clientes.filter((c) => c.nascimento).forEach((c) => {
    const [, m, dd] = c.nascimento.split('-');
    const alvo = `${new Date().getFullYear()}-${m}-${dd}`;
    const faltam = diasEntre(hoje(), alvo);
    if (faltam >= 0 && faltam <= 7) linhas.push({
      cor: 'var(--laranja)', t: `Aniversário de ${c.nome}`,
      s: faltam === 0 ? 'É hoje' : `Em ${faltam} dia${faltam > 1 ? 's' : ''}`, ac: `ir('cliente',{clienteId:'${c.id}'})`,
    });
  });
  if (!linhas.length) return '<p style="color:var(--texto-fraco);font-size:13px">Nada atrasado. Tudo em dia por aqui.</p>';
  return `<div class="lista-proximos">${linhas.slice(0, 9).map((l) => `
    <div class="pr-item" style="cursor:pointer" onclick="${l.ac}">
      <div class="ponto" style="background:${l.cor}"></div>
      <div class="pr-texto"><div class="t">${esc(l.t)}</div><div class="s">${esc(l.s)}</div></div>
    </div>`).join('')}</div>`;
}

function vazioHtml(titulo, texto, acao, botao) {
  return `<div class="vazio">${ic.carro}<h3>${esc(titulo)}</h3><p>${esc(texto)}</p>
    ${acao ? `<button class="btn principal" onclick="${acao}">${esc(botao)}</button>` : ''}</div>`;
}

// ---------------------------------------------------------------- veículos
let filtroV = { busca: '', origem: '', status: 'estoque', fase: '', local: '' };

function telaVeiculos() {
  topo('Veículos', 'Banco de veículos e andamento de cada um',
    `<button class="btn" onclick="baixarFicha()" title="Modelo em Excel com todas as informações do cadastro">${ic.baixar} Baixar ficha Excel</button>
     <button class="btn escuro" onclick="escolherFicha()" title="Cadastra os novos e atualiza os que já existem (pela placa ou chassi)">${ic.subir} Importar Excel</button>
     <button class="btn principal" onclick="novoVeiculo()">${ic.mais} Novo veículo</button>`);
  const d = dados();
  let lista = d.veiculos.slice().sort((a, b) => (a.entrada || '').localeCompare(b.entrada || ''));
  if (filtroV.status) lista = lista.filter((v) => v.status === filtroV.status);
  if (filtroV.origem) lista = lista.filter((v) => v.origem === filtroV.origem);
  if (filtroV.fase) lista = lista.filter((v) => String(faseAtual(v)) === filtroV.fase);
  if (filtroV.local) lista = lista.filter((v) => localDoV(v) === filtroV.local);
  if (filtroV.busca) {
    const b = filtroV.busca.toLowerCase();
    lista = lista.filter((v) => [v.marca, v.modelo, v.versao, v.placa, v.cor].join(' ').toLowerCase().includes(b));
  }

  $('#pagina').innerHTML = `
    <div class="filtros">
      <input type="text" id="f-busca" placeholder="Buscar por marca, modelo, placa..." value="${esc(filtroV.busca)}">
      <select id="f-status">
        <option value="">Todos os status</option>
        <option value="estoque">Em estoque</option>
        <option value="vendido">Vendidos</option>
        <option value="repassado">Repassados</option>
      </select>
      <select id="f-origem">
        <option value="">Toda origem</option>
        ${Object.entries(ORIGENS).map(([k, o]) => `<option value="${k}">${o.nome}</option>`).join('')}
      </select>
      <select id="f-local">
        <option value="">Em qualquer lugar</option>
        ${LOCAIS.map((x) => `<option value="${x}">${esc(x)}</option>`).join('')}
      </select>
      <select id="f-fase">
        <option value="">Toda fase</option>
        ${FASES.map((f) => `<option value="${f.n}">${f.n}. ${esc(f.t)}</option>`).join('')}
      </select>
      <span style="font-size:12px;color:var(--texto-fraco);margin-left:auto">${lista.length} de ${d.veiculos.length}</span>
    </div>
    ${lista.length ? `<div class="cards-veiculos" id="cards"></div>`
      : vazioHtml(d.veiculos.length ? 'Nenhum veículo com esse filtro' : 'Nenhum veículo cadastrado',
          d.veiculos.length ? 'Mude os filtros para ver outros veículos.' : 'Comece cadastrando um veículo para acompanhar o processo dele, da entrada à entrega.',
          d.veiculos.length ? null : 'novoVeiculo()', 'Cadastrar veículo')}`;

  $('#f-status').value = filtroV.status; $('#f-origem').value = filtroV.origem; $('#f-fase').value = filtroV.fase;
  $('#f-local').value = filtroV.local;
  $('#f-local').onchange = (e) => { filtroV.local = e.target.value; telaVeiculos(); };
  $('#f-busca').oninput = (e) => { filtroV.busca = e.target.value; const p = e.target.selectionStart; telaVeiculos(); $('#f-busca').focus(); $('#f-busca').setSelectionRange(p, p); };
  $('#f-status').onchange = (e) => { filtroV.status = e.target.value; telaVeiculos(); };
  $('#f-origem').onchange = (e) => { filtroV.origem = e.target.value; telaVeiculos(); };
  $('#f-fase').onchange = (e) => { filtroV.fase = e.target.value; telaVeiculos(); };

  if (lista.length) {
    $('#cards').innerHTML = lista.map((v) => {
      const p = progresso(v);
      const fa = FASES[faseAtual(v) - 1];
      const dias = diasEntre(v.entrada);
      return `<div class="card-veiculo" onclick="ir('veiculo',{veiculoId:'${v.id}'})">
        <div class="capa" data-capa="${v.id}">
          <div class="sem-foto">${ic.foto}</div>
          <span class="flag etiqueta ${ORIGENS[v.origem].cor}">${ORIGENS[v.origem].nome}</span>
          ${v.status === 'vendido' ? '<span class="flag-dir etiqueta verde">Vendido</span>' : (dias > 30 ? `<span class="flag-dir etiqueta vermelha">${dias} dias</span>` : '')}
        </div>
        <div class="corpo">
          <div class="cv-t">${esc(nomeVeiculo(v))}</div>
          <div class="cv-s">${esc(anoVeiculo(v))}${v.km ? ' · ' + Number(v.km).toLocaleString('pt-BR') + ' km' : ''}${v.cor ? ' · ' + esc(v.cor) : ''}</div>
          <div class="barra ${p.pct === 100 ? 'completa' : ''}"><i style="width:${p.pct}%"></i></div>
          <div class="cv-f"><span style="color:var(--texto-fraco)">Fase ${fa.n}: ${esc(fa.t)}</span><b>${p.pct}%</b></div>
          <div class="cv-s" style="margin-top:4px">${foraDaLoja(v) ? '📍 ' : ''}${esc(localDoV(v))}${foraDaLoja(v) && v.localVolta ? ' · volta ' + dataBR(v.localVolta) : ''}${foraDaLoja(v) && v.localPor ? ' · ' + esc(v.localPor) : ''}</div>
          ${v.precoAnuncio ? `<div style="margin-top:7px;font-weight:600;font-size:14px">${moeda(v.precoAnuncio)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
    lista.forEach(async (v) => {
      if (!v.fotos || !v.fotos.length) return;
      const f = await lerFoto(v.fotos[0]);
      const el = $(`[data-capa="${v.id}"]`);
      if (f && el) el.querySelector('.sem-foto').outerHTML = `<img src="${f.dataUrl}" alt="">`;
    });
  }
}

function novoVeiculo() {
  const v = veiculoNovo();
  salvarVeiculo(v);
  ir('veiculo', { veiculoId: v.id, aba: 'dados' });
  avisar('Veículo criado. Preencha a ficha abaixo.');
}

function telaVeiculo() {
  const v = acharVeiculo(estado.veiculoId);
  if (!v) return ir('veiculos');
  const p = progresso(v);
  const fa = FASES[faseAtual(v) - 1];
  topo(nomeVeiculo(v), `${ORIGENS[v.origem].nome} · ${anoVeiculo(v)}${v.placa ? ' · ' + v.placa : ''} · ${diasEntre(v.entrada)} dias em estoque · ${localDoV(v)}`,
    `<button class="btn" onclick="estado.dash='v:${v.id}';ir('dashboard')">${ic.grafico} Dashboard</button>
     <button class="btn" onclick="ir('veiculos')">${ic.volta} Voltar</button>`);

  const rec = resumoRec(v);
  const vis = resumoVis(v);
  const abas = [['dados', 'Ficha'], ['recebimento', `Recebimento (${rec.avaliados}/${rec.total})`],
    ['vistoria', `Vistoria (${vis.avaliados}/${vis.total})`],
    ['checklist', `Checklist (${p.feitos}/${p.total})`], ['fotos', 'Fotos'], ['notas', 'Anotações']];
  $('#pagina').innerHTML = `
    <div class="cartao" style="margin-bottom:18px">
      <div class="cartao-corpo" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
        <div style="flex:1;min-width:190px">
          <div style="font-size:11.5px;color:var(--texto-fraco);font-weight:600">FASE ATUAL</div>
          <div style="font-size:16px;font-weight:600;margin-top:2px">${fa.n}. ${esc(fa.t)}</div>
          <div style="font-size:12px;color:var(--texto-fraco);margin-top:3px">Dono: ${esc(fa.dono)}</div>
          <div class="barra ${p.pct === 100 ? 'completa' : ''}" style="margin-top:10px"><i style="width:${p.pct}%"></i></div>
        </div>
        <div style="text-align:center">
          <div style="font-size:30px;font-weight:700;line-height:1">${p.pct}%</div>
          <div style="font-size:11.5px;color:var(--texto-fraco)">${p.feitos} de ${p.total} itens</div>
        </div>
      </div>
    </div>
    <div class="abas">${abas.map(([id, nome]) =>
      `<button class="${estado.aba === id ? 'ativo' : ''}" onclick="ir('veiculo',{aba:'${id}'})">${nome}</button>`).join('')}</div>
    <div id="conteudo-aba"></div>`;

  ({ dados: abaDados, recebimento: abaRecebimento, vistoria: abaVistoria, checklist: abaChecklist, fotos: abaFotos, notas: abaNotas }[estado.aba] || abaDados)(v);
}

function campo(rotulo, chave, valor, tipo, opcoes) {
  if (tipo === 'select') {
    return `<div class="campo"><label>${rotulo}</label><select data-c="${chave}">
      ${opcoes.map(([val, nome]) => `<option value="${val}" ${val === valor ? 'selected' : ''}>${esc(nome)}</option>`).join('')}
    </select></div>`;
  }
  if (tipo === 'textarea') {
    return `<div class="campo"><label>${rotulo}</label><textarea data-c="${chave}">${esc(valor)}</textarea></div>`;
  }
  return `<div class="campo"><label>${rotulo}</label><input type="${tipo || 'text'}" data-c="${chave}" value="${esc(valor)}"></div>`;
}

function ligarCampos(obj, aoSalvar) {
  $$('[data-c]', $('#conteudo-aba') || document).forEach((el) => {
    el.onchange = () => { obj[el.dataset.c] = el.value; aoSalvar(obj); };
  });
}

function abaDados(v) {
  const clientes = dados().clientes;
  $('#conteudo-aba').innerHTML = `
    <div class="cartao" style="margin-bottom:16px">
      <div class="cartao-cabeca"><h3>Identificação</h3>
        <span class="etiqueta ${ORIGENS[v.origem].cor}">${ORIGENS[v.origem].nome}</span></div>
      <div class="cartao-corpo">
        <div class="grade">
          ${campo('Origem do veículo', 'origem', v.origem, 'select', Object.entries(ORIGENS).map(([k, o]) => [k, o.nome]))}
          ${campo('Status', 'status', v.status, 'select', [['estoque', 'Em estoque'], ['vendido', 'Vendido'], ['repassado', 'Repassado']])}
          ${campo('Onde está agora', 'local', localDoV(v), 'select', LOCAIS.map((x) => [x, x]))}
          ${campo('Quem autorizou a saída', 'localPor', v.localPor || '')}
          ${campo('Previsão de volta', 'localVolta', v.localVolta || '', 'date')}
          ${campo('Data de entrada', 'entrada', v.entrada, 'date')}
          ${campo('Marca', 'marca', v.marca)}
          ${campo('Modelo', 'modelo', v.modelo)}
          ${campo('Versão', 'versao', v.versao)}
          ${campo('Motor', 'motor', v.motor || '')}
          ${campo('Carroceria', 'carroceria', v.carroceria || '', 'select', [['', '']].concat(['SUV', 'Sedã', 'Hatch', 'Picape', 'Minivan', 'Cupê', 'Conversível', 'Perua', 'Utilitário'].map((x) => [x, x])))}
          ${campo('Blindado', 'blindado', v.blindado || 'Não', 'select', [['Não', 'Não'], ['Sim', 'Sim']])}
          ${campo('Ano de fabricação', 'anoFab', v.anoFab)}
          ${campo('Ano modelo', 'anoMod', v.anoMod)}
          ${campo('Cor', 'cor', v.cor)}
          ${campo('Placa', 'placa', v.placa)}
          ${campo('Chassi (VIN)', 'chassi', v.chassi)}
          ${campo('Renavam', 'renavam', v.renavam)}
          ${campo('Quilometragem', 'km', v.km, 'number')}
          ${campo('Câmbio', 'cambio', v.cambio, 'select', [['', ''], ['Manual', 'Manual'], ['Automático', 'Automático'], ['Automatizado', 'Automatizado'], ['CVT', 'CVT']])}
          ${campo('Combustível', 'combustivel', v.combustivel, 'select', [['', ''], ['Flex', 'Flex'], ['Gasolina', 'Gasolina'], ['Etanol', 'Etanol'], ['Diesel', 'Diesel'], ['Híbrido', 'Híbrido'], ['Elétrico', 'Elétrico'], ['GNV', 'GNV']])}
          ${campo('Portas', 'portas', v.portas)}
          ${campo('Chaves', 'chaves', v.chaves)}
        </div>
        ${campo('Opcionais e observações do veículo', 'opcionais', v.opcionais, 'textarea')}
      </div>
    </div>

    <div class="cartao" style="margin-bottom:16px">
      <div class="cartao-cabeca"><h3>Anúncio no site</h3>
        ${/^https?:\/\//i.test(v.linkAnuncio || '') ? `<a class="btn pequeno" href="${esc(v.linkAnuncio)}" target="_blank" rel="noopener">Abrir anúncio</a>` : ''}</div>
      <div class="cartao-corpo">
        ${campo('Título do anúncio', 'tituloAnuncio', v.tituloAnuncio || '')}
        ${campo('Sobre o veículo', 'sobre', v.sobre || '', 'textarea')}
        ${campo('Link do anúncio no site', 'linkAnuncio', v.linkAnuncio || '')}
      </div>
    </div>

    <div class="cartao" style="margin-bottom:16px">
      <div class="cartao-cabeca"><h3>Valores</h3></div>
      <div class="cartao-corpo"><div class="grade">
        ${campo('Preço de compra (R$)', 'precoCompra', v.precoCompra, 'number')}
        ${campo('Custo de preparação (R$)', 'custoPreparacao', v.custoPreparacao, 'number')}
        ${campo('Preço de anúncio (R$)', 'precoAnuncio', v.precoAnuncio, 'number')}
        ${campo('Preço de venda (R$)', 'precoVenda', v.precoVenda, 'number')}
      </div>
      ${v.precoVenda && v.precoCompra ? `<div class="caixa-info" style="margin:6px 0 0">
        Resultado bruto: <b>${moeda(Number(v.precoVenda) - Number(v.precoCompra || 0) - Number(v.custoPreparacao || 0))}</b>
        (venda menos compra e preparação). Não considera impostos, comissões nem despesas da loja.</div>` : ''}
      </div>
    </div>

    ${v.origem === 'C' ? `<div class="cartao" style="margin-bottom:16px">
      <div class="cartao-cabeca"><h3>Consignação</h3></div>
      <div class="cartao-corpo"><div class="grade">
        ${campo('Proprietário (consignante)', 'proprietario', v.proprietario)}
        ${campo('Contato do proprietário', 'contatoProprietario', v.contatoProprietario)}
        ${campo('Valor mínimo de repasse (R$)', 'valorMinimoRepasse', v.valorMinimoRepasse, 'number')}
        ${campo('Comissão combinada', 'comissao', v.comissao)}
      </div>
      <div class="caixa-aviso" style="margin:6px 0 0">O contrato estimatório precisa estar assinado antes de anunciar o veículo (Código Civil, arts. 534 a 537).</div>
      </div></div>` : ''}

    <div class="cartao" style="margin-bottom:16px">
      <div class="cartao-cabeca"><h3>Venda</h3></div>
      <div class="cartao-corpo"><div class="grade">
        ${campo('Cliente comprador', 'clienteId', v.clienteId, 'select',
          [['', 'Nenhum']].concat(clientes.map((c) => [c.id, c.nome || 'Cliente sem nome'])))}
        ${campo('Data da venda', 'dataVenda', v.dataVenda, 'date')}
        ${campo('Data da entrega', 'dataEntrega', v.dataEntrega, 'date')}
      </div>
      ${v.clienteId ? `<button class="btn pequeno" onclick="ir('cliente',{clienteId:'${v.clienteId}'})">Abrir ficha do cliente</button>` : ''}
      </div>
    </div>

    <button class="btn perigo" onclick="apagarVeiculo('${v.id}')">Excluir este veículo</button>`;

  ligarCampos(v, (obj) => { salvarVeiculo(obj); avisar('Salvo'); });

  // o carro só sai do pátio com o nome de quem autorizou (pedido do CEO em 19/11/2026)
  const sl = $('[data-c="local"]', $('#conteudo-aba'));
  if (sl) sl.onchange = (e) => {
    const novo = e.target.value;
    if (LOCAIS_FORA.includes(novo) && !(v.localPor || '').trim()) {
      e.target.value = localDoV(v);
      avisar('Preencha quem autorizou a saída antes de marcar o veículo fora da loja.');
      const p = $('[data-c="localPor"]', $('#conteudo-aba'));
      if (p) p.focus();
      return;
    }
    v.local = novo; v.localDesde = hoje();
    salvarVeiculo(v); avisar('Salvo'); telaVeiculo();
  };
}

function apagarVeiculo(id) {
  const v = acharVeiculo(id);
  confirmar('Excluir veículo', `Isso apaga <b>${esc(nomeVeiculo(v))}</b>, o checklist, as fotos e as anotações dele. Não dá para desfazer.`,
    () => { removerVeiculo(id); ir('veiculos'); avisar('Veículo excluído'); }, 'Excluir');
}

function abaChecklist(v) {
  const abertas = estado.fasesAbertas || new Set([faseAtual(v)]);
  estado.fasesAbertas = abertas;
  $('#conteudo-aba').innerHTML = `
    <div class="caixa-info">
      Os itens mostrados são os que valem para um veículo <b>${ORIGENS[v.origem].nome.toLowerCase()}</b>.
      Mudando a origem na aba Ficha, o checklist se ajusta sozinho.
    </div>
    ${FASES.map((f) => {
      const pf = progressoFase(v, f);
      const atual = faseAtual(v) === f.n;
      const dt = v.fasesDatas[f.n] || {};
      return `<div class="fase-bloco ${pf.completa ? 'feita' : (atual ? 'andamento' : '')} ${abertas.has(f.n) ? 'aberta' : ''}" data-fase="${f.n}">
        <div class="fase-cabeca" onclick="alternarFase(${f.n})">
          <div class="fase-num">${pf.completa ? '✓' : f.n}</div>
          <div class="ft"><h4>${esc(f.t)}</h4>
            <p>${f.jornada === 'veiculo' ? 'Jornada do veículo' : 'Jornada do cliente'} · ${esc(f.dono)}${dt.realizado ? ' · concluída em ' + dataBR(dt.realizado) : (dt.previsto ? ' · previsto para ' + dataBR(dt.previsto) : '')}</p></div>
          <div class="conta">${pf.feitos}/${pf.total}</div>
        </div>
        <div class="fase-corpo">
          <div class="fase-meta">
            <div><b>Objetivo:</b> ${esc(f.obj)}</div>
            <div><b>Começa quando:</b> ${esc(f.gatilho)}</div>
            <div><b>Prazo ou meta:</b> ${esc(f.prazo)}</div>
          </div>
          <div class="grade-2" style="gap:0 14px">
            <div class="campo"><label>Data prevista</label><input type="date" data-fd="${f.n}|previsto" value="${dt.previsto || ''}"></div>
            <div class="campo"><label>Data realizada</label><input type="date" data-fd="${f.n}|realizado" value="${dt.realizado || ''}"></div>
          </div>
          <button class="btn pequeno" onclick="agendarFase('${v.id}',${f.n})">${ic.agenda} Lançar na agenda</button>
          ${itensDaFase(f, v.origem).map((g) => `
            <div class="sub-grupo">${esc(g.t)}</div>
            ${g.itens.map((it) => {
              const k = chaveItem(f.n, it.i);
              const m = v.concluido[k];
              return `<div class="item-ck ${m ? 'ok' : ''}">
                <input type="checkbox" id="ck_${k}" data-ck="${k}" ${m ? 'checked' : ''}>
                <label class="txt" for="ck_${k}">${esc(it.i)}
                  <span class="quem">${esc(it.q)}${it.o !== 'T' ? ' · só para ' + ORIGENS[it.o].nome.toLowerCase() : ''}</span>
                  ${m ? `<span class="marca-em">Feito em ${dataBR(m.data)}</span>` : ''}
                </label></div>`;
            }).join('')}`).join('')}
          <div class="passa-caixa"><b>Só passa para a próxima fase quando:</b> ${esc(f.passa)}</div>
        </div>
      </div>`;
    }).join('')}`;

  $$('[data-ck]').forEach((el) => {
    el.onchange = () => {
      const k = el.dataset.ck;
      if (el.checked) v.concluido[k] = { data: hoje() };
      else delete v.concluido[k];
      salvarVeiculo(v);
    };
  });
  $$('[data-fd]').forEach((el) => {
    el.onchange = () => {
      const [n, campo] = el.dataset.fd.split('|');
      v.fasesDatas[n] = v.fasesDatas[n] || {};
      v.fasesDatas[n][campo] = el.value;
      salvarVeiculo(v);
      avisar('Data salva');
    };
  });
}

function alternarFase(n) {
  const s = estado.fasesAbertas;
  if (s.has(n)) s.delete(n); else s.add(n);
  $(`[data-fase="${n}"]`).classList.toggle('aberta');
}

function agendarFase(veiculoId, nFase) {
  const v = acharVeiculo(veiculoId);
  const f = FASES[nFase - 1];
  const dt = (v.fasesDatas[nFase] || {}).previsto || hoje();
  abrirModal(`Agendar: ${f.t}`, `
    <div class="campo"><label>Data</label><input type="date" id="ag-data" value="${dt}"></div>
    <div class="campo"><label>Hora (opcional)</label><input type="time" id="ag-hora"></div>
    <div class="campo"><label>Observação</label><input type="text" id="ag-obs" placeholder="Ex.: levar na funilaria do Zé"></div>
    <div class="caixa-info">Dono desta fase: <b>${esc(f.dono)}</b>. ${esc(f.prazo)}</div>`,
    [{ texto: 'Cancelar', acao: fecharModal },
     { texto: 'Lançar na agenda', classe: 'principal', acao: () => {
        const data = $('#ag-data').value;
        if (!data) return;
        salvarEvento({
          data, hora: $('#ag-hora').value, tipo: 'fase',
          nome: `Fase ${nFase}: ${f.t} · ${nomeVeiculo(v)}`,
          obs: $('#ag-obs').value, veiculoId, fase: nFase, feito: false,
        });
        v.fasesDatas[nFase] = v.fasesDatas[nFase] || {};
        v.fasesDatas[nFase].previsto = data;
        salvarVeiculo(v);
        fecharModal(); avisar('Lançado na agenda');
      } }]);
}

function abaFotos(v) {
  $('#conteudo-aba').innerHTML = `
    <div class="caixa-info">
      As fotos ficam guardadas neste navegador e entram no backup. Elas são reduzidas na hora de salvar, para não
      encher o espaço. Lembre do manual: nada de placa de cliente, documento ou tela de sistema visível.
    </div>
    <div class="area-upload" id="area-upload">
      Clique aqui ou arraste as fotos do veículo<br>
      <span style="font-size:11.5px">Fora, detalhes, interior e painel com km e combustível</span>
      <input type="file" id="arq-foto" accept="image/*" multiple hidden>
    </div>
    <div class="galeria" id="galeria" style="margin-top:16px"></div>`;

  const area = $('#area-upload'), inp = $('#arq-foto');
  area.onclick = () => inp.click();
  area.ondragover = (e) => { e.preventDefault(); area.classList.add('sobre'); };
  area.ondragleave = () => area.classList.remove('sobre');
  area.ondrop = (e) => { e.preventDefault(); area.classList.remove('sobre'); subirFotos(v, e.dataTransfer.files); };
  inp.onchange = () => subirFotos(v, inp.files);
  mostrarGaleria(v);
}

async function subirFotos(v, arquivos) {
  const lista = Array.from(arquivos).filter((f) => f.type.startsWith('image/'));
  if (!lista.length) return;
  avisar(`Processando ${lista.length} foto${lista.length > 1 ? 's' : ''}...`);
  for (const arq of lista) {
    try {
      const url = await reduzirImagem(arq);
      const id = await guardarFoto(url, v.id, arq.name.replace(/\.[^.]+$/, ''));
      v.fotos.push(id);
    } catch (e) { console.error(e); }
  }
  salvarVeiculo(v);
  mostrarGaleria(v);
  avisar('Fotos salvas');
}

async function mostrarGaleria(v) {
  const g = $('#galeria');
  if (!g) return;
  if (!v.fotos.length) { g.innerHTML = '<p style="color:var(--texto-fraco);font-size:13px">Nenhuma foto ainda.</p>'; return; }
  const fotos = (await Promise.all(v.fotos.map((id) => lerFoto(id)))).filter(Boolean);
  g.innerHTML = fotos.map((f) => `
    <div class="foto-item">
      <img src="${f.dataUrl}" alt="${esc(f.legenda)}">
      <button class="apagar" data-apagar="${f.id}">×</button>
      ${f.legenda ? `<div class="legenda-f">${esc(f.legenda)}</div>` : ''}
    </div>`).join('');
  $$('#galeria img').forEach((img, i) => { img.onclick = () => verFoto(fotos[i].dataUrl); });
  $$('#galeria [data-apagar]').forEach((b) => {
    b.onclick = async (e) => {
      e.stopPropagation();
      await removerFoto(b.dataset.apagar);
      v.fotos = v.fotos.filter((x) => x !== b.dataset.apagar);
      salvarVeiculo(v);
      mostrarGaleria(v);
      avisar('Foto removida');
    };
  });
}

function abaNotas(v) {
  $('#conteudo-aba').innerHTML = `
    <div class="cartao">
      <div class="cartao-cabeca"><h3>Anotações do veículo</h3></div>
      <div class="cartao-corpo">
        <div class="campo"><textarea id="nova-nota" placeholder="O que aconteceu, o que falta, o que combinaram..."></textarea></div>
        <div class="grade-2" style="align-items:end">
          <div class="campo" style="margin-bottom:0"><label>Quem está anotando</label>
            <input type="text" id="nota-autor" value="${esc(localStorage.getItem('mbrfluxo_autor') || '')}" placeholder="Seu nome"></div>
          <div style="text-align:right"><button class="btn principal" onclick="addNota('${v.id}')">Adicionar anotação</button></div>
        </div>
      </div>
    </div>
    <div style="margin-top:18px">${(v.anotacoes || []).slice().reverse().map((a) => `
      <div class="anotacao">
        <div class="meta"><b>${esc(a.autor || 'Sem autor')}</b> · ${dataBR(a.data)}
          <button onclick="apagarNota('${v.id}','${a.id}')">apagar</button></div>
        <p>${esc(a.texto)}</p>
      </div>`).join('') || '<p style="color:var(--texto-fraco);font-size:13px">Nenhuma anotação ainda.</p>'}</div>`;
}

function addNota(id) {
  const v = acharVeiculo(id);
  const texto = $('#nova-nota').value.trim();
  if (!texto) return;
  const autor = $('#nota-autor').value.trim();
  localStorage.setItem('mbrfluxo_autor', autor);
  v.anotacoes = v.anotacoes || [];
  v.anotacoes.push({ id: 'n_' + Date.now().toString(36), data: hoje(), texto, autor });
  salvarVeiculo(v);
  avisar('Anotação salva');
}

function apagarNota(vid, nid) {
  const v = acharVeiculo(vid);
  v.anotacoes = v.anotacoes.filter((a) => a.id !== nid);
  salvarVeiculo(v);
}

// ---------------------------------------------------------------- clientes
let filtroC = { busca: '', status: '' };

function telaClientes() {
  topo('Clientes', 'Banco de clientes, com o gosto e a necessidade de cada um',
    `<button class="btn principal" onclick="novoCliente()">${ic.mais} Novo cliente</button>`);
  const d = dados();
  let lista = d.clientes.slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  if (filtroC.status) lista = lista.filter((c) => c.status === filtroC.status);
  if (filtroC.busca) {
    const b = filtroC.busca.toLowerCase();
    lista = lista.filter((c) => [c.nome, c.telefone, c.email, c.tipoVeiculo, c.coresPreferidas].join(' ').toLowerCase().includes(b));
  }

  const STATUS = { lead: ['Lead', 'azul'], negociacao: ['Em negociação', 'amarela'], cliente: ['Cliente', 'verde'], perdido: ['Perdido', 'cinza'] };
  const TEMP = { quente: ['Quente', 'vermelha'], morno: ['Morno', 'amarela'], frio: ['Frio', 'azul'] };

  $('#pagina').innerHTML = `
    <div class="filtros">
      <input type="text" id="fc-busca" placeholder="Buscar por nome, telefone, gosto..." value="${esc(filtroC.busca)}">
      <select id="fc-status">
        <option value="">Todos</option>
        ${Object.entries(STATUS).map(([k, s]) => `<option value="${k}">${s[0]}</option>`).join('')}
      </select>
      <span style="font-size:12px;color:var(--texto-fraco);margin-left:auto">${lista.length} de ${d.clientes.length}</span>
    </div>
    ${lista.length ? `<div class="cartao"><table class="tabela">
      <thead><tr><th>Nome</th><th>Situação</th><th>Gosta de</th><th>Faixa de valor</th><th>Cores</th><th>Contato</th></tr></thead>
      <tbody>${lista.map((c) => `<tr onclick="ir('cliente',{clienteId:'${c.id}'})">
        <td class="principal-col">${esc(c.nome || 'Sem nome')}
          ${c.nascimento ? `<div class="fraco">Aniversário: ${dataBR(c.nascimento).slice(0, 5)}</div>` : ''}</td>
        <td><span class="etiqueta ${STATUS[c.status] ? STATUS[c.status][1] : 'cinza'}">${STATUS[c.status] ? STATUS[c.status][0] : c.status}</span>
          ${c.temperatura ? `<span class="etiqueta ${TEMP[c.temperatura][1]}" style="margin-left:4px">${TEMP[c.temperatura][0]}</span>` : ''}</td>
        <td class="fraco">${esc(c.tipoVeiculo || '-')}</td>
        <td class="fraco">${esc(c.faixaValor || '-')}</td>
        <td class="fraco">${esc(c.coresPreferidas || '-')}</td>
        <td class="fraco">${esc(c.telefone || '-')}</td>
      </tr>`).join('')}</tbody></table></div>`
      : vazioHtml(d.clientes.length ? 'Nenhum cliente com esse filtro' : 'Nenhum cliente cadastrado',
          d.clientes.length ? 'Mude o filtro para ver outros.' : 'Cadastre os clientes e os leads com o gosto de cada um: tipo de veículo, faixa de valor e cores preferidas.',
          d.clientes.length ? null : 'novoCliente()', 'Cadastrar cliente')}`;

  $('#fc-status').value = filtroC.status;
  $('#fc-busca').oninput = (e) => { filtroC.busca = e.target.value; const p = e.target.selectionStart; telaClientes(); $('#fc-busca').focus(); $('#fc-busca').setSelectionRange(p, p); };
  $('#fc-status').onchange = (e) => { filtroC.status = e.target.value; telaClientes(); };
}

function novoCliente() {
  const c = clienteNovo();
  salvarCliente(c);
  ir('cliente', { clienteId: c.id });
  avisar('Cliente criado. Preencha a ficha.');
}

function telaCliente() {
  const c = acharCliente(estado.clienteId);
  if (!c) return ir('clientes');
  const veiculosDele = dados().veiculos.filter((v) => v.clienteId === c.id);
  topo(c.nome || 'Cliente sem nome', c.telefone || '', `<button class="btn" onclick="ir('clientes')">${ic.volta} Voltar</button>`);

  $('#pagina').innerHTML = `
    <div id="conteudo-aba">
      <div class="cartao" style="margin-bottom:16px">
        <div class="cartao-cabeca"><h3>Dados do cliente</h3></div>
        <div class="cartao-corpo"><div class="grade">
          ${campo('Nome completo', 'nome', c.nome)}
          ${campo('Como prefere ser chamado', 'apelido', c.apelido)}
          ${campo('Telefone / WhatsApp', 'telefone', c.telefone, 'tel')}
          ${campo('E-mail', 'email', c.email, 'email')}
          ${campo('Data de nascimento', 'nascimento', c.nascimento, 'date')}
          ${campo('Cidade', 'cidade', c.cidade)}
          ${campo('Bairro', 'bairro', c.bairro)}
          ${campo('Profissão', 'profissao', c.profissao)}
          ${campo('Situação', 'status', c.status, 'select', [['lead', 'Lead'], ['negociacao', 'Em negociação'], ['cliente', 'Cliente'], ['perdido', 'Perdido']])}
          ${campo('Temperatura', 'temperatura', c.temperatura, 'select', [['quente', 'Quente'], ['morno', 'Morno'], ['frio', 'Frio']])}
          ${campo('Como conheceu a loja', 'origemLead', c.origemLead, 'select',
            [['', ''], ['Instagram', 'Instagram'], ['Indicação', 'Indicação'], ['OLX Autos', 'OLX Autos'], ['Webmotors', 'Webmotors'],
             ['Google', 'Google'], ['Passou na loja', 'Passou na loja'], ['Cliente antigo', 'Cliente antigo'], ['Outro', 'Outro']])}
        </div>
        <div class="caixa-aviso">Enquanto o sistema estiver em página pública, não cadastre CPF, documentos nem dados bancários (LGPD).</div>
        </div>
      </div>

      <div class="cartao" style="margin-bottom:16px">
        <div class="cartao-cabeca"><h3>Perfil de gosto e necessidade</h3>
          <span class="so-desktop" style="font-size:11.5px;color:var(--texto-fraco)">Perguntado no primeiro contato pelo Pré-Vendas</span></div>
        <div class="cartao-corpo">
          <div class="grade">
            ${campo('Tipo de veículo de que mais gosta', 'tipoVeiculo', c.tipoVeiculo, 'select',
              [['', ''], ['Hatch', 'Hatch'], ['Sedã', 'Sedã'], ['SUV', 'SUV'], ['Picape', 'Picape'], ['Minivan', 'Minivan'],
               ['Esportivo', 'Esportivo'], ['Utilitário', 'Utilitário'], ['Sem preferência', 'Sem preferência']])}
            ${campo('Faixa de valor que procura', 'faixaValor', c.faixaValor, 'select',
              [['', ''], ['Até R$ 40 mil', 'Até R$ 40 mil'], ['R$ 40 a 60 mil', 'R$ 40 a 60 mil'], ['R$ 60 a 80 mil', 'R$ 60 a 80 mil'],
               ['R$ 80 a 100 mil', 'R$ 80 a 100 mil'], ['R$ 100 a 150 mil', 'R$ 100 a 150 mil'], ['Acima de R$ 150 mil', 'Acima de R$ 150 mil']])}
            ${campo('Cores preferidas', 'coresPreferidas', c.coresPreferidas)}
            ${campo('Uso do veículo', 'usoVeiculo', c.usoVeiculo, 'select',
              [['', ''], ['Cidade', 'Cidade'], ['Estrada', 'Estrada'], ['Trabalho', 'Trabalho'], ['Família', 'Família'], ['Aplicativo', 'Aplicativo'], ['Misto', 'Misto']])}
            ${campo('Tem carro na troca', 'temTroca', c.temTroca)}
            ${campo('Quando quer decidir', 'prazoDecisao', c.prazoDecisao, 'select',
              [['', ''], ['Esta semana', 'Esta semana'], ['Até 15 dias', 'Até 15 dias'], ['Até 30 dias', 'Até 30 dias'], ['Sem prazo', 'Sem prazo']])}
          </div>
          ${campo('Observações sobre o perfil', 'observacoesPerfil', c.observacoesPerfil, 'textarea')}
          ${sugestoesHtml(c)}
        </div>
      </div>

      ${veiculosDele.length ? `<div class="cartao" style="margin-bottom:16px">
        <div class="cartao-cabeca"><h3>Veículos deste cliente</h3></div>
        <div class="cartao-corpo">${veiculosDele.map((v) => `
          <div class="pr-item" style="cursor:pointer" onclick="ir('veiculo',{veiculoId:'${v.id}'})">
            <div class="pr-texto"><div class="t">${esc(nomeVeiculo(v))}</div>
              <div class="s">${esc(anoVeiculo(v))} · ${v.status === 'vendido' ? 'Vendido' : 'Em processo'}${v.dataEntrega ? ' · entregue em ' + dataBR(v.dataEntrega) : ''}</div></div>
          </div>`).join('')}</div>
      </div>` : ''}

      <div class="cartao" style="margin-bottom:16px">
        <div class="cartao-cabeca"><h3>Anotações do atendimento</h3></div>
        <div class="cartao-corpo">
          <div class="campo"><textarea id="nova-nota-c" placeholder="O que o cliente falou, o que ficou combinado..."></textarea></div>
          <div style="text-align:right"><button class="btn principal" onclick="addNotaCliente('${c.id}')">Adicionar</button></div>
          <div style="margin-top:16px">${(c.anotacoes || []).slice().reverse().map((a) => `
            <div class="anotacao"><div class="meta">${dataBR(a.data)}
              <button onclick="apagarNotaCliente('${c.id}','${a.id}')">apagar</button></div><p>${esc(a.texto)}</p></div>`).join('')
            || '<p style="color:var(--texto-fraco);font-size:13px">Nenhuma anotação ainda.</p>'}</div>
        </div>
      </div>

      <button class="btn perigo" onclick="apagarCliente('${c.id}')">Excluir este cliente</button>
    </div>`;

  ligarCampos(c, (obj) => { salvarCliente(obj); avisar('Salvo'); });
}

// cruza o gosto do cliente com o estoque
function sugestoesHtml(c) {
  if (!c.tipoVeiculo && !c.coresPreferidas && !c.faixaValor) return '';
  const faixas = {
    'Até R$ 40 mil': [0, 40000], 'R$ 40 a 60 mil': [40000, 60000], 'R$ 60 a 80 mil': [60000, 80000],
    'R$ 80 a 100 mil': [80000, 100000], 'R$ 100 a 150 mil': [100000, 150000], 'Acima de R$ 150 mil': [150000, 1e9],
  };
  const faixa = faixas[c.faixaValor];
  const cores = (c.coresPreferidas || '').toLowerCase().split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
  const achados = dados().veiculos.filter((v) => {
    if (v.status !== 'estoque') return false;
    let pontos = 0;
    if (faixa && v.precoAnuncio && Number(v.precoAnuncio) >= faixa[0] && Number(v.precoAnuncio) <= faixa[1]) pontos++;
    if (cores.length && v.cor && cores.some((x) => v.cor.toLowerCase().includes(x))) pontos++;
    if (c.tipoVeiculo && (v.opcionais || '').toLowerCase().includes(c.tipoVeiculo.toLowerCase())) pontos++;
    return pontos > 0;
  }).slice(0, 4);
  if (!achados.length) return '';
  return `<div class="caixa-info" style="margin-top:4px"><b>Do estoque, combina com o gosto dele:</b><br>
    ${achados.map((v) => `<a href="#" onclick="ir('veiculo',{veiculoId:'${v.id}'});return false">${esc(nomeVeiculo(v))}</a>
      <span style="color:var(--texto-fraco)">(${esc(v.cor || 'cor não informada')}${v.precoAnuncio ? ', ' + moeda(v.precoAnuncio) : ''})</span>`).join('<br>')}</div>`;
}

function addNotaCliente(id) {
  const c = acharCliente(id);
  const texto = $('#nova-nota-c').value.trim();
  if (!texto) return;
  c.anotacoes = c.anotacoes || [];
  c.anotacoes.push({ id: 'n_' + Date.now().toString(36), data: hoje(), texto });
  salvarCliente(c);
  avisar('Anotação salva');
}

function apagarNotaCliente(cid, nid) {
  const c = acharCliente(cid);
  c.anotacoes = c.anotacoes.filter((a) => a.id !== nid);
  salvarCliente(c);
}

function apagarCliente(id) {
  const c = acharCliente(id);
  confirmar('Excluir cliente', `Isso apaga a ficha de <b>${esc(c.nome || 'cliente sem nome')}</b> e as anotações dele.`,
    () => { removerCliente(id); ir('clientes'); avisar('Cliente excluído'); }, 'Excluir');
}

// ---------------------------------------------------------------- agenda
function telaAgenda() {
  const d = dados();
  const ref = estado.mesAgenda;
  const ano = ref.getFullYear(), mes = ref.getMonth();
  topo('Agenda', 'Etapas do processo, feriados, datas comerciais e aniversários',
    `<button class="btn principal" onclick="novoEvento()">${ic.mais} Novo compromisso</button>`);

  const todos = calendarioDoAno(ano, d.clientes, d.eventos);
  const doMes = todos.filter((e) => Number(e.data.split('-')[1]) === mes + 1);
  const primeiro = new Date(ano, mes, 1);
  const inicio = new Date(primeiro); inicio.setDate(1 - primeiro.getDay());
  const celulas = [];
  for (let i = 0; i < 42; i++) {
    const dia = new Date(inicio); dia.setDate(inicio.getDate() + i);
    celulas.push(dia);
  }
  const hj = hoje();

  $('#pagina').innerHTML = `
    <div class="calendario" style="margin-bottom:20px">
      <div class="cal-topo">
        <button class="btn pequeno" onclick="mudarMes(-1)">‹</button>
        <h3>${MESES[mes].charAt(0).toUpperCase() + MESES[mes].slice(1)} de ${ano}</h3>
        <button class="btn pequeno" onclick="mudarMes(1)">›</button>
        <button class="btn pequeno" onclick="irHoje()">Hoje</button>
      </div>
      <div class="cal-semana">${['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map((x) => `<div>${x}</div>`).join('')}</div>
      <div class="cal-grade">${celulas.map((dia) => {
        const k = iso(dia);
        const fora = dia.getMonth() !== mes;
        const evs = todos.filter((e) => e.data === k);
        return `<div class="cal-dia ${fora ? 'fora' : ''} ${ehFimDeSemana(k) ? 'fds' : ''} ${k === hj ? 'hoje' : ''}">
          <div class="n">${dia.getDate()}</div>
          ${evs.slice(0, 3).map((e) => {
            const tp = TIPOS_EVENTO[e.tipo] || TIPOS_EVENTO.outro;
            return `<div class="cal-ev" style="background:${tp.cor}" title="${esc(e.nome)}" onclick="verEvento('${k}')">${esc(e.nome)}</div>`;
          }).join('')}
          ${evs.length > 3 ? `<div style="font-size:10px;color:var(--texto-fraco);cursor:pointer" onclick="verEvento('${k}')">+${evs.length - 3}</div>` : ''}
        </div>`;
      }).join('')}</div>
    </div>

    <div class="cartao">
      <div class="cartao-cabeca"><h3>${MESES[mes].charAt(0).toUpperCase() + MESES[mes].slice(1)} em lista</h3>
        <span style="font-size:11.5px;color:var(--texto-fraco)">${doMes.length} marcações</span></div>
      <div class="cartao-corpo">
        <div class="lista-proximos">${doMes.map((e) => {
          const tp = TIPOS_EVENTO[e.tipo] || TIPOS_EVENTO.outro;
          const [, m, dd] = e.data.split('-');
          return `<div class="pr-item">
            <div class="pr-data"><div class="d">${dd}</div><div class="m">${MES_CURTO[+m - 1]}</div></div>
            <div class="ponto" style="background:${tp.cor}"></div>
            <div class="pr-texto"><div class="t">${esc(e.nome)}${e.feito ? ' <span class="etiqueta verde">feito</span>' : ''}</div>
              <div class="s">${tp.rotulo}${e.hora ? ' · ' + e.hora : ''}${e.obs ? ' · ' + esc(e.obs) : ''}</div></div>
            ${e.id ? `<div style="display:flex;gap:5px">
              <button class="btn pequeno" onclick="marcarFeito('${e.id}')">${e.feito ? 'Reabrir' : 'Feito'}</button>
              <button class="btn pequeno perigo" onclick="removerEvento('${e.id}')">×</button></div>` : ''}
          </div>`;
        }).join('') || '<p style="color:var(--texto-fraco);font-size:13px">Nada neste mês.</p>'}</div>
      </div>
    </div>

    <div class="cartao" style="margin-top:18px">
      <div class="cartao-cabeca"><h3>Legenda</h3></div>
      <div class="cartao-corpo" style="display:flex;gap:16px;flex-wrap:wrap">
        ${Object.entries(TIPOS_EVENTO).map(([, t]) =>
          `<span style="font-size:12px;display:flex;align-items:center;gap:6px"><i style="width:9px;height:9px;border-radius:50%;background:${t.cor};display:inline-block"></i>${t.rotulo}</span>`).join('')}
      </div>
    </div>`;
}

function mudarMes(n) { estado.mesAgenda.setMonth(estado.mesAgenda.getMonth() + n); telaAgenda(); }
function irHoje() { estado.mesAgenda = new Date(); telaAgenda(); }
function marcarFeito(id) {
  const ev = dados().eventos.find((e) => e.id === id);
  if (ev) { ev.feito = !ev.feito; salvarEvento(ev); }
}

function verEvento(data) {
  const d = dados();
  const ano = Number(data.split('-')[0]);
  const evs = calendarioDoAno(ano, d.clientes, d.eventos).filter((e) => e.data === data);
  abrirModal(dataBR(data), evs.map((e) => {
    const tp = TIPOS_EVENTO[e.tipo] || TIPOS_EVENTO.outro;
    return `<div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--linha)">
      <div class="ponto" style="background:${tp.cor}"></div>
      <div><b style="font-size:13.5px">${esc(e.nome)}</b>
        <div style="font-size:12px;color:var(--texto-fraco)">${tp.rotulo}${e.hora ? ' · ' + e.hora : ''}${e.obs ? '<br>' + esc(e.obs) : ''}</div></div>
    </div>`;
  }).join('') || '<p>Nada marcado.</p>', [{ texto: 'Fechar', acao: fecharModal }]);
}

function novoEvento() {
  const d = dados();
  abrirModal('Novo compromisso', `
    <div class="campo"><label>O que é</label><input type="text" id="ne-nome" placeholder="Ex.: visita do João, buscar carro na funilaria"></div>
    <div class="grade-2">
      <div class="campo"><label>Data</label><input type="date" id="ne-data" value="${hoje()}"></div>
      <div class="campo"><label>Hora</label><input type="time" id="ne-hora"></div>
    </div>
    <div class="campo"><label>Tipo</label><select id="ne-tipo">
      ${['visita', 'entrega', 'fase', 'posvenda', 'outro'].map((t) => `<option value="${t}">${TIPOS_EVENTO[t].rotulo}</option>`).join('')}
    </select></div>
    <div class="campo"><label>Veículo (opcional)</label><select id="ne-veiculo">
      <option value="">Nenhum</option>
      ${d.veiculos.map((v) => `<option value="${v.id}">${esc(nomeVeiculo(v))}</option>`).join('')}
    </select></div>
    <div class="campo"><label>Cliente (opcional)</label><select id="ne-cliente">
      <option value="">Nenhum</option>
      ${d.clientes.map((c) => `<option value="${c.id}">${esc(c.nome || 'Sem nome')}</option>`).join('')}
    </select></div>
    <div class="campo"><label>Observação</label><input type="text" id="ne-obs"></div>`,
    [{ texto: 'Cancelar', acao: fecharModal },
     { texto: 'Salvar', classe: 'principal', acao: () => {
        const nome = $('#ne-nome').value.trim();
        if (!nome) return avisar('Escreva o que é o compromisso');
        salvarEvento({
          nome, data: $('#ne-data').value, hora: $('#ne-hora').value, tipo: $('#ne-tipo').value,
          veiculoId: $('#ne-veiculo').value, clienteId: $('#ne-cliente').value, obs: $('#ne-obs').value, feito: false,
        });
        fecharModal(); avisar('Compromisso salvo');
      } }]);
}

// ---------------------------------------------------------------- o processo (consulta)
function telaProcesso() {
  topo('O processo', 'As 13 fases do Manual Guia do Processo de Vendas', '');
  $('#pagina').innerHTML = `
    <div class="caixa-info">
      Esta é a referência completa do processo, como está no manual. Cada veículo cadastrado recebe uma cópia deste
      checklist, filtrada pela origem dele (usado, consignado ou zero km).
    </div>
    ${FASES.map((f) => `
      <div class="fase-bloco" data-fase="p${f.n}">
        <div class="fase-cabeca" onclick="this.parentElement.classList.toggle('aberta')">
          <div class="fase-num">${f.n}</div>
          <div class="ft"><h4>${esc(f.t)}</h4><p>${f.jornada === 'veiculo' ? 'Jornada do veículo' : 'Jornada do cliente'} · ${esc(f.dono)}</p></div>
          <div class="conta">${f.grupos.reduce((s, g) => s + g.itens.length, 0)} itens</div>
        </div>
        <div class="fase-corpo">
          <div class="fase-meta">
            <div><b>Objetivo:</b> ${esc(f.obj)}</div>
            <div><b>Começa quando:</b> ${esc(f.gatilho)}</div>
            <div><b>Dono:</b> ${esc(f.dono)}</div>
            <div><b>Prazo ou meta:</b> ${esc(f.prazo)}</div>
          </div>
          ${f.grupos.map((g) => `<div class="sub-grupo">${esc(g.t)}</div>
            ${g.itens.map((it) => `<div class="item-ck"><div style="width:17px;flex:none"></div>
              <div class="txt">${esc(it.i)}<span class="quem">${esc(it.q)} · ${it.o === 'T' ? 'todos os veículos' : ORIGENS[it.o].nome}</span></div></div>`).join('')}`).join('')}
          <div class="passa-caixa"><b>Só passa para a próxima fase quando:</b> ${esc(f.passa)}</div>
        </div>
      </div>`).join('')}`;
}

// ---------------------------------------------------------------- dados e backup
async function telaDados() {
  topo('Dados e backup', 'Onde ficam os dados e como levar para outro aparelho', '');
  const d = dados();
  const esp = await espacoUsado();
  const mb = (b) => (b / 1048576).toFixed(2) + ' MB';

  $('#pagina').innerHTML = `
    <div class="caixa-aviso">
      <b>Importante:</b> os dados ficam guardados só neste navegador, neste aparelho. Quem abrir o sistema em outro
      computador ou celular não vê o que foi lançado aqui. Limpar os dados do navegador apaga tudo.
      Faça backup com frequência e guarde o arquivo em local seguro.
    </div>

    <div class="grade-2" style="gap:18px">
      <div class="cartao">
        <div class="cartao-cabeca"><h3>Backup</h3></div>
        <div class="cartao-corpo">
          <p style="font-size:13px;color:var(--texto-fraco);margin-bottom:14px">
            Baixa um arquivo com tudo: veículos, clientes, checklists, agenda, anotações e fotos. É esse arquivo que
            leva os dados para outro aparelho ou recupera tudo se algo acontecer.</p>
          <button class="btn principal" onclick="baixarBackup()">Baixar backup agora</button>
          <hr style="border:0;border-top:1px solid var(--linha);margin:18px 0">
          <p style="font-size:13px;color:var(--texto-fraco);margin-bottom:10px">Restaurar a partir de um arquivo de backup:</p>
          <input type="file" id="arq-backup" accept=".json,application/json">
          <div style="display:flex;gap:8px;margin-top:11px;flex-wrap:wrap">
            <button class="btn" onclick="restaurar(false)">Juntar com o que já existe</button>
            <button class="btn perigo" onclick="restaurar(true)">Substituir tudo</button>
          </div>
        </div>
      </div>

      <div class="cartao">
        <div class="cartao-cabeca"><h3>Espaço usado</h3></div>
        <div class="cartao-corpo">
          <div class="indicadores" style="grid-template-columns:1fr 1fr;margin:0">
            <div class="indicador"><div class="n" style="font-size:20px">${d.veiculos.length}</div><div class="r">veículos</div></div>
            <div class="indicador"><div class="n" style="font-size:20px">${d.clientes.length}</div><div class="r">clientes</div></div>
            <div class="indicador"><div class="n" style="font-size:20px">${mb(esp.local)}</div><div class="r">registros</div></div>
            <div class="indicador"><div class="n" style="font-size:20px">${mb(esp.fotos)}</div><div class="r">fotos</div></div>
          </div>
          ${esp.cota && esp.cota.quota ? `<p style="font-size:12px;color:var(--texto-fraco);margin-top:12px">
            O navegador reserva cerca de ${mb(esp.cota.quota)} para este site.</p>` : ''}
          <p style="font-size:12px;color:var(--texto-fraco);margin-top:8px">
            Último salvamento: ${d.config.atualizado ? new Date(d.config.atualizado).toLocaleString('pt-BR') : 'ainda não houve'}</p>
        </div>
      </div>
    </div>

    <div class="cartao" style="margin-top:18px">
      <div class="cartao-cabeca"><h3>Senha de acesso</h3></div>
      <div class="cartao-corpo">
        <p style="font-size:13px;color:var(--texto-fraco);margin-bottom:12px">
          A senha é só um obstáculo visual, não protege de verdade. A senha inicial é <b>motorbr2026</b>.</p>
        <div class="grade-2">
          <div class="campo"><label>Nova senha</label><input type="password" id="nova-senha"></div>
          <div class="campo"><label>Repetir</label><input type="password" id="nova-senha2"></div>
        </div>
        <button class="btn" onclick="trocarSenha()">Trocar senha</button>
      </div>
    </div>

    <div class="cartao" style="margin-top:18px">
      <div class="cartao-cabeca"><h3>Dados de exemplo e limpeza</h3></div>
      <div class="cartao-corpo" style="display:flex;gap:9px;flex-wrap:wrap">
        <button class="btn" onclick="carregarExemplo()">Carregar dados de exemplo</button>
        <button class="btn perigo" onclick="limparTudo()">Apagar tudo</button>
      </div>
    </div>`;
}

async function baixarBackup() {
  avisar('Montando o backup...');
  const txt = await exportar();
  const blob = new Blob([txt], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `motorbr-fluxograma-${hoje()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  avisar('Backup baixado');
}

function restaurar(substituir) {
  const arq = $('#arq-backup').files[0];
  if (!arq) return avisar('Escolha o arquivo de backup primeiro');
  const fazer = async () => {
    try {
      await importar(await arq.text(), substituir);
      avisar('Backup restaurado');
      ir('painel');
    } catch (e) { alert('Não consegui ler esse arquivo: ' + e.message); }
  };
  if (substituir) confirmar('Substituir tudo', 'Isso apaga o que está no sistema agora e coloca o conteúdo do arquivo no lugar.', fazer, 'Substituir');
  else fazer();
}

async function trocarSenha() {
  const a = $('#nova-senha').value, b = $('#nova-senha2').value;
  if (!a || a.length < 4) return avisar('A senha precisa de pelo menos 4 caracteres');
  if (a !== b) return avisar('As duas senhas não são iguais');
  localStorage.setItem('mbrfluxo_senha', await hash(a));
  avisar('Senha trocada');
  $('#nova-senha').value = ''; $('#nova-senha2').value = '';
}

function limparTudo() {
  confirmar('Apagar tudo', 'Isso apaga todos os veículos, clientes, checklists, fotos e a agenda deste navegador. Baixe um backup antes se quiser guardar.',
    () => { apagarTudo(); ir('painel'); avisar('Tudo apagado'); }, 'Apagar tudo');
}

function carregarExemplo() {
  const fazer = () => {
    const c1 = clienteNovo();
    Object.assign(c1, { nome: 'Rafael Moreira', telefone: '(11) 98888-1111', nascimento: '1991-03-14',
      cidade: 'São Paulo', bairro: 'Pinheiros', profissao: 'Analista de logística', status: 'negociacao',
      temperatura: 'quente', origemLead: 'Instagram', tipoVeiculo: 'SUV', faixaValor: 'R$ 80 a 100 mil',
      coresPreferidas: 'Prata, branco', usoVeiculo: 'Família', temTroca: 'Hatch 2016', prazoDecisao: 'Até 15 dias',
      observacoesPerfil: 'Esposa quer porta-malas grande. Viaja para o litoral uma vez por mês.' });
    salvarCliente(c1);

    const c2 = clienteNovo();
    Object.assign(c2, { nome: 'Juliana Prado', telefone: '(11) 97777-2222', nascimento: '1984-11-08',
      cidade: 'São Paulo', bairro: 'Butantã', profissao: 'Cabeleireira', status: 'lead', temperatura: 'morno',
      origemLead: 'Indicação', tipoVeiculo: 'Hatch', faixaValor: 'Até R$ 40 mil', coresPreferidas: 'Vermelho, preto',
      usoVeiculo: 'Trabalho', temTroca: 'Não', prazoDecisao: 'Até 30 dias' });
    salvarCliente(c2);

    const v1 = veiculoNovo();
    Object.assign(v1, { origem: 'U', marca: 'Jeep', modelo: 'Compass', versao: 'Limited', anoFab: '2021', anoMod: '2021',
      cor: 'Prata', placa: 'ABC1D23', km: '48000', cambio: 'Automático', combustivel: 'Flex', portas: '4',
      precoCompra: '82000', custoPreparacao: '3500', precoAnuncio: '98900',
      entrada: ((d) => { d.setDate(d.getDate() - 12); return iso(d); })(new Date()),
      opcionais: 'SUV. Teto solar, multimídia, câmera de ré, bancos de couro.' });
    FASES.slice(0, 4).forEach((f) => itensDaFase(f, 'U').forEach((g) => g.itens.forEach((it) => {
      v1.concluido[chaveItem(f.n, it.i)] = { data: hoje() };
    })));
    v1.anotacoes = [{ id: 'n1', data: hoje(), texto: 'Revisão feita na autorizada. Falta o polimento antes das fotos.', autor: 'Exemplo' }];
    salvarVeiculo(v1);

    const v2 = veiculoNovo();
    Object.assign(v2, { origem: 'C', marca: 'Toyota', modelo: 'Corolla', versao: 'XEi', anoFab: '2022', anoMod: '2022',
      cor: 'Branco', placa: 'DEF4G56', km: '31000', cambio: 'CVT', combustivel: 'Flex', portas: '4',
      precoAnuncio: '129900', proprietario: 'Marcos Lima', contatoProprietario: '(11) 96666-3333',
      valorMinimoRepasse: '118000', comissao: '5%',
      entrada: ((d) => { d.setDate(d.getDate() - 45); return iso(d); })(new Date()),
      opcionais: 'Sedã. Único dono, revisões na concessionária.' });
    salvarVeiculo(v2);

    const v3 = veiculoNovo();
    Object.assign(v3, { origem: 'Z', marca: 'Fiat', modelo: 'Pulse', versao: 'Drive 1.3', anoFab: '2026', anoMod: '2026',
      cor: 'Vermelho', km: '0', cambio: 'Automático', combustivel: 'Flex', portas: '4', precoAnuncio: '112000',
      entrada: hoje(), opcionais: 'SUV compacto. Zero km, garantia de fábrica.' });
    salvarVeiculo(v3);

    salvarEvento({ nome: `Visita de Rafael Moreira · ${nomeVeiculo(v1)}`, data: ((d) => { d.setDate(d.getDate() + 2); return iso(d); })(new Date()),
      hora: '10:00', tipo: 'visita', veiculoId: v1.id, clienteId: c1.id, obs: 'Confirmar na véspera', feito: false });
    salvarEvento({ nome: `Gravação de vídeos · ${nomeVeiculo(v2)}`, data: ((d) => { d.setDate(d.getDate() + 1); return iso(d); })(new Date()),
      hora: '09:30', tipo: 'fase', veiculoId: v2.id, fase: 5, obs: 'Parado há 45 dias, prioridade de conteúdo', feito: false });

    ir('painel');
    avisar('Dados de exemplo carregados');
  };
  if (dados().veiculos.length || dados().clientes.length) {
    confirmar('Carregar exemplo', 'Já existem dados no sistema. Os exemplos serão somados ao que já está aqui.', fazer, 'Carregar');
  } else fazer();
}

// ---------------------------------------------------------------- início
if (sessionStorage.getItem('mbrfluxo_ok')) entrar();
