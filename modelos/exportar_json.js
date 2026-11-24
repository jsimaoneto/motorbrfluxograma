// Exporta os dois checklists como JSON, lendo o codigo do site do fluxograma.
const fs = require('fs'); const path = require('path'); const vm = require('vm');
const raiz = 'D:/Claude/motorbrfluxograma';
const ctx = { console, URL, Math, location: { href: '' }, document: { querySelector: () => null },
  esc: (s) => s, hoje: () => '', dataBR: () => '', nomeVeiculo: () => '', acharVeiculo: () => null,
  salvarVeiculo: () => {}, itensProcesso: () => [], avisar: () => {}, $: () => ({}), ic: {}, window: {} };
ctx.globalThis = ctx; vm.createContext(ctx);
['recebimento', 'vistoria'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(raiz, 'js', f + '.js'), 'utf8'), ctx));
const saida = vm.runInContext(`JSON.stringify({
  vistoria: { nome: 'Checklist de vistoria do veiculo de passeio', total: totalVis,
    grupos: VISTORIA.map((g) => ({ t: g.t, legenda: ESTADOS_V[g.tipo].map(([e, n]) => e + ' ' + n.toLowerCase()).join(' / '), itens: g.itens })) },
  recebimento: { nome: 'Checklist de recebimento do veiculo', total: totalRec,
    grupos: CHECK_RECEBIMENTO.map((g) => ({ t: g.t, legenda: 'C conforme / R precisa de reparo / NA nao se aplica', itens: g.itens })) }
}, null, 1)`, ctx);
fs.writeFileSync(process.argv[2], saida, 'utf8');
console.log('ok', saida.length);
