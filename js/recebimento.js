// Checklist de recebimento do veículo (+Motor BR).
// Pedido do CEO em 19/11/2026: o motorista adianta a conferência na chegada do carro e o consultor fecha.
// Cada item fica C (conforme), R (precisa reparo) ou NA (não se aplica), com observação.
// Quando todos os itens estão avaliados, o item "Avaliar o veículo com o checklist de recebimento" da Fase 1
// é marcado sozinho, para o fluxograma andar junto. A mesma tela imprime, cheia ou em branco (folha de pátio).

const CHECK_RECEBIMENTO = [
  { t: 'Lataria e pintura', itens: [
    'Para-choque dianteiro e traseiro: trincas, folgas, pintura',
    'Capô, teto e tampa traseira: amassados, desalinhamento',
    'Portas e laterais: amassados, riscos, diferença de tom de pintura',
    'Frisos, emblemas e grade',
    'Sinais de repintura, massa ou desalinhamento de porta (indício de batida)',
    'Assoalho e estrutura por baixo: ferrugem, amassados, reparo',
  ]},
  { t: 'Vidros, faróis e retrovisores', itens: [
    'Para-brisa e vidros: trincas, lascas, riscos profundos',
    'Vidros elétricos subindo e descendo nas quatro portas',
    'Faróis, lanternas, setas, luz de freio e ré funcionando',
    'Faróis embaçados ou amarelados',
    'Retrovisores: regulagem elétrica, rebatimento, carcaça',
  ]},
  { t: 'Pneus, rodas e freios', itens: [
    'Profundidade do sulco dos quatro pneus (mínimo 1,6 mm) e marca/medida iguais',
    'Pneus com bolha, corte, desgaste irregular ou mais de 5 anos de fabricação',
    'Rodas: empenadas, raspadas, calotas',
    'Estepe, chave de roda, triângulo e macaco',
    'Pastilhas, discos e freio de estacionamento',
  ]},
  { t: 'Interior', itens: [
    'Bancos e forração: rasgos, manchas, queimaduras',
    'Cheiro de mofo, cigarro ou umidade (sinal de infiltração ou enchente)',
    'Carpete e porta-malas: umidade, ferrugem, marca de água',
    'Painéis das portas, teto e acabamentos soltos',
    'Tapetes, manual do proprietário e chave reserva',
  ]},
  { t: 'Painel e eletrônica', itens: [
    'Luzes de advertência no painel depois de ligar (injeção, ABS, airbag, freio)',
    'Ar-condicionado gelando e ventilação em todas as velocidades',
    'Multimídia, som, câmera de ré e sensores',
    'Travas, alarme, chaves e comandos do volante',
    'Quilometragem registrada e combustível no tanque',
  ]},
  { t: 'Mecânica e test drive', itens: [
    'Partida a frio: ruído, fumaça, marcha lenta',
    'Níveis e vazamentos: óleo do motor, água, freio, direção, câmbio',
    'Correias, mangueiras, bateria e terminais',
    'Test drive: câmbio passando as marchas, embreagem, trepidação',
    'Test drive: direção alinhada, suspensão sem ruído, freio sem puxar para o lado',
    'Escapamento e emissão aparente de fumaça',
  ]},
  { t: 'Leitura de falhas (scanner)', itens: [
    'Scanner conectado e relatório de falhas tirado',
    'Falhas ativas anotadas e orçadas',
    'Falhas apagadas só depois do registro no prontuário',
    'Recall pendente consultado no site da montadora',
  ]},
  { t: 'Documentação na chegada', itens: [
    'CRLV / CRV em mãos e conferido com a placa e o chassi',
    'Chassi e etiquetas dos vidros sem sinal de adulteração',
    'IPVA, licenciamento e multas conferidos',
    'Laudo cautelar solicitado',
  ]},
];

const ESTADOS_R = [['C', 'Conforme'], ['R', 'Reparar'], ['NA', 'Não se aplica']];
const chaveRec = (g, i) => `r${g}_${i}`;
const totalRec = CHECK_RECEBIMENTO.reduce((s, g) => s + g.itens.length, 0);

function recDoV(v) {
  if (!v.recebimento) v.recebimento = { itens: {}, por: '', data: '' };
  if (!v.recebimento.itens) v.recebimento.itens = {};
  return v.recebimento;
}

