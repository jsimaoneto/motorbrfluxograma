// Checklist de vistoria do veículo de passeio (+Motor BR).
// Folha operacional de pátio: conferência rápida e repetível do carro pronto para rodar, test drive,
// translado, entrega ao cliente ou devolução. Não substitui o checklist de recebimento (js/recebimento.js),
// que é a avaliação técnica de compra; este aqui é a conferência de rotina.
// Base: itens usuais de checklist de frota (documentação, pneus, iluminação, segurança, níveis)
// e os obrigatórios do CTB (extintor quando exigido, triângulo, macaco, chave de roda, cintos, estepe).
// Cada item fica B/M/R (condições gerais) ou S/N/NA (funciona / não funciona / não se aplica).

const VISTORIA = [
  { t: 'Condições gerais', tipo: 'q', itens: [
    'Limpeza externa (lavagem, vidros, rodas)',
    'Limpeza interna (bancos, carpete, painel, odor)',
    'Pintura e lataria (riscos, amassados, tom)',
    'Pneus dianteiros (sulco, desgaste, calibragem)',
    'Pneus traseiros (sulco, desgaste, calibragem)',
    'Estepe (estado, calibragem, fixação)',
    'Palhetas do limpador',
    'Bateria (idade, terminais, fixação)',
  ] },
  { t: 'Luzes dianteiras', tipo: 'v', itens: [
    'Farol baixo direito', 'Farol baixo esquerdo',
    'Farol alto direito', 'Farol alto esquerdo',
    'Seta dianteira direita', 'Seta dianteira esquerda',
    'Neblina direita', 'Neblina esquerda',
    'Luz diurna (DRL) / meia-luz',
  ] },
  { t: 'Luzes traseiras', tipo: 'v', itens: [
    'Luz da placa',
    'Lanterna direita', 'Lanterna esquerda',
    'Luz de freio direita', 'Luz de freio esquerda', 'Brake light (terceira luz de freio)',
    'Luz de ré direita', 'Luz de ré esquerda',
    'Seta traseira direita', 'Seta traseira esquerda',
    'Pisca-alerta nas quatro luzes',
  ] },
  { t: 'Segurança e itens obrigatórios', tipo: 'v', itens: [
    'Cintos de segurança de todos os lugares (trava e recolhimento)',
    'Buzina',
    'Triângulo de sinalização',
    'Macaco',
    'Chave de roda',
    'Extintor (quando exigido para o veículo)',
    'Documento do veículo (CRLV) dentro do carro',
    'Licenciamento do exercício em dia',
    'Retrovisor interno',
    'Retrovisor externo direito',
    'Retrovisor externo esquerdo',
    'Travas e fechaduras das portas e do porta-malas',
    'Alarme e chave / controle remoto',
    'Chave reserva',
    'Painel sem luz de advertência acesa (injeção, ABS, airbag, freio)',
    'Limpadores e lavador do para-brisa',
    'Desembaçador traseiro',
    'Vidros elétricos nas quatro portas',
    'Cadeirinha / fixação Isofix (quando houver)',
  ] },
  { t: 'Motor e níveis', tipo: 'v', itens: [
    'Óleo do motor (nível e aspecto)',
    'Água do radiador / reservatório de expansão',
    'Água do lavador do para-brisa',
    'Óleo do freio',
    'Fluido da direção hidráulica (quando houver)',
    'Correias e mangueiras',
    'Partida a frio sem ruído ou fumaça anormal',
    'Marcha lenta estável',
    'Sem vazamento no chão do box',
    'Escapamento sem furo ou fumaça anormal',
  ] },
  { t: 'Direção e freios (test drive)', tipo: 'v', itens: [
    'Acelerador com resposta normal',
    'Embreagem / câmbio passando todas as marchas',
    'Freio de serviço sem puxar para o lado e sem ruído',
    'Freio de estacionamento segurando o carro',
    'Direção alinhada e sem folga',
    'Suspensão sem batida ou ruído',
    'Sem trepidação em velocidade de rodovia',
  ] },
  { t: 'Interior e conforto', tipo: 'v', itens: [
    'Ar-condicionado gelando e ventilação em todas as velocidades',
    'Multimídia, som e alto-falantes',
    'Câmera de ré e sensores de estacionamento',
    'Comandos do volante e computador de bordo',
    'Tomadas 12 V / USB e carregador',
    'Bancos (regulagem, rebatimento, acabamentos)',
    'Tapetes e forração do porta-malas',
  ] },
  { t: 'Documentação e pendências', tipo: 'v', itens: [
    'Placa e chassi conferidos com o CRLV',
    'Etiquetas dos vidros sem sinal de adulteração',
    'IPVA do exercício quitado',
    'Multas consultadas',
    'Recall pendente consultado no site da montadora',
    'Laudo cautelar no prontuário',
    'Manual do proprietário e revisões',
  ] },
];

