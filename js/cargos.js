// +Motor BR Fluxograma · fluxograma geral, uma aba por cargo e dashboard
// Todas as telas leem e gravam o mesmo checklist do veículo (v.concluido). Marcar um item na aba de um cargo
// muda na hora a ficha do veículo, o fluxograma geral, as abas dos outros cargos e o dashboard.
// Os cargos saem do campo "q" (responsável) de cada item em fases.js.

const CARGOS = [
  { id: 'consultor', nome: 'Consultor de Vendas', curto: 'Consultor', rotulos: ['Consultor'], dono: 'Consultor de Vendas' },
  { id: 'prevendas', nome: 'Pré-Vendas (SDR)', curto: 'Pré-Vendas', rotulos: ['Pré-Vendas'], dono: 'Pré-Vendas' },
  { id: 'social', nome: 'Social Media', curto: 'Social Media', rotulos: ['Social Media'], dono: 'Social Media' },
  { id: 'motorista', nome: 'Motorista', curto: 'Motorista', rotulos: ['Motorista'], dono: 'Motorista' },
  { id: 'financiamento', nome: 'Analista de Financiamento e Documentação', curto: 'Financiamento', rotulos: ['Financiamento e Doc.', 'Financiamento'], dono: 'Analista de Financiamento' },
  { id: 'consignacao', nome: 'Assistente de Consignação e Captação', curto: 'Consignação', rotulos: ['Consignação'], dono: 'Assistente de Consignação' },
  { id: 'recepcao', nome: 'Atendente de Recepção', curto: 'Recepção', rotulos: ['Recepção'], dono: 'Recepção' },
  { id: 'servicos', nome: 'Auxiliar de Serviços Gerais', curto: 'Serv. Gerais', rotulos: ['Serviços Gerais'], dono: 'Serviços Gerais' },
  { id: 'ceo', nome: 'CEO', curto: 'CEO', rotulos: ['CEO'], dono: 'CEO' },
  { id: 'geradm', nome: 'Gerente Administrativo', curto: 'Ger. Adm.', rotulos: ['Ger. Administrativo'], dono: 'Gerente Administrativo' },
  { id: 'germkt', nome: 'Gerente de Marketing', curto: 'Ger. Marketing', rotulos: ['Ger. Marketing'], dono: 'Gerente de Marketing' },
];
const acharCargo = (id) => CARGOS.find((c) => c.id === id);

function cargosDoItem(it) {
  const partes = it.q.split('/').map((s) => s.trim());
  return CARGOS.filter((c) => c.rotulos.some((r) => partes.includes(r))).map((c) => c.id);
}

// todos os itens do processo com fase, grupo, chave e cargos; com origem, só os que valem para ela
function itensProcesso(origem) {
  const out = [];
  for (const f of FASES) {
    for (const g of (origem ? itensDaFase(f, origem) : f.grupos)) {
      for (const it of g.itens) out.push({ f, g: g.t, it, k: chaveItem(f.n, it.i), cargos: cargosDoItem(it) });
    }
  }
  return out;
}

// soma itens feitos/total de um conjunto de veículos, com filtro opcional sobre o item
function contar(veiculos, filtro) {
  let total = 0, feitos = 0;
  for (const v of veiculos) {
    for (const x of itensProcesso(v.origem)) {
      if (filtro && !filtro(x)) continue;
      total++;
      if (v.concluido[x.k]) feitos++;
    }
  }
  return { total, feitos, pct: total ? Math.round((feitos / total) * 100) : 0 };
}

const emAndamento = () => dados().veiculos.filter((v) => v.status !== 'repassado' && progresso(v).pct < 100);

// itens do cargo ainda abertos na fase em que o veículo está
function pendentesAgora(v, cargoId) {
  const fa = faseAtual(v);
  return itensProcesso(v.origem).filter((x) => x.f.n === fa && x.cargos.includes(cargoId) && !v.concluido[x.k]);
}

function marcarItem(vid, k, feito, por) {
  const v = acharVeiculo(vid);
  if (!v) return;
  if (feito) v.concluido[k] = { data: hoje(), por }; else delete v.concluido[k];
  salvarVeiculo(v);
  avisar(feito ? 'Item concluído' : 'Item reaberto');
  desenhar();
}

// outra aba do navegador gravou: recarrega e redesenha para todas as telas ficarem iguais
window.addEventListener('storage', (e) => {
  if (e.key === 'mbrfluxo_v1' && $('#app').classList.contains('pronto')) { carregar(); desenhar(); }
});

const nomeCurtoV = (v) => [v.modelo || v.marca, v.placa].filter(Boolean).join(' · ') || nomeVeiculo(v);