function resumoRec(v) {
  const r = recDoV(v).itens;
  const c = { C: 0, R: 0, NA: 0 };
  Object.values(r).forEach((x) => { if (c[x.e] !== undefined) c[x.e]++; });
  const avaliados = c.C + c.R + c.NA;
  return { ...c, avaliados, total: totalRec, pct: Math.round((avaliados / totalRec) * 100) };
}

// item da Fase 1 que este checklist resolve
function itemFase1Recebimento() {
  return itensProcesso().find((x) => x.it.i.startsWith('Avaliar o veículo com o checklist de recebimento'));
}

function marcarRec(vid, k, e) {
  const v = acharVeiculo(vid);
  if (!v) return;
  const r = recDoV(v);
  if (r.itens[k] && r.itens[k].e === e) delete r.itens[k];   // clicar de novo no mesmo desmarca
  else r.itens[k] = { e, obs: (r.itens[k] || {}).obs || '' };
  r.data = hoje();
  // checklist inteiro avaliado: o item da Fase 1 é marcado (ou reaberto) junto
  const f1 = itemFase1Recebimento();
  if (f1) {
    const completo = resumoRec(v).avaliados === totalRec;
    if (completo && !v.concluido[f1.k]) v.concluido[f1.k] = { data: hoje(), por: 'Checklist de recebimento' };
    if (!completo && v.concluido[f1.k] && v.concluido[f1.k].por === 'Checklist de recebimento') delete v.concluido[f1.k];
  }
  salvarVeiculo(v);
  abaRecebimento(v);
}

function obsRec(vid, k, texto) {
  const v = acharVeiculo(vid);
  if (!v) return;
  const r = recDoV(v);
  r.itens[k] = { e: (r.itens[k] || {}).e || '', obs: texto };
  salvarVeiculo(v);
}

function abaRecebimento(v) {
  const r = recDoV(v);
  const res = resumoRec(v);
  const linhas = (emBranco) => CHECK_RECEBIMENTO.map((g, gi) => `
    <tr class="grupo-rec"><td colspan="3"><b>${esc(g.t)}</b></td></tr>
    ${g.itens.map((it, ii) => {
      const k = chaveRec(gi, ii);
      const x = emBranco ? {} : (r.itens[k] || {});
      return `<tr>
        <td>${esc(it)}</td>
        <td class="nowrap">${ESTADOS_R.map(([e, nome]) => emBranco
          ? `<span class="caixinha-rec">${e}</span>`
          : `<button class="btn pequeno ${x.e === e ? 'principal' : ''}" onclick="marcarRec('${v.id}','${k}','${e}')" title="${nome}">${e}</button>`).join(' ')}</td>
        <td>${emBranco ? '<span class="linha-papel"></span>'
          : `<input type="text" class="obs-rec" value="${esc(x.obs || '')}" placeholder="observação"
               onchange="obsRec('${v.id}','${k}',this.value)">`}</td>
      </tr>`;
    }).join('')}`).join('');

  $('#conteudo-aba').innerHTML = `
    <div class="cartao" style="margin-bottom:16px">
      <div class="cartao-cabeca"><h3>Checklist de recebimento</h3>
        <span style="font-size:11.5px;color:var(--texto-fraco)">${res.avaliados} de ${res.total} itens avaliados</span></div>
      <div class="cartao-corpo">
        <div class="indicadores" style="margin-bottom:12px">
          <div class="indicador destaque"><div class="n">${res.pct}%</div><div class="r">conferido</div></div>
          <div class="indicador"><div class="n">${res.C}</div><div class="r">conformes</div></div>
          <div class="indicador ${res.R ? 'alerta' : ''}"><div class="n">${res.R}</div><div class="r">precisam reparo</div></div>
          <div class="indicador"><div class="n">${res.total - res.avaliados}</div><div class="r">ainda sem avaliar</div></div>
        </div>
        <div class="campo" style="max-width:340px">
          <label>Quem conferiu</label>
          <input type="text" value="${esc(r.por || '')}" placeholder="cargo de quem conferiu"
            onchange="(function(el){const v=acharVeiculo('${v.id}');recDoV(v).por=el.value;recDoV(v).data=hoje();salvarVeiculo(v);})(this)">
        </div>
        <div class="caixa-info" style="margin:4px 0 12px">
          O motorista adianta a conferência na chegada do carro e o consultor fecha. Com os ${res.total} itens avaliados,
          o item do checklist de recebimento da Fase 1 é marcado sozinho. Item em <b>R</b> entra na lista de serviços da Fase 2.
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <button class="btn" onclick="imprimirRec('${v.id}',false)">${ic.baixar} Imprimir como está</button>
          <button class="btn escuro" onclick="imprimirRec('${v.id}',true)">${ic.baixar} Folha em branco para o pátio</button>
        </div>
        <table class="tabela tabela-rec">
          <thead><tr><th>Item</th><th>Estado</th><th>Observação</th></tr></thead>
          <tbody>${linhas(false)}</tbody>
        </table>
        ${res.R ? `<div class="caixa-aviso" style="margin-top:12px"><b>${res.R} ${res.R === 1 ? 'item precisa' : 'itens precisam'} de reparo.</b>
          Leve para a Fase 2 (diagnóstico e orçamento de preparação). Item de segurança reprovado (freio, pneu, direção, suspensão, iluminação) impede o anúncio.</div>` : ''}
      </div>
    </div>`;

  const abaAtiva = document.querySelector('.abas button.ativo');
  if (abaAtiva) abaAtiva.textContent = `Recebimento (${res.avaliados}/${res.total})`;
}