const ESTADOS_V = {
  q: [['B', 'Bom'], ['M', 'Médio'], ['R', 'Ruim']],
  v: [['S', 'Sim'], ['N', 'Não'], ['NA', 'Não se aplica']],
};
// vistas do diagrama: clique marca a área avariada, como circular o desenho no papel
const VISTAS = [['lat', 'Lateral esquerda'], ['fre', 'Frente'], ['tra', 'Traseira'], ['dir', 'Lateral direita']];

const chaveVis = (g, i) => 'v' + g + '_' + i;
const totalVis = VISTORIA.reduce((s, g) => s + g.itens.length, 0);
const estadosDo = (g) => ESTADOS_V[g.tipo];
// reprovado = Ruim ou Não
const reprovado = (g, e) => (g.tipo === 'q' ? e === 'R' : e === 'N');

function visDoV(v) {
  if (!v.vistoria) v.vistoria = { itens: {}, marcas: [], por: '', data: '', km: '', comb: '', motivo: '' };
  if (!v.vistoria.itens) v.vistoria.itens = {};
  if (!v.vistoria.marcas) v.vistoria.marcas = [];
  return v.vistoria;
}

function resumoVis(v) {
  const r = visDoV(v).itens;
  let ok = 0; let ruim = 0; let na = 0;
  VISTORIA.forEach((g, gi) => g.itens.forEach((_, ii) => {
    const x = r[chaveVis(gi, ii)];
    if (!x || !x.e) return;
    if (x.e === 'NA') na++;
    else if (reprovado(g, x.e)) ruim++;
    else ok++;
  }));
  const avaliados = ok + ruim + na;
  return { ok, ruim, na, avaliados, total: totalVis, pct: Math.round((avaliados / totalVis) * 100) };
}

function marcarVis(vid, gi, ii, e) {
  const v = acharVeiculo(vid);
  if (!v) return;
  const r = visDoV(v);
  const k = chaveVis(gi, ii);
  if (r.itens[k] && r.itens[k].e === e) delete r.itens[k];   // clicar de novo desmarca
  else r.itens[k] = { e, obs: (r.itens[k] || {}).obs || '' };
  r.data = hoje();
  salvarVeiculo(v);
  abaVistoria(v);
}

function obsVis(vid, gi, ii, texto) {
  const v = acharVeiculo(vid);
  if (!v) return;
  const r = visDoV(v);
  const k = chaveVis(gi, ii);
  r.itens[k] = { e: (r.itens[k] || {}).e || '', obs: texto };
  salvarVeiculo(v);
}

function campoVis(vid, campo, texto) {
  const v = acharVeiculo(vid);
  if (!v) return;
  const r = visDoV(v);
  r[campo] = texto;
  r.data = hoje();
  salvarVeiculo(v);
}

