// Camada de dados do +Motor BR Fluxograma.
// Registros (veículos, clientes, agenda, checklists) ficam no localStorage; as fotos ficam no IndexedDB,
// que aguenta muito mais espaço. Tudo é gravado só no navegador de quem usa.
// Esta camada é a única parte que fala com o armazenamento: para trocar por um banco de verdade
// (Supabase, por exemplo), basta reescrever as funções daqui mantendo os mesmos nomes.

const CHAVE = 'mbrfluxo_v1';
const VERSAO_DADOS = 1;

const vazio = () => ({
  versao: VERSAO_DADOS,
  veiculos: [],
  clientes: [],
  eventos: [],      // agenda: compromissos criados à mão ou vindos do checklist
  config: { loja: '+Motor BR', atualizado: null },
});

let DADOS = vazio();
const ouvintes = [];

function aoMudar(fn) { ouvintes.push(fn); }
function avisar() { ouvintes.forEach((f) => f()); }

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const d = JSON.parse(bruto);
      DADOS = Object.assign(vazio(), d);
    }
  } catch (e) {
    console.warn('Não consegui ler os dados salvos:', e);
  }
  return DADOS;
}

function salvar() {
  DADOS.config.atualizado = new Date().toISOString();
  try {
    localStorage.setItem(CHAVE, JSON.stringify(DADOS));
  } catch (e) {
    alert('Não foi possível salvar: o armazenamento do navegador encheu ou está bloqueado.\n\nFaça um backup pelo menu Dados e remova fotos antigas.');
    console.error(e);
    return false;
  }
  avisar();
  return true;
}

const dados = () => DADOS;

function novoId(prefixo) {
  return prefixo + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------------------------------------------------------------- veículos
function veiculoNovo() {
  return {
    id: novoId('v'),
    origem: 'U',
    marca: '', modelo: '', versao: '', anoFab: '', anoMod: '',
    placa: '', chassi: '', renavam: '', cor: '', combustivel: '', cambio: '',
    km: '', portas: '', opcionais: '', chaves: '2',
    motor: '', carroceria: '', blindado: 'Não',   // como no anúncio do site da loja
    tituloAnuncio: '', sobre: '', linkAnuncio: '',
    precoCompra: '', custoPreparacao: '', precoAnuncio: '', precoVenda: '',
    entrada: hoje(), status: 'estoque',   // estoque · vendido · repassado
    fase: 1, concluido: {},               // concluido[chaveItem] = { data, por }
    fasesDatas: {},                       // fasesDatas[n] = { previsto, realizado }
    proprietario: '', contatoProprietario: '', valorMinimoRepasse: '', comissao: '',
    clienteId: '', dataVenda: '', dataEntrega: '',
    anotacoes: [],                        // { id, data, texto, autor }
    fotos: [],                            // ids das fotos no IndexedDB
    criado: new Date().toISOString(),
  };
}

function salvarVeiculo(v) {
  const i = DADOS.veiculos.findIndex((x) => x.id === v.id);
  if (i >= 0) DADOS.veiculos[i] = v; else DADOS.veiculos.push(v);
  return salvar();
}

function removerVeiculo(id) {
  const v = acharVeiculo(id);
  if (v) (v.fotos || []).forEach((f) => removerFoto(f));
  DADOS.veiculos = DADOS.veiculos.filter((x) => x.id !== id);
  DADOS.eventos = DADOS.eventos.filter((e) => e.veiculoId !== id);
  return salvar();
}

const acharVeiculo = (id) => DADOS.veiculos.find((x) => x.id === id);

// ---------------------------------------------------------------- clientes
function clienteNovo() {
  return {
    id: novoId('c'),
    nome: '', apelido: '', telefone: '', email: '', cpf: '',
    nascimento: '', cidade: '', bairro: '', profissao: '',
    origemLead: '', temperatura: 'morno',  // quente · morno · frio
    tipoVeiculo: '', faixaValor: '', coresPreferidas: '',
    usoVeiculo: '', temTroca: '', prazoDecisao: '', observacoesPerfil: '',
    status: 'lead',                        // lead · negociacao · cliente · perdido
    anotacoes: [],
    criado: new Date().toISOString(),
  };
}

function salvarCliente(c) {
  const i = DADOS.clientes.findIndex((x) => x.id === c.id);
  if (i >= 0) DADOS.clientes[i] = c; else DADOS.clientes.push(c);
  return salvar();
}

function removerCliente(id) {
  DADOS.clientes = DADOS.clientes.filter((x) => x.id !== id);
  DADOS.eventos = DADOS.eventos.filter((e) => e.clienteId !== id);
  DADOS.veiculos.forEach((v) => { if (v.clienteId === id) v.clienteId = ''; });
  return salvar();
}

const acharCliente = (id) => DADOS.clientes.find((x) => x.id === id);

// ---------------------------------------------------------------- agenda
function salvarEvento(ev) {
  if (!ev.id) ev.id = novoId('e');
  const i = DADOS.eventos.findIndex((x) => x.id === ev.id);
  if (i >= 0) DADOS.eventos[i] = ev; else DADOS.eventos.push(ev);
  return salvar();
}

function removerEvento(id) {
  DADOS.eventos = DADOS.eventos.filter((x) => x.id !== id);
  return salvar();
}

// ---------------------------------------------------------------- fotos (IndexedDB)
let bancoFotos = null;

function abrirFotos() {
  if (bancoFotos) return Promise.resolve(bancoFotos);
  return new Promise((ok, erro) => {
    const req = indexedDB.open('mbrfluxo_fotos', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('fotos')) db.createObjectStore('fotos', { keyPath: 'id' });
    };
    req.onsuccess = () => { bancoFotos = req.result; ok(bancoFotos); };
    req.onerror = () => erro(req.error);
  });
}