// Abre uma janela só com a folha, para o navegador imprimir ou salvar em PDF
function imprimirRec(vid, emBranco) {
  const v = acharVeiculo(vid);
  if (!v) return;
  const r = recDoV(v);
  const linhas = CHECK_RECEBIMENTO.map((g, gi) => `
    <tr class="g"><td colspan="3">${esc(g.t)}</td></tr>
    ${g.itens.map((it, ii) => {
      const x = emBranco ? {} : (r.itens[chaveRec(gi, ii)] || {});
      return `<tr>
        <td>${esc(it)}</td>
        <td class="e">${ESTADOS_R.map(([e]) => `<span class="${x.e === e ? 'mk' : ''}">${e}</span>`).join('')}</td>
        <td class="o">${esc(x.obs || '')}</td></tr>`;
    }).join('')}`).join('');

  const w = window.open('', '_blank');
  if (!w) { avisar('O navegador bloqueou a janela de impressão. Libere os pop-ups para este site.'); return; }
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
    <title>Checklist de recebimento${emBranco ? '' : ' · ' + esc(nomeVeiculo(v))}</title>
    <style>
      body { font: 11px/1.35 Arial, sans-serif; color: #222; margin: 18px; }
      h1 { font-size: 15px; margin: 0 0 2px; }
      .sub { font-size: 10.5px; color: #666; margin-bottom: 10px; }
      .cab { display: flex; gap: 14px; flex-wrap: wrap; font-size: 10.5px; margin-bottom: 10px; }
      .cab span { border-bottom: 1px solid #999; min-width: 150px; padding-bottom: 2px; }
      table { width: 100%; border-collapse: collapse; }
      td, th { border: 1px solid #bbb; padding: 3px 5px; vertical-align: top; }
      th { background: #eee; font-size: 10px; text-align: left; }
      tr.g td { background: #f3f3f3; font-weight: bold; }
      td.e { white-space: nowrap; width: 86px; text-align: center; }
      td.e span { display: inline-block; border: 1px solid #777; width: 20px; height: 14px; margin: 0 1px;
                  font-size: 9px; text-align: center; line-height: 14px; }
      td.e span.mk { background: #FF5A00; color: #fff; border-color: #FF5A00; }
      td.o { width: 32%; }
      .rod { margin-top: 12px; font-size: 10px; display: flex; gap: 24px; }
      .rod span { border-top: 1px solid #999; padding-top: 3px; flex: 1; }
      tr { page-break-inside: avoid; }
    </style></head><body>
    <h1>+Motor BR · Checklist de recebimento do veículo</h1>
    <div class="sub">C conforme · R precisa de reparo · NA não se aplica. Item em R vai para o orçamento de preparação (Fase 2).</div>
    <div class="cab">
      <div>Veículo: <span>${emBranco ? '' : esc(nomeVeiculo(v))}</span></div>
      <div>Placa: <span>${emBranco ? '' : esc(v.placa || '')}</span></div>
      <div>Km: <span>${emBranco ? '' : esc(v.km || '')}</span></div>
      <div>Data: <span>${emBranco ? '' : dataBR(r.data || hoje())}</span></div>
      <div>Quem conferiu: <span>${emBranco ? '' : esc(r.por || '')}</span></div>
    </div>
    <table><thead><tr><th>Item</th><th>C / R / NA</th><th>Observação</th></tr></thead><tbody>${linhas}</tbody></table>
    <div class="rod"><span>Assinatura de quem conferiu</span><span>Assinatura do consultor</span></div>
    </body></html>`);
  w.document.close();
  w.focus();
  w.print();
}
