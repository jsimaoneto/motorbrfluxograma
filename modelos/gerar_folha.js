// Gera o HTML de uma folha (vistoria ou recebimento) fora do navegador, reusando o código do site.
// uso: node gerar_folha.js <saida.html> <vistoria|recebimento> [branco]
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = 'D:/Claude/motorbrfluxograma';
const saida = process.argv[2];
const qual = process.argv[3] || 'vistoria';
const emBranco = process.argv[4] === 'branco';

const veiculo = {
  id: 'exemplo', marca: 'Toyota', modelo: 'Corolla XEI 2.0', ano: '2022', placa: 'RKX-7H42',
  cor: 'Prata', km: '48.300',
  vistoria: {
    motivo: 'Entrega ao cliente', km: '48.312', comb: 'Tanque cheio', por: 'Consultor',
    data: '2026-11-23', itens: {}, marcas: [
      { v: 'lat', x: 104, y: 40, d: 'Risco de 12 cm na porta dianteira esquerda' },
      { v: 'fre', x: 62, y: 68, d: 'Para-choque com marca de estacionamento' },
      { v: 'dir', x: 150, y: 66, d: 'Roda traseira direita raspada' },
    ],
  },
  recebimento: { por: 'Motorista', data: '2026-11-23', itens: {} },
};

let html = '';
const ctx = {
  console, URL, Math,
  location: { href: 'file:///' + raiz + '/index.html' },
  document: { querySelector: () => null },
  esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  hoje: () => '2026-11-23',
  dataBR: (iso) => (iso ? iso.split('-').reverse().join('/') : ''),
  nomeVeiculo: (v) => `${v.marca} ${v.modelo} ${v.ano}`.toUpperCase(),
  acharVeiculo: () => veiculo,
  salvarVeiculo: () => {},
  itensProcesso: () => [],
  avisar: () => {},
  $: () => ({}),
  ic: { baixar: '' },
  window: { open: () => ({ document: { write: (s) => { html = s; }, close() {} }, focus() {}, print() {} }) },
};
ctx.globalThis = ctx;
vm.createContext(ctx);
['recebimento', 'vistoria'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(raiz, 'js', f + '.js'), 'utf8'), ctx));

const preencher = qual === 'vistoria' ? `
  const r = visDoV(acharVeiculo());
  VISTORIA.forEach((g, gi) => g.itens.forEach((_, ii) => { r.itens[chaveVis(gi, ii)] = { e: g.tipo === 'q' ? 'B' : 'S', obs: '' }; }));
  r.itens['v0_1'] = { e: 'M', obs: 'Carpete do motorista manchado' };
  r.itens['v0_6'] = { e: 'M', obs: 'Palhetas riscando o para-brisa' };
  r.itens['v2_5'] = { e: 'N', obs: 'Brake light queimada - trocar antes da entrega' };
  r.itens['v3_5'] = { e: 'NA', obs: 'Nao exigido para este veiculo' };
  r.itens['v3_13'] = { e: 'N', obs: 'So uma chave; cobrar do antigo dono' };
  r.itens['v6_2'] = { e: 'N', obs: 'Sensor traseiro direito sem bipe' };
  imprimirVis('exemplo', ${emBranco});
` : `
  const r = recDoV(acharVeiculo());
  CHECK_RECEBIMENTO.forEach((g, gi) => g.itens.forEach((_, ii) => { r.itens[chaveRec(gi, ii)] = { e: 'C', obs: '' }; }));
  imprimirRec('exemplo', ${emBranco});
`;
vm.runInContext(preencher, ctx);

fs.writeFileSync(saida, html, 'utf8');
console.log('ok', saida, html.length);