// --- diagrama: silhuetas próprias do carro, clique marca o ponto avariado ---
function silhueta(vista) {
  const carro = {
    lat: `<path d="M12 62 L22 44 Q30 34 48 32 L96 32 Q112 33 124 44 L146 56 Q168 58 176 64 Q182 70 180 78 L168 78
            a14 14 0 0 0 -28 0 L72 78 a14 14 0 0 0 -28 0 L14 78 Q8 72 12 62 Z"/>
          <path class="vidro" d="M34 46 Q40 38 54 37 L92 37 Q106 38 116 47 L120 52 L34 52 Z"/>
          <line x1="76" y1="37" x2="76" y2="52"/>
          <circle cx="58" cy="78" r="13"/><circle cx="154" cy="78" r="13"/>`,
    fre: `<path d="M40 82 L40 50 Q40 40 50 36 L62 22 Q66 16 76 16 L116 16 Q126 16 130 22 L142 36
            Q152 40 152 50 L152 82 Z"/>
          <path class="vidro" d="M60 36 L70 23 Q72 20 78 20 L114 20 Q120 20 122 23 L132 36 Z"/>
          <rect x="62" y="48" width="68" height="9" rx="3"/>
          <rect x="46" y="46" width="13" height="9" rx="3"/><rect x="133" y="46" width="13" height="9" rx="3"/>
          <rect x="54" y="66" width="84" height="8" rx="3"/>
          <rect x="30" y="54" width="10" height="26" rx="4"/><rect x="152" y="54" width="10" height="26" rx="4"/>`,
    tra: `<path d="M40 82 L40 50 Q40 40 50 36 L62 22 Q66 16 76 16 L116 16 Q126 16 130 22 L142 36
            Q152 40 152 50 L152 82 Z"/>
          <path class="vidro" d="M60 36 L70 23 Q72 20 78 20 L114 20 Q120 20 122 23 L132 36 Z"/>
          <rect x="44" y="44" width="20" height="13" rx="3"/><rect x="128" y="44" width="20" height="13" rx="3"/>
          <rect x="78" y="60" width="36" height="11" rx="2"/>
          <rect x="30" y="54" width="10" height="26" rx="4"/><rect x="152" y="54" width="10" height="26" rx="4"/>`,
    dir: `<path d="M180 62 L170 44 Q162 34 144 32 L96 32 Q80 33 68 44 L46 56 Q24 58 16 64 Q10 70 12 78 L24 78
            a14 14 0 0 1 28 0 L120 78 a14 14 0 0 1 28 0 L178 78 Q184 72 180 62 Z"/>
          <path class="vidro" d="M158 46 Q152 38 138 37 L100 37 Q86 38 76 47 L72 52 L158 52 Z"/>
          <line x1="116" y1="37" x2="116" y2="52"/>
          <circle cx="134" cy="78" r="13"/><circle cx="38" cy="78" r="13"/>`,
  };
  return carro[vista] || '';
}

function marcasDaVista(r, vista) {
  return r.marcas.map((m, idx) => ({ ...m, n: idx + 1 })).filter((m) => m.v === vista);
}

function pontosSvg(r, vista) {
  return marcasDaVista(r, vista).map((m) => `
    <g class="marca"><circle cx="${m.x}" cy="${m.y}" r="9"/>
     <text x="${m.x}" y="${m.y + 3.5}" text-anchor="middle">${m.n}</text></g>`).join('');
}

function svgVista(v, vista, nome) {
  const r = visDoV(v);
  return `<figure class="vista-carro">
    <svg viewBox="0 0 192 96" onclick="cliqueVista(event,'${v.id}','${vista}')">
      <g class="corpo">${silhueta(vista)}</g>${pontosSvg(r, vista)}
    </svg>
    <figcaption>${esc(nome)}</figcaption></figure>`;
}

function cliqueVista(ev, vid, vista) {
  const cx = ev.currentTarget.getBoundingClientRect();
  const x = Math.round(((ev.clientX - cx.left) / cx.width) * 192);
  const y = Math.round(((ev.clientY - cx.top) / cx.height) * 96);
  const v = acharVeiculo(vid);
  if (!v) return;
  const r = visDoV(v);
  // clique em cima de uma marca existente apaga a marca
  const perto = r.marcas.findIndex((m) => m.v === vista && Math.hypot(m.x - x, m.y - y) < 10);
  if (perto >= 0) r.marcas.splice(perto, 1);
  else r.marcas.push({ v: vista, x, y, d: '' });
  r.data = hoje();
  salvarVeiculo(v);
  abaVistoria(v);
}

function descMarca(vid, idx, texto) {
  const v = acharVeiculo(vid);
  if (!v) return;
  visDoV(v).marcas[idx].d = texto;
  salvarVeiculo(v);
}

function limparMarcas(vid) {
  const v = acharVeiculo(vid);
  if (!v) return;
  visDoV(v).marcas = [];
  salvarVeiculo(v);
  abaVistoria(v);
}

const nomeVista = (id) => (VISTAS.find((x) => x[0] === id) || ['', ''])[1];

