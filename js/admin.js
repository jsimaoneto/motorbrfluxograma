// +Motor BR Fluxograma · página Admin
// Mostra onde o processo está demorando, quanto tempo cada fase leva e quem é o responsável por cada pendência.
//
// COMO INSTALAR (2 passos, não precisa mexer em mais nada):
//   1. Salvar este arquivo em  js/admin.js
//   2. No index.html, logo DEPOIS da linha do app.js, acrescentar:
//        <script src="js/admin.js?v=8"></script>
//
// Ele se encaixa sozinho: cria o item "Admin" no menu e a tela, sem alterar app.js, db.js, fases.js nem cargos.js.
// Só LÊ os dados (dados().veiculos); não grava nada.
//
// A tela abre em modo EXEMPLO (dados fictícios). O botão no topo alterna para os DADOS REAIS.
//
// IMPORTANTE:
//  - Hoje o sistema só guarda o DIA em que cada item foi marcado (v.concluido[chave].data), então os tempos
//    são em dias. Para saber QUEM marcou, veja o "Passo extra" no fim deste arquivo.
//  - Esta página NÃO é protegida: quem entra no sistema vê o Admin. Para restringir de verdade é preciso
//    login com perfis (por exemplo Supabase Auth).

(function () {
  'use strict';

  // ------------------------------------------------------------------ configuração
  // Quem ocupa cada cargo de verdade. Preencher com os nomes reais (ex.: consultor: 'Fulano'); vazio mostra o cargo.
  const EQUIPE = {};
  // Nomes fictícios, usados só no modo "Dados de exemplo".
  const EQUIPE_EXEMPLO = {
    consultor: 'Rafael Mendes',
    prevendas: 'Camila Duarte',
    social: 'Bruna Telles',
    motorista: 'Anselmo Prado',
    financiamento: 'Patrícia Lemos',
    consignacao: 'Diego Farias',
    recepcao: 'Jéssica Moura',
    servicos: 'Marcos Oliveira',
    ceo: 'Eduardo Salles',
    geradm: 'Helena Cunha',
    germkt: 'Thiago Brandão',
    outros: 'Equipe',
  };

  const LIMITES = [3, 5, 7, 10, 15, 30]; // opções de atraso: dias na mesma fase

  // ------------------------------------------------------------------ utilidades
  const nomeCargo = (id) => (typeof acharCargo === 'function' && acharCargo(id) ? acharCargo(id).curto : 'Outros');
  const pessoa = (id) => (estado.adminModo === 'real' ? EQUIPE : EQUIPE_EXEMPLO)[id] || nomeCargo(id);
  const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const somaDias = (iso, n) => {
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + Math.round(n));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const maxIso = (a, b) => (a > b ? a : b);

  const cacheItens = {};
  function itens(origem) {
    return cacheItens[origem] || (cacheItens[origem] = itensProcesso(origem));
  }
  const cargoPrincipal = (x) => x.cargos[0] || 'outros';

  // ------------------------------------------------------------------ dados fictícios
  // Gera 16 veículos de mentira em vários pontos do processo, com alguns em atraso de propósito
  // para o painel ter o que mostrar. Datas são calculadas a partir de hoje, então o exemplo nunca fica velho.
  function gerarExemplo() {
    let sem = 20260101;
    const rnd = () => { // mulberry32: sempre gera os mesmos números
      sem |= 0; sem = (sem + 0x6D2B79F5) | 0;
      let t = Math.imul(sem ^ (sem >>> 15), 1 | sem);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    // duração típica de cada fase, em dias (fases 1 a 13)
    const BASE = [1, 1, 1, 5, 2, 4, 2, 6, 7, 2, 1, 1, 3];
    // [marca, modelo, versão, origem, fase atual, dias na fase atual, fração feita da fase atual, dias sem movimento]
    const SPEC = [
      ['Honda', 'Civic', 'Touring 1.5 Turbo', 'U', 4, 11, 0.4, 6],
      ['Toyota', 'Corolla', 'XEi 2.0', 'U', 9, 8, 0.3, 5],
      ['Jeep', 'Compass', 'Limited Diesel', 'C', 2, 3, 0.5, 1],
      ['Volkswagen', 'T-Cross', 'Highline 250 TSI', 'U', 5, 2, 0.6, 1],
      ['Hyundai', 'HB20', 'Platinum 1.0 Turbo', 'Z', 1, 1, 0.5, 0],
      ['BMW', '320i', 'M Sport', 'U', 4, 16, 0.2, 12],
      ['Chevrolet', 'Onix', 'Premier 1.0 Turbo', 'Z', 8, 5, 0.5, 2],
      ['Fiat', 'Toro', 'Volcano Diesel 4x4', 'C', 6, 4, 0.3, 3],
      ['Ford', 'Ranger', 'Limited 3.2', 'U', 4, 6, 0.7, 1],
      ['Renault', 'Kwid', 'Zen 1.0', 'U', 11, 1, 0.5, 0],
      ['Mercedes-Benz', 'C 180', 'Avantgarde', 'C', 3, 9, 0, 9],
      ['Kia', 'Sportage', 'EX 1.6 Turbo', 'U', 9, 15, 0.5, 9],
      ['Nissan', 'Kicks', 'Exclusive', 'U', 7, 2, 0.4, 1],
      ['Honda', 'HR-V', 'Touring', 'U', 13, 5, 0.5, 2],
      ['Audi', 'Q3', 'Prestige Plus', 'U', 5, 9, 0.3, 7],
      ['Peugeot', '208', 'Griffe 1.0 Turbo', 'Z', 10, 3, 0.5, 2],
    ];
    const hj = hoje();
    return SPEC.map((s, idx) => {
      const [marca, modelo, versao, origem, faseAtualN, diasAtual, frac, semMov] = s;
      const its = itensProcesso(origem);
      const durs = BASE.map((b, i) => (i + 1 < faseAtualN ? Math.max(1, Math.round(b * (0.6 + rnd() * 1.1))) : 0));
      const total = durs.reduce((a, b) => a + b, 0) + diasAtual;
      const entrada = somaDias(hj, -total);
      const concluido = {};
      let cursor = entrada;
      for (const f of FASES) {
        const doFase = its.filter((x) => x.f.n === f.n);
        if (!doFase.length) continue;
        if (f.n < faseAtualN) {
          const dur = durs[f.n - 1];
          doFase.forEach((x, i) => {
            concluido[x.k] = { data: somaDias(cursor, dur * ((i + 1) / doFase.length)), por: pessoa(cargoPrincipal(x)) };
          });
          cursor = somaDias(cursor, dur);
        } else if (f.n === faseAtualN) {
          const k = Math.ceil(frac * doFase.length);
          const janela = Math.max(0, diasAtual - semMov);
          for (let i = 0; i < k; i++) {
            concluido[doFase[i].k] = { data: somaDias(cursor, janela * ((i + 1) / k)), por: pessoa(cargoPrincipal(doFase[i])) };
          }
        }
      }
      return {
        id: 'demo_' + idx, origem, marca, modelo, versao, anoMod: String(2019 + (idx % 6)),
        status: faseAtualN >= 6 ? 'vendido' : 'estoque', entrada, concluido, fasesDatas: {}, anotacoes: [], fotos: [],
        demo: true,
      };
    });
  }

  let exemplo = null;
  const fonteExemplo = () => exemplo || (exemplo = gerarExemplo());

  // ------------------------------------------------------------------ análise de um veículo
  // Percorre as fases na ordem. O tempo de uma fase vai do último item da fase anterior até o último item dela.
  function analisar(v) {
    const todos = itens(v.origem);
    let cursor = v.entrada || hoje();
    const fases = [];
    let atual = null;
    for (const f of FASES) {
      const doFase = todos.filter((x) => x.f.n === f.n);
      const feitos = doFase.filter((x) => v.concluido[x.k]);
      const datas = feitos.map((x) => v.concluido[x.k].data).filter(Boolean).sort();
      const ultima = datas.length ? datas[datas.length - 1] : null;
      if (feitos.length === doFase.length) { // fase completa (ou sem itens para esta origem)
        const fim = ultima ? maxIso(ultima, cursor) : cursor;
        if (doFase.length) fases.push({ n: f.n, dias: diasEntre(cursor, fim), ini: cursor, fim });
        cursor = fim;
      } else {
        atual = {
          n: f.n, ini: cursor, dias: diasEntre(cursor),
          semMov: diasEntre(ultima ? maxIso(ultima, cursor) : cursor),
          feitos: feitos.length, total: doFase.length,
          pendentes: doFase.filter((x) => !v.concluido[x.k]),
        };
        break;
      }
    }
    return { v, nome: nomeVeiculo(v), fases, atual };
  }

  function consolidar(lista) {
    const an = lista.map(analisar);
    const andamento = an.filter((a) => a.atual && a.v.status !== 'repassado');

    // média de dias por fase (só fases já concluídas)
    const porFase = FASES.map((f) => {
      const ds = [];
      an.forEach((a) => a.fases.forEach((x) => { if (x.n === f.n) ds.push(x.dias); }));
      const aguardando = andamento.filter((a) => a.atual.n === f.n).length;
      return {
        f, amostras: ds.length, aguardando,
        media: ds.length ? ds.reduce((s, d) => s + d, 0) / ds.length : null,
        max: ds.length ? Math.max(...ds) : null,
      };
    });

    // por cargo
    const cargos = {};
    const cargoDe = (id) => cargos[id] || (cargos[id] = { id, feitos30: 0, pendentes: 0, travados: new Set(), maisAntigo: 0 });
    const corte = somaDias(hoje(), -30);
    an.forEach((a) => {
      itens(a.v.origem).forEach((x) => {
        const m = a.v.concluido[x.k];
        if (m && m.data && m.data >= corte) cargoDe(cargoPrincipal(x)).feitos30++;
      });
    });
    andamento.forEach((a) => {
      a.atual.pendentes.forEach((x) => {
        (x.cargos.length ? x.cargos : ['outros']).forEach((cid) => {
          const c = cargoDe(cid);
          c.pendentes++;
          c.travados.add(a.v.id);
          c.maisAntigo = Math.max(c.maisAntigo, a.atual.dias);
        });
      });
    });

    // atividade recente
    const atividade = [];
    an.forEach((a) => {
      itens(a.v.origem).forEach((x) => {
        const m = a.v.concluido[x.k];
        if (m && m.data) atividade.push({ data: m.data, quando: m.quando || null, por: m.por || null, cargo: cargoPrincipal(x), item: x.it.i, fase: x.f.n, v: a.v, nome: a.nome });
      });
    });
    atividade.sort((p, q) => (q.quando || q.data).localeCompare(p.quando || p.data));

    // tempo até a vitrine (fases 1 a 5 completas)
    const ateVitrine = an.filter((a) => [1, 2, 3, 4, 5].every((n) => {
      const f = a.fases.find((x) => x.n === n);
      return f || !itens(a.v.origem).some((x) => x.f.n === n);
    }) && a.fases.length >= 4).map((a) => a.fases.filter((x) => x.n <= 5).reduce((s, x) => s + x.dias, 0));

    return { an, andamento, porFase, cargos, atividade, ateVitrine };
  }

  // ------------------------------------------------------------------ tela
  const CSS = `
  .adm-aviso{background:var(--amarelo-claro);border:1px solid #EAD596;color:#6B5310;border-radius:var(--raio-p);padding:10px 14px;font-size:12.5px;margin-bottom:16px}
  .adm-aviso b{font-weight:600}
  .adm-linha{display:grid;gap:18px;grid-template-columns:1fr 1fr;margin-bottom:20px}
  .adm-rolar{overflow-x:auto}
  .adm-barra-l{display:grid;grid-template-columns:minmax(120px,210px) 1fr 74px;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--linha);font-size:12.5px}
  .adm-barra-l:last-child{border-bottom:0}
  .adm-barra-l .n{font-weight:600;line-height:1.3}
  .adm-barra-l .n small{display:block;font-weight:400;color:var(--texto-fraco);font-size:11px}
  .adm-trilho{height:9px;background:var(--cinza-claro);border-radius:6px;overflow:hidden}
  .adm-trilho i{display:block;height:100%;background:var(--laranja);border-radius:6px}
  .adm-barra-l.lenta .adm-trilho i{background:var(--vermelho)}
  .adm-barra-l .v{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
  .adm-dias{font-weight:700;font-variant-numeric:tabular-nums}
  .adm-dias.al{color:var(--vermelho)} .adm-dias.at{color:var(--amarelo)}
  .adm-resp{font-size:12px;line-height:1.45}
  .adm-resp b{font-weight:600}
  .adm-ctrl{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .adm-ctrl select{padding:6px 8px;border:1px solid var(--linha);border-radius:var(--raio-p);font:inherit;font-size:12px;background:#fff}
  .adm-modo{display:inline-flex;border:1px solid var(--linha);border-radius:var(--raio-p);overflow:hidden}
  .adm-modo button{border:0;background:#fff;padding:6px 12px;font:inherit;font-size:12px;cursor:pointer;color:var(--texto-fraco)}
  .adm-modo button.ativo{background:var(--preto);color:#fff}
  .adm-ativ{display:grid;grid-template-columns:78px 1fr;gap:10px;padding:8px 0;border-bottom:1px solid var(--linha);font-size:12.5px}
  .adm-ativ:last-child{border-bottom:0}
  .adm-ativ .d{color:var(--texto-fraco);font-size:11.5px;padding-top:1px}
  .adm-ativ .t{line-height:1.4}
  .adm-ativ .s{color:var(--texto-fraco);font-size:11.5px}
  .adm-vazio{color:var(--texto-fraco);font-size:13px;padding:6px 0}
  @media (max-width:900px){.adm-linha{grid-template-columns:1fr}.adm-barra-l{grid-template-columns:110px 1fr 60px}}
  `;

  function injetarCss() {
    if (document.getElementById('adm-css')) return;
    const s = document.createElement('style');
    s.id = 'adm-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function classeDias(d, limite) {
    return d >= limite * 2 ? 'al' : (d >= limite ? 'at' : '');
  }

  // quem responde pelas pendências de um veículo: cargos ordenados pelo nº de itens abertos
  function responsaveis(atual) {
    const cont = {};
    atual.pendentes.forEach((x) => (x.cargos.length ? x.cargos : ['outros']).forEach((c) => { cont[c] = (cont[c] || 0) + 1; }));
    return Object.entries(cont).sort((a, b) => b[1] - a[1]);
  }

  function telaAdmin() {
    injetarCss();
    if (!estado.adminModo) estado.adminModo = 'exemplo';
    if (!estado.adminLimite) estado.adminLimite = 7;
    const demo = estado.adminModo === 'exemplo';
    const limite = estado.adminLimite;
    const lista = demo ? fonteExemplo() : dados().veiculos;
    const R = consolidar(lista);

    topo('Admin', 'Tempos, gargalos e responsáveis', `
      <div class="adm-ctrl">
        <div class="adm-modo">
          <button class="${demo ? 'ativo' : ''}" onclick="admModo('exemplo')">Dados de exemplo</button>
          <button class="${demo ? '' : 'ativo'}" onclick="admModo('real')">Dados reais</button>
        </div>
        <label style="font-size:12px;color:var(--texto-fraco)">Atraso a partir de
          <select onchange="admLimite(this.value)">${LIMITES.map((n) => `<option value="${n}" ${n === limite ? 'selected' : ''}>${n}+ dias</option>`).join('')}</select>
        </label>
      </div>`);

    const lentas = R.porFase.filter((p) => p.media != null).sort((a, b) => b.media - a.media);
    const maisLenta = lentas[0];
    const paradas = R.andamento.filter((a) => a.atual.dias >= limite).sort((a, b) => b.atual.dias - a.atual.dias);
    const cargosOrd = Object.values(R.cargos).sort((a, b) => b.pendentes - a.pendentes);
    const topCargo = cargosOrd.find((c) => c.pendentes > 0);
    const mediaVitrine = R.ateVitrine.length ? R.ateVitrine.reduce((s, d) => s + d, 0) / R.ateVitrine.length : null;

    const indicadores = [
      { n: R.andamento.length, r: 'veículos em andamento', c: 'destaque' },
      { n: paradas.length, r: `veículos em atraso (${limite}+ dias na mesma fase)`, c: paradas.length ? 'alerta' : '' },
      { n: mediaVitrine == null ? '—' : fmt1(mediaVitrine) + ' d', r: 'média da entrada até a vitrine' },
      { n: maisLenta ? fmt1(maisLenta.media) + ' d' : '—', r: maisLenta ? 'fase mais lenta: ' + maisLenta.f.t : 'fase mais lenta' },
      { n: topCargo ? topCargo.pendentes : 0, r: topCargo ? 'itens abertos com ' + pessoa(topCargo.id) + (pessoa(topCargo.id) === nomeCargo(topCargo.id) ? '' : ' (' + nomeCargo(topCargo.id) + ')') : 'itens abertos' },
    ];

    // gráfico "Principais atrasos": soma dos dias dos veículos em atraso (limite acima), por área ou por fase
    const modoG = estado.adminGrafico || 'area';
    const grupos = {};
    paradas.forEach((a) => {
      if (modoG === 'area') {
        const ids = new Set();
        a.atual.pendentes.forEach((x) => (x.cargos.length ? x.cargos : ['outros']).forEach((c) => ids.add(c)));
        ids.forEach((c) => {
          const g = grupos[c] || (grupos[c] = { rot: nomeCargo(c), sub: pessoa(c), v: 0, d: 0 });
          g.v++; g.d += a.atual.dias;
        });
      } else {
        const n = a.atual.n;
        const g = grupos[n] || (grupos[n] = { rot: n + '. ' + FASES[n - 1].t, sub: 'Dono: ' + FASES[n - 1].dono, v: 0, d: 0 });
        g.v++; g.d += a.atual.dias;
      }
    });
    const barrasG = Object.values(grupos).sort((a, b) => b.d - a.d);
    const maxG = Math.max(1, ...barrasG.map((b) => b.d));

    const maxMedia = Math.max(1, ...R.porFase.map((p) => p.media || 0));
    const idLenta = maisLenta ? maisLenta.f.n : -1;

    $('#pagina').innerHTML = `
      ${demo ? `<div class="adm-aviso"><b>Dados fictícios.</b> Veículos, datas e nomes abaixo são de exemplo para mostrar como a tela funciona. Clique em <b>Dados reais</b> para ver a loja de verdade.</div>`
        : (lista.length ? '' : `<div class="adm-aviso">Ainda não há veículos cadastrados. Cadastre veículos e marque itens do checklist para esta tela se preencher.</div>`)}

      <div class="indicadores">
        ${indicadores.map((i) => `<div class="indicador ${i.c || ''}"><div class="n">${esc(i.n)}</div><div class="r">${esc(i.r)}</div></div>`).join('')}
      </div>

      <div class="cartao" style="margin-bottom:20px">
        <div class="cartao-cabeca"><h3>Principais atrasos</h3>
          <span style="font-size:11.5px;color:var(--texto-fraco)">dias de atraso acumulados (veículos há ${limite}+ dias na mesma fase)</span>
          <div class="adm-modo">
            <button class="${modoG === 'area' ? 'ativo' : ''}" onclick="admGrafico('area')">Por área</button>
            <button class="${modoG === 'fase' ? 'ativo' : ''}" onclick="admGrafico('fase')">Por fase</button>
          </div></div>
        <div class="cartao-corpo">
          ${barrasG.length ? barrasG.map((b, i) => `
            <div class="adm-barra-l ${i === 0 ? 'lenta' : ''}">
              <div class="n">${esc(b.rot)}<small>${esc(b.sub)} · ${b.v} veículo${b.v === 1 ? '' : 's'} em atraso</small></div>
              <div class="adm-trilho"><i style="width:${Math.max(3, (b.d / maxG) * 100)}%"></i></div>
              <div class="v">${b.d} d</div>
            </div>`).join('') + (modoG === 'area' ? '<div class="adm-vazio" style="margin-top:8px;font-size:11.5px">Veículo com pendências de mais de uma área conta em todas elas, por isso a soma pode passar do total de veículos em atraso.</div>' : '')
          : `<div class="adm-vazio">Nenhum veículo em atraso (${limite}+ dias na mesma fase).</div>`}
        </div>
      </div>

      <div class="adm-linha">
        <div class="cartao">
          <div class="cartao-cabeca"><h3>Tempo médio por fase</h3>
            <span style="font-size:11.5px;color:var(--texto-fraco)">dias entre o fim da fase anterior e o fim desta</span></div>
          <div class="cartao-corpo">
            ${R.porFase.map((p) => `
              <div class="adm-barra-l ${p.f.n === idLenta ? 'lenta' : ''}">
                <div class="n">${p.f.n}. ${esc(p.f.t)}<small>${p.aguardando} aguardando agora · ${p.amostras} concluída${p.amostras === 1 ? '' : 's'}</small></div>
                <div class="adm-trilho"><i style="width:${p.media == null ? 0 : Math.max(3, (p.media / maxMedia) * 100)}%"></i></div>
                <div class="v">${p.media == null ? '—' : fmt1(p.media) + ' d'}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="cartao">
          <div class="cartao-cabeca"><h3>Atividade recente</h3>
            <span style="font-size:11.5px;color:var(--texto-fraco)">últimos itens marcados</span></div>
          <div class="cartao-corpo">
            ${R.atividade.length ? R.atividade.slice(0, 14).map((a) => {
              const quem = a.por || pessoa(a.cargo);
              return `<div class="adm-ativ">
                <div class="d">${dataBR(a.data).slice(0, 5)}</div>
                <div><div class="t">${esc(a.item.length > 92 ? a.item.slice(0, 91) + '…' : a.item)}</div>
                  <div class="s"><b>${esc(quem)}</b> · ${esc(a.nome)} · fase ${a.fase}</div></div>
              </div>`;
            }).join('') : '<div class="adm-vazio">Nenhum item marcado ainda.</div>'}
            ${!demo ? `<div class="adm-vazio" style="margin-top:8px;font-size:11.5px">Se aparecer o cargo em vez do nome, o item foi marcado sem identificar quem fez. Veja o "Passo extra" no fim do admin.js.</div>` : ''}
          </div>
        </div>
      </div>

      <div class="cartao" style="margin-bottom:20px">
        <div class="cartao-cabeca"><h3>Pendências em atraso</h3>
          <span style="font-size:11.5px;color:var(--texto-fraco)">veículos há ${limite}+ dias na mesma fase, do maior atraso ao menor</span></div>
        <div class="cartao-corpo adm-rolar">
          ${paradas.length ? `<table class="tabela">
            <thead><tr><th>Veículo</th><th>Fase em que está</th><th>Dias na fase</th><th>Sem movimento</th><th>Itens</th><th>Quem precisa agir</th></tr></thead>
            <tbody>${paradas.map((a) => {
              const r = responsaveis(a.atual).slice(0, 3);
              const f = FASES[a.atual.n - 1];
              return `<tr onclick="admAbrir('${esc(a.v.id)}')">
                <td class="principal-col">${esc(a.nome)}<div class="fraco">${esc(ORIGENS[a.v.origem].nome)}${a.v.anoMod ? ' · ' + esc(a.v.anoMod) : ''}</div></td>
                <td>${a.atual.n}. ${esc(f.t)}<div class="fraco">Dono da fase: ${esc(f.dono)}</div></td>
                <td><span class="adm-dias ${classeDias(a.atual.dias, limite)}">${a.atual.dias} d</span></td>
                <td><span class="adm-dias ${classeDias(a.atual.semMov, limite)}">${a.atual.semMov} d</span></td>
                <td>${a.atual.feitos}/${a.atual.total}</td>
                <td class="adm-resp">${r.map(([c, n]) => `<div><b>${esc(pessoa(c))}</b> · ${esc(nomeCargo(c))} · ${n} ${n === 1 ? 'item' : 'itens'}</div>`).join('')}</td>
              </tr>`;
            }).join('')}</tbody></table>`
          : `<div class="adm-vazio">Nenhum veículo em atraso (${limite}+ dias na mesma fase).</div>`}
        </div>
      </div>

      <div class="cartao">
        <div class="cartao-cabeca"><h3>Quem está com o quê</h3>
          <span style="font-size:11.5px;color:var(--texto-fraco)">pendências na fase atual de cada veículo e produção dos últimos 30 dias</span></div>
        <div class="cartao-corpo adm-rolar">
          <table class="tabela">
            <thead><tr><th>Pessoa</th><th>Cargo</th><th>Itens abertos agora</th><th>Veículos aguardando</th><th>Em atraso (${limite}+ dias)</th><th>Fase mais antiga (dias)</th><th>Feitos em 30 dias</th></tr></thead>
            <tbody>${cargosOrd.map((c) => {
              const travados = Array.from(c.travados).filter((id) => {
                const a = R.andamento.find((x) => x.v.id === id);
                return a && a.atual.dias >= limite;
              }).length;
              return `<tr style="cursor:default">
                <td class="principal-col">${esc(pessoa(c.id))}</td>
                <td>${esc(nomeCargo(c.id))}</td>
                <td><span class="adm-dias">${c.pendentes}</span></td>
                <td>${c.travados.size}</td>
                <td><span class="adm-dias ${travados ? 'al' : ''}">${travados}</span></td>
                <td>${c.maisAntigo ? c.maisAntigo + ' d' : '—'}</td>
                <td>${c.feitos30}</td>
              </tr>`;
            }).join('') || '<tr style="cursor:default"><td colspan="7" class="adm-vazio">Sem dados ainda.</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;
  }

  // ------------------------------------------------------------------ ações da tela
  window.admModo = (m) => { estado.adminModo = m; telaAdmin(); };
  window.admLimite = (n) => { estado.adminLimite = +n; telaAdmin(); };
  window.admGrafico = (m) => { estado.adminGrafico = m; telaAdmin(); };
  window.admAbrir = (id) => {
    if (estado.adminModo === 'exemplo') return avisar('Veículo de exemplo: não existe ficha');
    ir('veiculo', { veiculoId: id });
  };

  // ------------------------------------------------------------------ encaixe no sistema
  ic.admin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>';
  const posDados = PAGINAS.findIndex((p) => p.id === 'dados');
  PAGINAS.splice(posDados < 0 ? PAGINAS.length : posDados, 0, { id: 'admin', nome: 'Admin', icone: 'admin' });
  // quem já estava logado montou o menu antes deste arquivo carregar
  if (document.getElementById('app').classList.contains('pronto')) montarMenu();

  const desenharOriginal = desenhar;
  desenhar = function () {
    if (estado.pagina === 'admin') return telaAdmin();
    return desenharOriginal();
  };
})();

// ------------------------------------------------------------------------------------------------
// PASSO EXTRA (opcional): registrar QUEM marcou cada item e a hora exata.
//
// Hoje, ao marcar um item na ficha do veículo, o sistema grava só  { data }  — sem o nome de quem marcou.
// (Marcando pela aba de um cargo, em cargos.js, ele já grava  { data, por }.)
// Para o Admin mostrar o nome certo em tudo, trocar em app.js, dentro de abaChecklist(), esta linha:
//
//     if (el.checked) v.concluido[k] = { data: hoje() };
//
// por:
//
//     if (el.checked) v.concluido[k] = { data: hoje(), quando: new Date().toISOString(), por: localStorage.getItem('mbrfluxo_autor') || '' };
//
// O campo "mbrfluxo_autor" é o mesmo nome que o sistema já pede nas anotações do veículo.
// Sem identificação de usuário de verdade (login), esse nome é só o que a pessoa digitou: serve para
// acompanhamento, não como prova. Com Supabase Auth, trocar por o id do usuário logado.
// ------------------------------------------------------------------------------------------------