async function guardarFoto(dataUrl, veiculoId, legenda) {
  const db = await abrirFotos();
  const id = novoId('f');
  await new Promise((ok, erro) => {
    const tx = db.transaction('fotos', 'readwrite');
    tx.objectStore('fotos').put({ id, veiculoId, legenda: legenda || '', dataUrl, criado: Date.now() });
    tx.oncomplete = ok; tx.onerror = () => erro(tx.error);
  });
  return id;
}

async function lerFoto(id) {
  const db = await abrirFotos();
  return new Promise((ok, erro) => {
    const req = db.transaction('fotos', 'readonly').objectStore('fotos').get(id);
    req.onsuccess = () => ok(req.result || null);
    req.onerror = () => erro(req.error);
  });
}

async function removerFoto(id) {
  const db = await abrirFotos();
  return new Promise((ok) => {
    const tx = db.transaction('fotos', 'readwrite');
    tx.objectStore('fotos').delete(id);
    tx.oncomplete = ok; tx.onerror = ok;
  });
}

async function todasAsFotos() {
  const db = await abrirFotos();
  return new Promise((ok, erro) => {
    const req = db.transaction('fotos', 'readonly').objectStore('fotos').getAll();
    req.onsuccess = () => ok(req.result || []);
    req.onerror = () => erro(req.error);
  });
}

// Reduz a foto antes de guardar, para não encher o navegador
function reduzirImagem(file, maxLado = 1400, qualidade = 0.72) {
  return new Promise((ok, erro) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w > maxLado || h > maxLado) {
          const r = Math.min(maxLado / w, maxLado / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        ok(c.toDataURL('image/jpeg', qualidade));
      };
      img.onerror = erro;
      img.src = leitor.result;
    };
    leitor.onerror = erro;
    leitor.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------- backup
async function exportar() {
  const fotos = await todasAsFotos();
  return JSON.stringify({ ...DADOS, _fotos: fotos, _exportado: new Date().toISOString() }, null, 1);
}

async function importar(texto, substituir) {
  const d = JSON.parse(texto);
  if (!d || !Array.isArray(d.veiculos)) throw new Error('Arquivo não parece ser um backup do sistema.');
  const fotos = d._fotos || [];
  delete d._fotos; delete d._exportado;
  if (substituir) {
    DADOS = Object.assign(vazio(), d);
  } else {
    const idsV = new Set(DADOS.veiculos.map((x) => x.id));
    const idsC = new Set(DADOS.clientes.map((x) => x.id));
    const idsE = new Set(DADOS.eventos.map((x) => x.id));
    d.veiculos.forEach((v) => { if (!idsV.has(v.id)) DADOS.veiculos.push(v); });
    (d.clientes || []).forEach((c) => { if (!idsC.has(c.id)) DADOS.clientes.push(c); });
    (d.eventos || []).forEach((e) => { if (!idsE.has(e.id)) DADOS.eventos.push(e); });
  }
  const db = await abrirFotos();
  await new Promise((ok, erro) => {
    const tx = db.transaction('fotos', 'readwrite');
    const st = tx.objectStore('fotos');
    if (substituir) st.clear();
    fotos.forEach((f) => st.put(f));
    tx.oncomplete = ok; tx.onerror = () => erro(tx.error);
  });
  salvar();
}

function apagarTudo() {
  localStorage.removeItem(CHAVE);
  indexedDB.deleteDatabase('mbrfluxo_fotos');
  bancoFotos = null;
  DADOS = vazio();
  avisar();
}

// Quanto já foi usado do armazenamento do navegador
async function espacoUsado() {
  const local = new Blob([localStorage.getItem(CHAVE) || '']).size;
  let fotosBytes = 0;
  try {
    (await todasAsFotos()).forEach((f) => { fotosBytes += (f.dataUrl || '').length * 0.75; });
  } catch (e) { /* IndexedDB indisponível */ }
  let cota = null;
  if (navigator.storage && navigator.storage.estimate) {
    try { cota = await navigator.storage.estimate(); } catch (e) { /* sem permissão */ }
  }
  return { local, fotos: fotosBytes, cota };
}

// ---------------------------------------------------------------- utilidades de data
function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dataBR(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

function diasEntre(isoA, isoB) {
  if (!isoA) return 0;
  const a = new Date(isoA + 'T00:00:00');
  const b = isoB ? new Date(isoB + 'T00:00:00') : new Date();
  return Math.round((b - a) / 86400000);
}
