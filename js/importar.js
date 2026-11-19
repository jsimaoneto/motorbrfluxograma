// +Motor BR Fluxograma · ficha Excel de veículos (baixar o modelo e importar preenchida)
// O modelo é gerado por modelos/gerar_ficha.py: os títulos das colunas abaixo precisam ser os mesmos de lá.
// A leitura do .xlsx usa a SheetJS, carregada só quando alguém importa.

const MODELO_FICHA = 'modelos/Ficha_Cadastro_Veiculos_MotorBR.xlsx';
const SHEETJS = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';

// coluna da ficha -> campo do veículo e tipo
const COLUNAS_FICHA = [
  ['Placa', 'placa', 'placa'], ['Chassi (VIN)', 'chassi', 'maiusc'], ['Renavam', 'renavam', 'texto'],
  ['Origem', 'origem', 'origem'], ['Status', 'status', 'status'], ['Data de entrada', 'entrada', 'data'],
  ['Marca', 'marca', 'texto'], ['Modelo', 'modelo', 'texto'], ['Versão', 'versao', 'texto'], ['Motor', 'motor', 'texto'],
  ['Carroceria', 'carroceria', 'texto'], ['Ano fabricação', 'anoFab', 'ano'], ['Ano modelo', 'anoMod', 'ano'],
  ['Cor', 'cor', 'texto'], ['Blindado', 'blindado', 'simnao'], ['Km', 'km', 'numero'], ['Câmbio', 'cambio', 'texto'],
  ['Combustível', 'combustivel', 'texto'], ['Portas', 'portas', 'numero'], ['Chaves', 'chaves', 'numero'],
  ['Opcionais e observações', 'opcionais', 'texto'], ['Título do anúncio', 'tituloAnuncio', 'texto'],
  ['Sobre o veículo', 'sobre', 'texto'], ['Link do anúncio no site', 'linkAnuncio', 'texto'],
  ['Preço de compra (R$)', 'precoCompra', 'moeda'], ['Custo de preparação (R$)', 'custoPreparacao', 'moeda'],
  ['Preço de anúncio (R$)', 'precoAnuncio', 'moeda'], ['Preço de venda (R$)', 'precoVenda', 'moeda'],
  ['Proprietário (consignado)', 'proprietario', 'texto'], ['Contato do proprietário', 'contatoProprietario', 'texto'],
  ['Valor mínimo de repasse (R$)', 'valorMinimoRepasse', 'moeda'], ['Comissão', 'comissao', 'texto'],
  ['Cliente comprador', 'clienteId', 'cliente'], ['Data da venda', 'dataVenda', 'data'], ['Data da entrega', 'dataEntrega', 'data'],
];

const semAcento = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const pad = (n) => String(n).padStart(2, '0');

function baixarFicha() {
  const a = document.createElement('a');
  a.href = MODELO_FICHA + '?v=' + Date.now();
  a.download = 'Ficha_Cadastro_Veiculos_MotorBR.xlsx';
  document.body.appendChild(a); a.click(); a.remove();
  avisar('Ficha baixada. Preencha a aba Veículos e importe aqui.');
}

function carregarSheetJS() {
  if (window.XLSX) return Promise.resolve();
  return new Promise((ok, erro) => {
    const s = document.createElement('script');
    s.src = SHEETJS;
    s.onload = ok;
    s.onerror = () => erro(new Error('Não consegui carregar o leitor de Excel. Confira a internet e tente de novo.'));
    document.head.appendChild(s);
  });
}

function escolherFicha() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.xlsx,.xls,.csv';
  inp.onchange = () => { if (inp.files[0]) lerFicha(inp.files[0]); };
  inp.click();
}