// ---------------------------------------------------------------- fluxogramas (geral + um por cargo)
function telaFluxogramas() {
  const c = acharCargo(estado.cargo);
  topo(c ? c.nome : 'Fluxograma geral', c ? 'O que é responsabilidade deste cargo e o que ele tem para fazer agora'
    : 'O que cada cargo está fazendo e em que fase está cada veículo', '');
  const abas = [['', 'Geral']].concat(CARGOS.map((x) => [x.id, x.curto]));
  $('#pagina').innerHTML = `
    <div class="abas">${abas.map(([id, nome]) =>
      `<button class="${(estado.cargo || '') === id ? 'ativo' : ''}" onclick="ir('fluxogramas',{cargo:'${id}'})">${esc(nome)}</button>`).join('')}</div>
    <div id="conteudo-aba"></div>`;
  if (c) abaCargo(c); else abaGeral();
}

function abaGeral() {
  const vs = emAndamento();
  if (!vs.length) {
    $('#conteudo-aba').innerHTML = vazioHtml('Nenhum veículo em andamento', 'Cadastre um veículo para acompanhar aqui o trabalho de cada cargo.', 'novoVeiculo()', 'Cadastrar veículo');
    return;
  }
  const porCargo = CARGOS.map((c) => {
    const lista = vs.map((v) => ({ v, n: pendentesAgora(v, c.id).length })).filter((p) => p.n);
    return { c, lista, n: lista.reduce((s, p) => s + p.n, 0), prog: contar(vs, (x) => x.cargos.includes(c.id)) };
  });
  const totalAgora = porCargo.reduce((s, p) => s + p.n, 0);

  $('#conteudo-aba').innerHTML = `
    <div class="indicadores">
      <div class="indicador destaque"><div class="n">${vs.length}</div><div class="r">veículos em andamento</div></div>
      <div class="indicador"><div class="n">${totalAgora}</div><div class="r">tarefas abertas na fase atual</div></div>
      <div class="indicador"><div class="n">${porCargo.filter((p) => p.n).length}</div><div class="r">cargos com tarefa agora</div></div>
      <div class="indicador"><div class="n">${contar(vs).pct}%</div><div class="r">do processo concluído</div></div>
    </div>

    <div class="cartao" style="margin-bottom:18px">
      <div class="cartao-cabeca"><h3>Cada cargo agora</h3>
        <span style="font-size:11.5px;color:var(--texto-fraco)">Clique no cargo para abrir a aba dele</span></div>
      <div class="cartao-corpo"><div class="cargos-grade">
        ${porCargo.map(({ c, lista, n, prog }) => `
          <div class="cargo-card ${n ? 'tem' : ''}" onclick="ir('fluxogramas',{cargo:'${c.id}'})">
            <div class="cc-t">${esc(c.nome)}</div>
            <div class="cc-n"><b>${n}</b> ${n === 1 ? 'tarefa agora' : 'tarefas agora'}</div>
            ${lista.slice(0, 3).map((p) => `<div class="cc-v">${esc(nomeCurtoV(p.v))} · fase ${faseAtual(p.v)} · ${p.n}</div>`).join('')}
            ${lista.length > 3 ? `<div class="cc-v">e mais ${lista.length - 3}</div>` : ''}
            <div class="barra ${prog.pct === 100 ? 'completa' : ''}"><i style="width:${prog.pct}%"></i></div>
            <div class="cc-v">${prog.feitos} de ${prog.total} itens do cargo feitos</div>
          </div>`).join('')}
      </div></div>
    </div>

    <div class="cartao" style="margin-bottom:18px">
      <div class="cartao-cabeca"><h3>Veículo por veículo</h3>
        <span style="font-size:11.5px;color:var(--texto-fraco)">Número laranja: tarefas do cargo na fase atual · %: quanto o cargo já fez neste veículo</span></div>
      <div class="cartao-corpo" style="overflow-x:auto">
        <table class="tabela matriz">
          <thead><tr><th>Veículo</th><th>Fase atual</th>${CARGOS.map((c) => `<th title="${esc(c.nome)}">${esc(c.curto)}</th>`).join('')}</tr></thead>
          <tbody>${vs.map((v) => {
            const fa = FASES[faseAtual(v) - 1];
            return `<tr onclick="ir('veiculo',{veiculoId:'${v.id}',aba:'checklist'})">
              <td class="principal-col">${esc(nomeVeiculo(v))}<div class="fraco">${ORIGENS[v.origem].nome} · ${progresso(v).pct}%</div></td>
              <td class="fraco">${fa.n}. ${esc(fa.t)}</td>
              ${CARGOS.map((c) => {
                const agora = pendentesAgora(v, c.id).length;
                const p = contar([v], (x) => x.cargos.includes(c.id));
                if (agora) return `<td class="cel"><span class="pilula">${agora}</span></td>`;
                if (!p.total) return '<td class="cel fraco">·</td>';
                return `<td class="cel ${p.pct === 100 ? 'ok' : 'fraco'}">${p.pct === 100 ? '✓' : p.pct + '%'}</td>`;
              }).join('')}
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>

    <div class="cartao">
      <div class="cartao-cabeca"><h3>Onde está cada veículo no processo</h3></div>
      <div class="cartao-corpo">
        ${FASES.map((f) => {
          const aqui = vs.filter((v) => faseAtual(v) === f.n);
          return `<div class="linha-fase ${aqui.length ? 'tem' : ''}">
            <div class="lf-n">${f.n}</div>
            <div class="lf-t"><b>${esc(f.t)}</b><span>Dono: ${esc(f.dono)}</span></div>
            <div class="lf-v">${aqui.map((v) => `<span class="etiqueta ${ORIGENS[v.origem].cor}" style="cursor:pointer" onclick="ir('veiculo',{veiculoId:'${v.id}',aba:'checklist'})">${esc(nomeCurtoV(v))}</span>`).join(' ') || '<span class="fraco">nenhum</span>'}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function abaCargo(c) {
  const meus = itensProcesso().filter((x) => x.cargos.includes(c.id));
  const fasesComItens = FASES.filter((f) => meus.some((x) => x.f.n === f.n));
  const donoDe = FASES.filter((f) => f.dono.includes(c.dono));
  const vs = emAndamento();
  const filtro = estado.cargoVeiculo && acharVeiculo(estado.cargoVeiculo) ? estado.cargoVeiculo : '';
  const agoraTotal = vs.reduce((s, v) => s + pendentesAgora(v, c.id).length, 0);

  const itemHtml = (v, x) => {
    const m = v.concluido[x.k];
    const outros = x.cargos.filter((id) => id !== c.id).map((id) => acharCargo(id).curto);
    return `<div class="item-ck ${m ? 'ok' : ''}">
      <input type="checkbox" id="mk_${v.id}_${x.k}" ${m ? 'checked' : ''} onchange="marcarItem('${v.id}','${x.k}',this.checked,'${esc(c.nome)}')">
      <label class="txt" for="mk_${v.id}_${x.k}">${esc(x.it.i)}
        <span class="quem">${x.it.o !== 'T' ? 'Só para ' + ORIGENS[x.it.o].nome.toLowerCase() + ' · ' : ''}${outros.length ? 'Junto com ' + esc(outros.join(', ')) : 'Só este cargo'}</span>
        ${m ? `<span class="marca-em">Feito em ${dataBR(m.data)}${m.por ? ' por ' + esc(m.por) : ''}</span>` : ''}
      </label></div>`;
  };

  let tarefas;
  if (filtro) {
    const v = acharVeiculo(filtro);
    const lista = itensProcesso(v.origem).filter((x) => x.cargos.includes(c.id));
    const fa = faseAtual(v);
    tarefas = lista.length ? FASES.filter((f) => lista.some((x) => x.f.n === f.n)).map((f) => `
      <div class="sub-grupo" data-cf="${f.n}">${f.n}. ${esc(f.t)}${f.n === fa ? ' · fase atual' : ''}</div>
      ${lista.filter((x) => x.f.n === f.n).map((x) => itemHtml(v, x)).join('')}`).join('')
      : '<p class="fraco">Este cargo não tem itens para este veículo.</p>';
  } else {
    const blocos = vs.map((v) => ({ v, lista: pendentesAgora(v, c.id) })).filter((b) => b.lista.length);
    tarefas = blocos.length ? blocos.map(({ v, lista }) => {
      const fa = FASES[faseAtual(v) - 1];
      return `<div class="tarefa-veiculo">
        <div class="tv-cab" onclick="ir('veiculo',{veiculoId:'${v.id}',aba:'checklist'})">
          <b>${esc(nomeVeiculo(v))}</b><span class="etiqueta ${ORIGENS[v.origem].cor}">${ORIGENS[v.origem].nome}</span>
          <span class="fraco">Fase ${fa.n}: ${esc(fa.t)}</span></div>
        ${lista.map((x) => itemHtml(v, x)).join('')}
      </div>`;
    }).join('') : '<p class="fraco">Nenhuma tarefa deste cargo na fase atual dos veículos. Tudo em dia.</p>';
  }

  $('#conteudo-aba').innerHTML = `
    <div class="indicadores">
      <div class="indicador destaque"><div class="n">${agoraTotal}</div><div class="r">tarefas agora</div></div>
      <div class="indicador"><div class="n">${meus.length}</div><div class="r">itens sob responsabilidade</div></div>
      <div class="indicador"><div class="n">${fasesComItens.length}</div><div class="r">de 13 fases em que atua</div></div>
      <div class="indicador"><div class="n">${donoDe.length}</div><div class="r">fases em que é dono</div></div>
    </div>

    <div class="cartao" style="margin-bottom:18px">
      <div class="cartao-cabeca"><h3>O que fazer agora</h3>
        <select style="width:auto;min-width:220px" onchange="estado.cargoVeiculo=this.value;desenhar()">
          <option value="">Todos os veículos (fase atual)</option>
          ${vs.concat(dados().veiculos.filter((v) => !vs.includes(v))).map((v) => `<option value="${v.id}" ${filtro === v.id ? 'selected' : ''}>${esc(nomeVeiculo(v))}${v.placa ? ' · ' + esc(v.placa) : ''}</option>`).join('')}
        </select></div>
      <div class="cartao-corpo">
        <div class="caixa-info" style="margin-top:0">Marcar aqui marca o mesmo item no checklist do veículo, no fluxograma geral e no dashboard.
          ${filtro ? 'Mostrando todos os itens deste cargo no veículo escolhido.' : 'Mostrando só os itens da fase em que cada veículo está.'}</div>
        ${tarefas}
      </div>
    </div>

    <div class="cartao">
      <div class="cartao-cabeca"><h3>Responsabilidades no processo</h3>
        <span style="font-size:11.5px;color:var(--texto-fraco)">${donoDe.length ? 'Dono das fases ' + donoDe.map((f) => f.n).join(', ') : 'Não é dono de nenhuma fase'}</span></div>
      <div class="cartao-corpo">
        ${fasesComItens.map((f) => {
          const doFase = meus.filter((x) => x.f.n === f.n);
          return `<div class="fase-bloco ${donoDe.includes(f) ? 'andamento' : ''}">
            <div class="fase-cabeca" onclick="this.parentElement.classList.toggle('aberta')">
              <div class="fase-num">${f.n}</div>
              <div class="ft"><h4>${esc(f.t)}</h4><p>${donoDe.includes(f) ? 'Este cargo é dono da fase' : 'Dono: ' + esc(f.dono)} · ${esc(f.prazo)}</p></div>
              <div class="conta">${doFase.length} ${doFase.length === 1 ? 'item' : 'itens'}</div>
            </div>
            <div class="fase-corpo">
              <div class="fase-meta"><div><b>Objetivo:</b> ${esc(f.obj)}</div><div><b>Começa quando:</b> ${esc(f.gatilho)}</div></div>
              ${doFase.map((x) => {
                const outros = x.cargos.filter((id) => id !== c.id).map((id) => acharCargo(id).curto);
                return `<div class="item-ck"><div style="width:17px;flex:none;color:var(--laranja)">▪</div>
                  <div class="txt">${esc(x.it.i)}<span class="quem">${x.it.o === 'T' ? 'Todos os veículos' : 'Só ' + ORIGENS[x.it.o].nome.toLowerCase()}${outros.length ? ' · junto com ' + esc(outros.join(', ')) : ''}</span></div></div>`;
              }).join('')}
              <div class="passa-caixa"><b>A fase só termina quando:</b> ${esc(f.passa)}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ---------------------------------------------------------------- navegação a partir do dashboard
// abre o checklist do veículo com as fases pedidas abertas e rola até a primeira
function irChecklist(vid, fases) {
  estado.fasesAbertas = new Set(fases);
  ir('veiculo', { veiculoId: vid, aba: 'checklist' });
  rolarAte(`[data-fase="${fases[0]}"]`);
}
// abre a aba do cargo filtrada no veículo (vid vazio: tarefas de agora de todos) e rola até a fase
function irCargo(cargoId, vid, fase) {
  estado.cargoVeiculo = vid || '';
  ir('fluxogramas', { cargo: cargoId });
  if (fase) rolarAte(`[data-cf="${fase}"]`);
}
function rolarAte(sel) {
  setTimeout(() => { const el = $(sel); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
}

// com um veículo vai direto; com vários (cliente ou loja) pergunta qual
function escolherVeiculo(titulo, resumo, acao, extra) {
  const vs = (estado.dashVs || []).map(acharVeiculo).filter(Boolean);
  if (vs.length === 1) return acao(vs[0].id);
  abrirModal(titulo, `<p class="fraco" style="font-size:12.5px;margin-bottom:10px">Escolha o veículo para abrir o fluxograma.</p>
    <div class="lista-proximos">${vs.map((v) => `<div class="pr-item clicavel" data-esc="${v.id}">
      <div class="pr-texto"><div class="t">${esc(nomeVeiculo(v))}${v.placa ? ' · ' + esc(v.placa) : ''}</div><div class="s">${resumo(v)}</div></div></div>`).join('')}</div>`,
    [{ texto: 'Fechar', acao: fecharModal }].concat(extra ? [extra] : []));
  $$('[data-esc]').forEach((el) => { el.onclick = () => { fecharModal(); acao(el.dataset.esc); }; });
}

function abrirFase(n) {
  const f = FASES[n - 1];
  escolherVeiculo(`Fase ${n}: ${f.t}`, (v) => {
    const p = contar([v], (x) => x.f.n === n);
    return `${p.feitos} de ${p.total} itens feitos${faseAtual(v) === n ? ' · fase atual' : ''}`;
  }, (vid) => irChecklist(vid, [n]));
}

function abrirJornada(j) {
  const fases = FASES.filter((f) => !j || f.jornada === j).map((f) => f.n);
  escolherVeiculo(j === 'cliente' ? 'Jornada do cliente' : j === 'veiculo' ? 'Jornada do veículo' : 'Processo inteiro', (v) => {
    const p = contar([v], (x) => fases.includes(x.f.n));
    return `${p.feitos} de ${p.total} itens feitos · fase atual ${faseAtual(v)}`;
  }, (vid) => {
    const v = acharVeiculo(vid);
    const fa = faseAtual(v);
    irChecklist(vid, fases.includes(fa) ? [fa] : [fases[0]]);
  });
}

function abrirCargo(cargoId, fase) {
  const c = acharCargo(cargoId);
  escolherVeiculo(c.nome + (fase ? ` · fase ${fase}` : ''), (v) => {
    const p = contar([v], (x) => x.cargos.includes(cargoId) && (!fase || x.f.n === fase));
    const agora = pendentesAgora(v, cargoId).length;
    return `${p.feitos} de ${p.total} itens feitos${agora ? ` · <b style="color:var(--laranja-escuro)">${agora} agora</b>` : ''}`;
  }, (vid) => irCargo(cargoId, vid, fase),
  { texto: 'Tarefas de agora de todos', classe: 'principal', acao: () => { fecharModal(); irCargo(cargoId, '', 0); } });
}

// o que foi concluído num dia, com atalho para cada item
function verDia(data) {
  const linhas = [];
  (estado.dashVs || []).map(acharVeiculo).filter(Boolean).forEach((v) => {
    itensProcesso(v.origem).forEach((x) => {
      const m = v.concluido[x.k];
      if (m && m.data === data) linhas.push({ v, x, m });
    });
  });
  abrirModal(`Concluído em ${dataBR(data)}`, linhas.length ? `<div class="lista-proximos">${linhas.map(({ v, x, m }, i) => `
    <div class="pr-item clicavel" data-dia="${i}"><div class="ponto" style="background:var(--verde)"></div>
      <div class="pr-texto"><div class="t">${esc(x.it.i)}</div>
      <div class="s">${esc(nomeVeiculo(v))} · fase ${x.f.n}: ${esc(x.f.t)}${m.por ? ' · por ' + esc(m.por) : ''}</div></div></div>`).join('')}</div>`
    : '<p class="fraco">Nenhum item concluído neste dia.</p>', [{ texto: 'Fechar', acao: fecharModal }]);
  $$('[data-dia]').forEach((el) => { el.onclick = () => { const l = linhas[+el.dataset.dia]; fecharModal(); irChecklist(l.v.id, [l.x.f.n]); }; });
}

// ---------------------------------------------------------------- gráficos (SVG e CSS, sem biblioteca)
function rosca(pct, rotulo, cor, acao) {
  const r = 42, c = 2 * Math.PI * r;
  return `<div class="rosca ${acao ? 'clicavel' : ''}" ${acao ? `onclick="${acao}" title="Abrir no fluxograma"` : ''}><svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="${r}" class="r-fundo"/>
    ${pct ? `<circle cx="50" cy="50" r="${r}" class="r-valor" style="stroke:${cor || 'var(--laranja)'}" stroke-dasharray="${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/>` : ''}
  </svg><div class="rosca-n"><b>${pct}%</b><span>${esc(rotulo)}</span></div></div>`;
}

function barraH(rotulo, feitos, total, subHtml, acao) {
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  return `<div class="bh ${acao ? 'clicavel' : ''}" ${acao ? `onclick="${acao}" title="Abrir no fluxograma"` : ''}><div class="bh-t"><span>${esc(rotulo)}</span><b>${feitos}/${total} · ${pct}%</b></div>
    <div class="barra ${pct === 100 ? 'completa' : ''}"><i style="width:${pct}%"></i></div>${subHtml ? `<div class="bh-s">${subHtml}</div>` : ''}</div>`;
}

function colunas(lista) {
  const max = Math.max(1, ...lista.map((x) => x.n));
  return `<div class="colunas">${lista.map((x) => `<div class="col ${x.a ? 'clicavel' : ''}" title="${esc(x.t || '')}: ${x.n}" ${x.a ? `onclick="${x.a}"` : ''}>
    <em>${x.n || ''}</em><i style="height:${Math.round((x.n / max) * 100)}%"></i><span>${esc(x.r)}</span></div>`).join('')}</div>`;
}

// faixa das 13 fases: verde concluída, laranja com algo feito, cinza não começou, vazia sem itens
function faixaFases(veiculos, filtro, clique) {
  return `<div class="faixa">${FASES.map((f) => {
    const p = contar(veiculos, (x) => x.f.n === f.n && (!filtro || filtro(x)));
    const cls = !p.total ? 'sem' : p.pct === 100 ? 'ok' : p.feitos ? 'meio' : 'nada';
    const acao = clique && p.total ? clique(f.n) : '';
    return `<span class="fx ${cls} ${acao ? 'clicavel' : ''}" ${acao ? `onclick="${acao}"` : ''} title="Fase ${f.n}: ${esc(f.t)} · ${p.feitos}/${p.total}">${f.n}</span>`;
  }).join('')}</div>`;
}

// ---------------------------------------------------------------- dashboard
function telaDashboard() {
  const d = dados();
  topo('Dashboard', 'Andamento do fluxograma por veículo, por cliente ou da loja inteira', '');
  const sel = estado.dash || '';
  const [tipo, id] = sel.split(':');
  const vs = sel === 'loja' ? emAndamento()
    : tipo === 'v' ? [acharVeiculo(id)].filter(Boolean)
    : tipo === 'c' ? d.veiculos.filter((v) => v.clienteId === id) : [];
  const cli = tipo === 'c' ? acharCliente(id) : (vs.length === 1 && vs[0].clienteId ? acharCliente(vs[0].clienteId) : null);
  estado.dashVs = vs.map((v) => v.id);

  const seletor = `<div class="cartao" style="margin-bottom:18px"><div class="cartao-corpo" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
    <label style="font-weight:600;font-size:13px">Mostrar</label>
    <select style="flex:1;min-width:240px;max-width:460px" onchange="estado.dash=this.value;desenhar()">
      <option value="">Escolha um veículo ou um cliente</option>
      <option value="loja" ${sel === 'loja' ? 'selected' : ''}>Toda a loja (veículos em andamento)</option>
      <optgroup label="Veículos">${d.veiculos.map((v) => `<option value="v:${v.id}" ${sel === 'v:' + v.id ? 'selected' : ''}>${esc(nomeVeiculo(v))}${v.placa ? ' · ' + esc(v.placa) : ''}</option>`).join('')}</optgroup>
      <optgroup label="Clientes">${d.clientes.map((c) => `<option value="c:${c.id}" ${sel === 'c:' + c.id ? 'selected' : ''}>${esc(c.nome || 'Cliente sem nome')}</option>`).join('')}</optgroup>
    </select>
    ${vs.length === 1 ? `<button class="btn pequeno" onclick="ir('veiculo',{veiculoId:'${vs[0].id}',aba:'checklist'})">Abrir checklist</button>` : ''}
  </div></div>`;

  if (!sel) {
    $('#pagina').innerHTML = seletor + vazioHtml('Escolha o que acompanhar', 'Selecione um veículo, um cliente ou a loja inteira para ver os gráficos do fluxograma.');
    return;
  }
  if (!vs.length) {
    $('#pagina').innerHTML = seletor + `<div class="cartao"><div class="cartao-corpo">
      ${cli ? `<p><b>${esc(cli.nome)}</b> · ${esc(cli.status)}${cli.temperatura ? ' · lead ' + esc(cli.temperatura) : ''}</p>` : ''}
      <p class="fraco" style="margin-top:6px">${tipo === 'c' ? 'Este cliente ainda não tem veículo ligado a ele. Ligue pelo campo "Cliente comprador", na ficha do veículo, e o dashboard aparece aqui.' : 'Nenhum veículo em andamento.'}</p>
    </div></div>`;
    return;
  }

  const aba = estado.dashAba || 'geral';
  const abas = [['geral', 'Geral'], ['processos', 'Por processo'], ['cargos', 'Por cargo']];
  $('#pagina').innerHTML = seletor + `
    <div class="abas">${abas.map(([a, n]) => `<button class="${aba === a ? 'ativo' : ''}" onclick="estado.dashAba='${a}';desenhar()">${n}</button>`).join('')}</div>
    <div id="conteudo-aba"></div>`;
  ({ geral: dashGeral, processos: dashProcessos, cargos: dashCargos }[aba] || dashGeral)(vs, cli);
}

function dashGeral(vs, cli) {
  const tudo = contar(vs);
  const jv = contar(vs, (x) => x.f.jornada === 'veiculo');
  const jc = contar(vs, (x) => x.f.jornada === 'cliente');
  const um = vs.length === 1 ? vs[0] : null;
  const fasesFeitas = vs.reduce((s, v) => s + FASES.filter((f) => progressoFase(v, f).completa).length, 0);
  const agora = vs.reduce((s, v) => s + itensProcesso(v.origem).filter((x) => x.f.n === faseAtual(v) && !v.concluido[x.k]).length, 0);

  // itens marcados por dia nos últimos 30 dias
  const dias = [];
  for (let i = 29; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); dias.push(iso(dt)); }
  const porDia = Object.fromEntries(dias.map((x) => [x, 0]));
  vs.forEach((v) => Object.values(v.concluido).forEach((m) => { if (m && porDia[m.data] !== undefined) porDia[m.data]++; }));

  const kpis = um ? [
    [`${tudo.feitos}/${tudo.total}`, 'itens feitos', "abrirJornada('')"],
    [`${fasesFeitas}/13`, 'fases concluídas', "abrirJornada('')"],
    [faseAtual(um), 'fase atual', `abrirFase(${faseAtual(um)})`],
    [diasEntre(um.entrada), 'dias em estoque', `ir('veiculo',{veiculoId:'${um.id}',aba:'dados'})`],
    [agora, 'itens abertos na fase atual', `abrirFase(${faseAtual(um)})`],
  ] : [
    [vs.length, 'veículos', "ir('fluxogramas',{cargo:''})"],
    [`${tudo.feitos}/${tudo.total}`, 'itens feitos', "abrirJornada('')"],
    [Math.round(vs.reduce((s, v) => s + diasEntre(v.entrada), 0) / vs.length), 'dias em estoque, média', "ir('veiculos')"],
    [agora, 'itens abertos nas fases atuais', "ir('fluxogramas',{cargo:''})"],
  ];

  $('#conteudo-aba').innerHTML = `
    ${um ? `<div class="caixa-info" style="margin-top:0"><b>${esc(nomeVeiculo(um))}</b> · ${ORIGENS[um.origem].nome}${um.placa ? ' · ' + esc(um.placa) : ''}${cli ? ' · cliente: ' + esc(cli.nome) : ''} · fase atual: ${esc(FASES[faseAtual(um) - 1].t)}</div>` : ''}
    <div class="dash-topo">
      <div class="cartao dash-roscas"><div class="cartao-corpo">
        ${rosca(tudo.pct, 'processo inteiro', '', "abrirJornada('')")}
        ${rosca(jv.pct, 'jornada do veículo', 'var(--preto)', "abrirJornada('veiculo')")}
        ${rosca(jc.pct, 'jornada do cliente', 'var(--azul)', "abrirJornada('cliente')")}
      </div></div>
      <div class="indicadores dash-kpis">${kpis.map(([n, r, a]) => `<div class="indicador clicavel" onclick="${a}" title="Abrir"><div class="n">${n}</div><div class="r">${r}</div></div>`).join('')}</div>
    </div>
    <p class="fraco" style="font-size:11.5px;margin:-8px 0 14px">Clique em qualquer gráfico, fase, cargo ou número para abrir o fluxograma e marcar o que falta.</p>

    <div class="grade-2" style="gap:18px;margin-bottom:18px">
      <div class="cartao"><div class="cartao-cabeca"><h3>As 13 fases</h3></div><div class="cartao-corpo">
        ${faixaFases(vs, null, (n) => `abrirFase(${n})`)}
        <div class="legenda"><span class="fx ok"></span>concluída <span class="fx meio"></span>em andamento <span class="fx nada"></span>não começou</div>
        ${um ? '' : `<div style="margin-top:16px">${colunas(FASES.map((f) => ({ r: String(f.n), t: f.t, n: vs.filter((v) => faseAtual(v) === f.n).length, a: `abrirFase(${f.n})` })))}</div>
          <div class="fraco" style="font-size:11.5px">Quantos veículos estão em cada fase agora</div>`}
      </div></div>
      <div class="cartao"><div class="cartao-cabeca"><h3>Ritmo: itens concluídos por dia</h3><span class="fraco" style="font-size:11.5px">últimos 30 dias</span></div>
        <div class="cartao-corpo">${colunas(dias.map((x, i) => ({ r: i % 5 === 4 ? x.slice(8) + '/' + x.slice(5, 7) : '', t: dataBR(x), n: porDia[x], a: porDia[x] ? `verDia('${x}')` : '' })))}</div></div>
    </div>

    <div class="cartao"><div class="cartao-cabeca"><h3>Cargos: quanto cada um já fez</h3></div><div class="cartao-corpo">
      ${CARGOS.map((c) => ({ c, p: contar(vs, (x) => x.cargos.includes(c.id)) })).filter((x) => x.p.total)
        .map(({ c, p }) => barraH(c.nome, p.feitos, p.total, '', `abrirCargo('${c.id}',0)`)).join('')}
    </div></div>`;
}

function dashProcessos(vs) {
  const um = vs.length === 1 ? vs[0] : null;
  $('#conteudo-aba').innerHTML = `<div class="cartao"><div class="cartao-cabeca"><h3>Andamento de cada fase</h3>
    <span class="fraco" style="font-size:11.5px">${um ? 'Com as datas previstas e realizadas da ficha' : 'Soma de todos os veículos escolhidos'}</span></div>
    <div class="cartao-corpo">${FASES.map((f) => {
      const p = contar(vs, (x) => x.f.n === f.n);
      const atual = um && faseAtual(um) === f.n;
      let sub = `${f.jornada === 'veiculo' ? 'Jornada do veículo' : 'Jornada do cliente'} · dono: ${esc(f.dono)}`;
      if (um) {
        const dt = um.fasesDatas[f.n] || {};
        const atrasada = dt.previsto && !dt.realizado && dt.previsto < hoje();
        sub += dt.previsto ? ` · previsto ${dataBR(dt.previsto)}` : '';
        sub += dt.realizado ? ` · realizado ${dataBR(dt.realizado)}` : '';
        if (atrasada) sub += ' · <span style="color:var(--vermelho);font-weight:600">atrasada</span>';
        if (atual) sub += ' · <span style="color:var(--laranja-escuro);font-weight:600">fase atual</span>';
      } else {
        const aqui = vs.filter((v) => faseAtual(v) === f.n).length;
        if (aqui) sub += ` · <b>${aqui} ${aqui === 1 ? 'veículo' : 'veículos'} nesta fase</b>`;
      }
      return barraH(`${f.n}. ${f.t}`, p.feitos, p.total, sub, `abrirFase(${f.n})`);
    }).join('')}</div></div>`;
}

function dashCargos(vs) {
  const linhas = CARGOS.map((c) => ({
    c, p: contar(vs, (x) => x.cargos.includes(c.id)),
    agora: vs.reduce((s, v) => s + pendentesAgora(v, c.id).length, 0),
  })).filter((x) => x.p.total).sort((a, b) => b.agora - a.agora || a.p.pct - b.p.pct);
  $('#conteudo-aba').innerHTML = `
    <div class="cartao" style="margin-bottom:18px"><div class="cartao-cabeca"><h3>Tarefas abertas agora, por cargo</h3></div>
      <div class="cartao-corpo">${colunas(linhas.map((x) => ({ r: x.c.curto, t: x.c.nome, n: x.agora, a: `abrirCargo('${x.c.id}',0)` })))}</div></div>
    <div class="cargos-grade">${linhas.map(({ c, p, agora }) => `
      <div class="cartao"><div class="cartao-corpo">
        <div style="display:flex;gap:12px;align-items:center">
          ${rosca(p.pct, 'feito', p.pct === 100 ? 'var(--verde)' : 'var(--laranja)', `abrirCargo('${c.id}',0)`)}
          <div style="flex:1;min-width:0">
            <div style="font-weight:600">${esc(c.nome)}</div>
            <div class="fraco" style="font-size:12px">${p.feitos} de ${p.total} itens · ${agora ? `<b style="color:var(--laranja-escuro)">${agora} agora</b>` : 'nada pendente agora'}</div>
            <button class="btn pequeno" style="margin-top:8px" onclick="abrirCargo('${c.id}',0)">Abrir fluxograma do cargo</button>
          </div>
        </div>
        <div style="margin-top:12px">${faixaFases(vs, (x) => x.cargos.includes(c.id), (n) => `abrirCargo('${c.id}',${n})`)}</div>
      </div></div>`).join('')}</div>`;
}