// --------------------------------------------------------------------- tela
function abaVistoria(v) {
  const r = visDoV(v);
  const res = resumoVis(v);

  const linhas = VISTORIA.map((g, gi) => `
    <tr class="grupo-rec"><td colspan="3"><b>${esc(g.t)}</b>
      <span style="font-weight:400;color:var(--texto-fraco);font-size:11px"> · ${estadosDo(g).map(([e, n]) => e + ' ' + n.toLowerCase()).join(' / ')}</span></td></tr>
    ${g.itens.map((it, ii) => {
      const x = r.itens[chaveVis(gi, ii)] || {};
      return `<tr>
        <td>${esc(it)}</td>
        <td class="nowrap">${estadosDo(g).map(([e, nome]) =>
          `<button class="btn pequeno ${x.e === e ? (reprovado(g, e) ? 'reprovado' : 'principal') : ''}"
             onclick="marcarVis('${v.id}',${gi},${ii},'${e}')" title="${nome}">${e}</button>`).join(' ')}</td>
        <td><input type="text" class="obs-rec" value="${esc(x.obs || '')}" placeholder="observação"
             onchange="obsVis('${v.id}',${gi},${ii},this.value)"></td>
      </tr>`;
    }).join('')}`).join('');

  const listaMarcas = r.marcas.map((m, i) => `
    <div class="marca-linha">
      <span class="n-marca">${i + 1}</span>
      <span class="rot-marca">${esc(nomeVista(m.v))}</span>
      <input type="text" class="obs-rec" value="${esc(m.d || '')}" placeholder="o que há nessa área (risco, amassado, trinca)"
        onchange="descMarca('${v.id}',${i},this.value)">
    </div>`).join('') || '<div style="font-size:12px;color:var(--texto-fraco)">Nenhuma avaria marcada. Clique no desenho para marcar; clique na marca para apagar.</div>';

  $('#conteudo-aba').innerHTML = `
    <div class="cartao" style="margin-bottom:16px">
      <div class="cartao-cabeca"><h3>Checklist de vistoria do veículo</h3>
        <span style="font-size:11.5px;color:var(--texto-fraco)">${res.avaliados} de ${res.total} itens avaliados</span></div>
      <div class="cartao-corpo">
        <div class="indicadores" style="margin-bottom:12px">
          <div class="indicador destaque"><div class="n">${res.pct}%</div><div class="r">conferido</div></div>
          <div class="indicador"><div class="n">${res.ok}</div><div class="r">aprovados</div></div>
          <div class="indicador ${res.ruim ? 'alerta' : ''}"><div class="n">${res.ruim}</div><div class="r">reprovados</div></div>
          <div class="indicador ${r.marcas.length ? 'alerta' : ''}"><div class="n">${r.marcas.length}</div><div class="r">avarias marcadas</div></div>
        </div>
        <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:14px">
          <div class="campo"><label>Motivo da vistoria</label>
            <input type="text" value="${esc(r.motivo || '')}" placeholder="entrega, test drive, translado, devolução"
              onchange="campoVis('${v.id}','motivo',this.value)"></div>
          <div class="campo"><label>Quilometragem</label>
            <input type="text" value="${esc(r.km || '')}" onchange="campoVis('${v.id}','km',this.value)"></div>
          <div class="campo"><label>Combustível</label>
            <input type="text" value="${esc(r.comb || '')}" placeholder="1/2 tanque"
              onchange="campoVis('${v.id}','comb',this.value)"></div>
          <div class="campo"><label>Quem vistoriou</label>
            <input type="text" value="${esc(r.por || '')}" placeholder="cargo de quem conferiu"
              onchange="campoVis('${v.id}','por',this.value)"></div>
        </div>

        <h4 style="margin:4px 0 8px;font-size:13px">Marque a área do veículo afetada</h4>
        <div class="vistas-carro">${VISTAS.map(([id, nome]) => svgVista(v, id, nome)).join('')}</div>
        <div style="margin:10px 0 12px">${listaMarcas}</div>
        ${r.marcas.length ? `<button class="btn pequeno" onclick="limparMarcas('${v.id}')">Limpar marcações</button>` : ''}

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 12px">
          <button class="btn" onclick="imprimirVis('${v.id}',false)">${ic.baixar} Imprimir como está</button>
          <button class="btn escuro" onclick="imprimirVis('${v.id}',true)">${ic.baixar} Folha em branco para o pátio</button>
        </div>
        <div class="caixa-info" style="margin:0 0 12px">
          Folha de rotina: conferência antes de test drive, translado, entrega ao cliente e devolução.
          A avaliação técnica de compra fica na aba <b>Recebimento</b>. Item em <b>Ruim</b> ou <b>Não</b> de
          freio, pneu, direção, suspensão, iluminação ou cinto <b>impede o veículo de sair da loja</b>.
        </div>
        <table class="tabela tabela-rec">
          <thead><tr><th>Item</th><th>Estado</th><th>Observação</th></tr></thead>
          <tbody>${linhas}</tbody>
        </table>
        ${res.ruim ? `<div class="caixa-aviso" style="margin-top:12px"><b>${res.ruim} ${res.ruim === 1 ? 'item reprovado' : 'itens reprovados'}.</b>
          Abra a ordem de serviço antes de liberar o veículo.</div>` : ''}
      </div>
    </div>`;

  const abaAtiva = document.querySelector('.abas button.ativo');
  if (abaAtiva) abaAtiva.textContent = `Vistoria (${res.avaliados}/${res.total})`;
}