// ---------------------------------------------------------------- conversão de cada célula
function converter(tipo, bruto) {
  if (bruto === '' || bruto == null) return { v: '' };
  const s = String(bruto).trim();
  if (!s) return { v: '' };
  switch (tipo) {
    case 'placa': return { v: s.toUpperCase().replace(/[^A-Z0-9]/g, '') };
    case 'maiusc': return { v: s.toUpperCase().replace(/\s/g, '') };
    case 'origem': {
      const k = semAcento(s);
      const o = k.startsWith('usad') ? 'U' : k.startsWith('consig') ? 'C' : (k.includes('zero') || k === '0km' || k.startsWith('nov')) ? 'Z' : '';
      return o ? { v: o } : { erro: `Origem "${s}" não reconhecida (use Usado, Consignado ou Zero km)` };
    }
    case 'status': {
      const k = semAcento(s);
      const st = k.includes('vend') ? 'vendido' : k.includes('repass') ? 'repassado' : (k.includes('estoque') || k === 'disponivel') ? 'estoque' : '';
      return st ? { v: st } : { erro: `Status "${s}" não reconhecido` };
    }
    case 'simnao': return { v: /^s/i.test(s) ? 'Sim' : 'Não' };
    case 'data': {
      if (typeof bruto === 'number') { // número de série do Excel
        const d = new Date(Math.round((bruto - 25569) * 86400000));
        return { v: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` };
      }
      let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
      if (m) return { v: `${m[3].length === 2 ? '20' + m[3] : m[3]}-${pad(m[2])}-${pad(m[1])}` };
      m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return { v: `${m[1]}-${m[2]}-${m[3]}` };
      return { erro: `Data "${s}" inválida (use dd/mm/aaaa)` };
    }
    case 'ano': {
      const n = parseInt(s, 10);
      return n >= 1950 && n <= 2100 ? { v: String(n) } : { erro: `Ano "${s}" inválido` };
    }
    case 'numero':
    case 'moeda': {
      if (typeof bruto === 'number') return { v: String(bruto) };
      const limpo = s.replace(/[R$\s]/g, '');
      const n = Number(/,\d{1,2}$/.test(limpo) ? limpo.replace(/\./g, '').replace(',', '.') : limpo.replace(/[.,]/g, ''));
      return isNaN(n) ? { erro: `"${s}" não é um número` } : { v: String(n) };
    }
    default: return { v: s };
  }
}

// ---------------------------------------------------------------- leitura e prévia
async function lerFicha(arquivo) {
  try {
    avisar('Lendo a planilha…');
    await carregarSheetJS();
    const wb = XLSX.read(await arquivo.arrayBuffer(), { type: 'array' });
    const nomeAba = wb.SheetNames.find((n) => semAcento(n) === 'veiculos') || wb.SheetNames[0];
    const linhas = XLSX.utils.sheet_to_json(wb.Sheets[nomeAba], { defval: '', raw: true });
    prepararImportacao(linhas);
  } catch (e) {
    abrirModal('Não deu para ler a planilha', `<p>${esc(e.message)}</p>`, [{ texto: 'Fechar', acao: fecharModal }]);
  }
}

function prepararImportacao(linhas) {
  const d = dados();
  const porPlaca = new Map(d.veiculos.filter((v) => v.placa).map((v) => [v.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''), v]));
  const porChassi = new Map(d.veiculos.filter((v) => v.chassi).map((v) => [v.chassi.toUpperCase().replace(/\s/g, ''), v]));
  const clientePorNome = new Map(d.clientes.map((c) => [semAcento(c.nome), c.id]));
  const colunaDe = (row) => { // título da planilha -> chave original (ignora acento, maiúscula e *)
    const mapa = {};
    Object.keys(row).forEach((k) => { mapa[semAcento(k)] = k; });
    return mapa;
  };

  const novos = [], atualizar = [], erros = [], avisos = [];
  const vistos = new Set();
  linhas.forEach((row, i) => {
    const nLinha = i + 2;
    const mapa = colunaDe(row);
    if (Object.values(row).every((x) => String(x).trim() === '')) return; // linha vazia
    const campos = {};
    const probs = [];
    COLUNAS_FICHA.forEach(([titulo, chave, tipo]) => {
      const k = mapa[semAcento(titulo)];
      if (k === undefined) return;
      if (tipo === 'cliente') {
        const nome = String(row[k]).trim();
        if (!nome) return;
        const id = clientePorNome.get(semAcento(nome));
        if (id) campos.clienteId = id; else avisos.push(`Linha ${nLinha}: cliente "${nome}" não está cadastrado; a linha entra sem cliente.`);
        return;
      }
      const r = converter(tipo, row[k]);
      if (r.erro) probs.push(r.erro); else if (r.v !== '') campos[chave] = r.v;
    });

    const existente = (campos.placa && porPlaca.get(campos.placa)) || (campos.chassi && porChassi.get(campos.chassi));
    if (!existente) {
      if (!campos.marca || !campos.modelo) probs.push('Marca e Modelo são obrigatórios');
      if (!campos.origem && !probs.some((p) => p.startsWith('Origem'))) probs.push('Origem é obrigatória (Usado, Consignado ou Zero km)');
    }
    const chaveDup = campos.placa || campos.chassi;
    if (chaveDup && vistos.has(chaveDup)) probs.push(`Placa ou chassi ${chaveDup} repetido na planilha`);
    if (chaveDup) vistos.add(chaveDup);
    if (probs.length) { erros.push({ nLinha, probs, nome: [campos.marca, campos.modelo, campos.placa].filter(Boolean).join(' ') }); return; }
    if (existente) atualizar.push({ v: existente, campos }); else novos.push(campos);
  });

  estado.importacao = { novos, atualizar };
  const nome = (c) => esc([c.marca, c.modelo, c.versao].filter(Boolean).join(' ') + (c.placa ? ' · ' + c.placa : ''));
  abrirModal('Importar veículos da planilha', `
    <div class="indicadores" style="margin-bottom:14px">
      <div class="indicador destaque"><div class="n">${novos.length}</div><div class="r">novos</div></div>
      <div class="indicador"><div class="n">${atualizar.length}</div><div class="r">serão atualizados</div></div>
      <div class="indicador ${erros.length ? 'alerta' : ''}"><div class="n">${erros.length}</div><div class="r">com erro (ficam de fora)</div></div>
    </div>
    ${erros.length ? `<div class="caixa-aviso"><b>Linhas com erro:</b><br>${erros.slice(0, 30).map((e) => `Linha ${e.nLinha}${e.nome ? ' (' + esc(e.nome) + ')' : ''}: ${esc(e.probs.join('; '))}`).join('<br>')}${erros.length > 30 ? `<br>e mais ${erros.length - 30}` : ''}</div>` : ''}
    ${avisos.length ? `<div class="caixa-info">${avisos.slice(0, 15).map(esc).join('<br>')}</div>` : ''}
    ${novos.length ? `<div class="sub-grupo">Novos</div><div class="fraco" style="font-size:12.5px">${novos.slice(0, 40).map(nome).join('<br>')}${novos.length > 40 ? '<br>…' : ''}</div>` : ''}
    ${atualizar.length ? `<div class="sub-grupo">Atualizados (só as células preenchidas mudam)</div><div class="fraco" style="font-size:12.5px">${atualizar.slice(0, 40).map((a) => esc(nomeVeiculo(a.v)) + (a.v.placa ? ' · ' + esc(a.v.placa) : '')).join('<br>')}${atualizar.length > 40 ? '<br>…' : ''}</div>` : ''}
    ${!novos.length && !atualizar.length ? '<p class="fraco">Nada para importar. Confira se os veículos estão na aba Veículos, a partir da linha 2.</p>' : ''}
    <p class="fraco" style="font-size:11.5px;margin-top:14px">Dica: baixe um backup em Dados e backup antes de importar uma lista grande.</p>`,
    [{ texto: 'Cancelar', acao: fecharModal }].concat(novos.length || atualizar.length
      ? [{ texto: `Importar ${novos.length + atualizar.length} veículo${novos.length + atualizar.length === 1 ? '' : 's'}`, classe: 'principal', acao: confirmarImportacao }] : []));
}

function confirmarImportacao() {
  const { novos, atualizar } = estado.importacao || { novos: [], atualizar: [] };
  const d = dados();
  novos.forEach((campos) => {
    const v = veiculoNovo();
    Object.assign(v, campos);
    if (!campos.entrada) v.entrada = hoje();
    d.veiculos.push(v);
  });
  atualizar.forEach(({ v, campos }) => Object.assign(v, campos));
  salvar(); // grava tudo de uma vez
  estado.importacao = null;
  fecharModal();
  ir('veiculos');
  avisar(`${novos.length} novo${novos.length === 1 ? '' : 's'} e ${atualizar.length} atualizado${atualizar.length === 1 ? '' : 's'}`);
}