// --------------------------------------------------------------- impressão
function imprimirVis(vid, emBranco) {
  const v = acharVeiculo(vid);
  if (!v) return;
  const r = visDoV(v);
  const logo = new URL('img/logo-motorbr.png', location.href).href;

  const linhas = VISTORIA.map((g, gi) => `
    <tr class="g"><td colspan="3">${esc(g.t)} <i>(${estadosDo(g).map(([e, n]) => e + ' ' + n.toLowerCase()).join(' / ')})</i></td></tr>
    ${g.itens.map((it, ii) => {
      const x = emBranco ? {} : (r.itens[chaveVis(gi, ii)] || {});
      return `<tr><td>${esc(it)}</td>
        <td class="e">${estadosDo(g).map(([e]) => `<span class="${x.e === e ? (reprovado(g, e) ? 'mk ruim' : 'mk') : ''}">${e}</span>`).join('')}</td>
        <td class="o">${esc(x.obs || '')}</td></tr>`;
    }).join('')}`).join('');

  const vistas = VISTAS.map(([id, nome]) => `<figure>
      <svg viewBox="0 0 192 96"><g class="corpo">${silhueta(id)}</g>${emBranco ? '' : pontosSvg(r, id)}</svg>
      <figcaption>${esc(nome)}</figcaption></figure>`).join('');

  const marcas = emBranco
    ? '<div class="linhas-livres"></div>'
    : (r.marcas.map((m, i) => `<div><b>${i + 1}</b> ${esc(nomeVista(m.v))} — ${esc(m.d || '')}</div>`).join('')
       || '<div style="color:#888">Nenhuma avaria marcada.</div>');

  const w = window.open('', '_blank');
  if (!w) { avisar('O navegador bloqueou a janela de impressão. Libere os pop-ups para este site.'); return; }
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
    <title>Checklist de vistoria${emBranco ? '' : ' · ' + esc(nomeVeiculo(v))}</title>
    <style>
      @page { size: A4; margin: 11mm; }
      body { font: 9.6px/1.2 Arial, Helvetica, sans-serif; color: #1B1A19; margin: 0; }
      .topo { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #FF5A00;
              padding-bottom: 8px; margin-bottom: 10px; }
      .topo img { height: 46px; }
      .topo .tit { flex: 1; }
      .topo h1 { font-size: 16px; margin: 0; letter-spacing: -.01em; }
      .topo .sub { font-size: 9.5px; color: #666; margin-top: 2px; }
      .topo .sel { font-size: 9px; color: #fff; background: #1B1A19; padding: 5px 9px; border-radius: 4px;
                   text-align: center; font-weight: bold; letter-spacing: .04em; }
      .cab { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 9.5px; margin-bottom: 9px; }
      .cab div { flex: 1 1 140px; color: #666; }
      .cab span { display: block; border-bottom: 1px solid #999; min-height: 14px; color: #1B1A19;
                  font-size: 10.5px; padding-top: 1px; }
      h2 { font-size: 10.5px; margin: 8px 0 4px; text-transform: uppercase; letter-spacing: .05em; }
      .vistas { display: flex; gap: 6px; }
      .vistas figure { flex: 1; margin: 0; border: 1px solid #ccc; border-radius: 5px; padding: 3px; }
      .vistas svg { width: 100%; height: auto; display: block; }
      .vistas figcaption { font-size: 8.5px; text-align: center; color: #666; }
      .corpo path, .corpo circle, .corpo rect, .corpo line { fill: #fff; stroke: #555; stroke-width: 2;
                                                             stroke-linejoin: round; }
      .corpo .vidro { fill: #e9eaef; }
      .marca circle { fill: #FF5A00; stroke: #fff; stroke-width: 2; }
      .marca text { fill: #fff; font: bold 9px Arial; }
      .avarias { font-size: 9.5px; margin: 6px 0 4px; }
      .avarias div { margin-bottom: 2px; }
      .avarias b { display: inline-block; background: #FF5A00; color: #fff; border-radius: 50%;
                   width: 13px; height: 13px; text-align: center; line-height: 13px; font-size: 8.5px; }
      .linhas-livres { height: 44px; background: repeating-linear-gradient(#fff 0 14px, #bbb 14px 15px); }
      table { width: 100%; border-collapse: collapse; }
      td, th { border: 1px solid #bbb; padding: 1.1px 5px; vertical-align: top; }
      th { background: #1B1A19; color: #fff; font-size: 9.5px; text-align: left; }
      tr.g td { background: #f1f2f5; font-weight: bold; border-left: 3px solid #FF5A00; }
      tr.g i { font-weight: 400; color: #666; font-size: 9px; }
      td.e { white-space: nowrap; width: 92px; text-align: center; }
      td.e span { display: inline-block; border: 1px solid #777; min-width: 19px; height: 14px; margin: 0 1px;
                  font-size: 8.5px; text-align: center; line-height: 14px; padding: 0 2px; }
      td.e span.mk { background: #FF5A00; color: #fff; border-color: #FF5A00; }
      td.e span.mk.ruim { background: #C62828; border-color: #C62828; }
      td.o { width: 30%; }
      .rod { margin-top: 11px; font-size: 9.5px; display: flex; gap: 20px; }
      .rod span { border-top: 1px solid #999; padding-top: 3px; flex: 1; text-align: center; color: #666; }
      .assin { margin-top: 10px; font-size: 8.5px; color: #888; display: flex; justify-content: space-between;
               border-top: 1px solid #ddd; padding-top: 5px; }
      tr, figure { page-break-inside: avoid; }
    </style></head><body>
    <div class="topo">
      <img src="${logo}" alt="+Motor BR">
      <div class="tit"><h1>Checklist de vistoria do veículo de passeio</h1>
        <div class="sub">Conferência de rotina antes de test drive, translado, entrega e devolução ·
          B bom / M médio / R ruim · S sim / N não / NA não se aplica</div></div>
      <div class="sel">+MOTOR BR<br>VISTORIA</div>
    </div>
    <div class="cab">
      <div>Veículo<span>${emBranco ? '' : esc(nomeVeiculo(v))}</span></div>
      <div>Placa<span>${emBranco ? '' : esc(v.placa || '')}</span></div>
      <div>Km<span>${emBranco ? '' : esc(r.km || v.km || '')}</span></div>
      <div>Combustível<span>${emBranco ? '' : esc(r.comb || '')}</span></div>
      <div>Motivo<span>${emBranco ? '' : esc(r.motivo || '')}</span></div>
      <div>Data<span>${emBranco ? '' : dataBR(r.data || hoje())}</span></div>
      <div>Quem vistoriou<span>${emBranco ? '' : esc(r.por || '')}</span></div>
    </div>
    <h2>Marque com um círculo a área do veículo afetada</h2>
    <div class="vistas">${vistas}</div>
    <div class="avarias">${marcas}</div>
    <h2>Itens conferidos</h2>
    <table><thead><tr><th>Item</th><th>Estado</th><th>Observação</th></tr></thead><tbody>${linhas}</tbody></table>
    <div class="rod"><span>Assinatura de quem vistoriou</span><span>Assinatura do responsável pelo veículo</span></div>
    <div class="assin"><span>+Motor BR · Processo de vendas</span>
      <span>Consultoria e processo: J. Simão Neto · CRP 06/92454 · 2026</span></div>
    </body></html>`);
  w.document.close();
  w.focus();
  w.print();
}
