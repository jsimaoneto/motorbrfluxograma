// Caixa "Para hoje": junta, numa lista só, tudo que está vencido agora, venha de
// onde vier — o carro que precisa ser ligado no pátio, o lead que pede follow-up e
// a rotina do cargo. O cálculo de vencimento mora em recorrencia.js.
//
// Uma aba por cargo (o checklist de quem vai executar) e a aba Geral, que mostra
// tudo agrupado por cargo, para o gestor acompanhar a casa inteira de uma vez.

const ROTULO_EIXO = {
  veiculo: 'Veículo', lead: 'Lead', pessoa: 'Minha rotina', pos_venda: 'Pós-venda',
};

let cargoHoje = '';   // '' = Geral
function filtrarHoje(id) { cargoHoje = id; telaHoje(); }

function telaHoje() {
  // os cargos saem do responsável do item, pela mesma regra do fluxograma
  const todas = pendenciasDeHoje().map((p) => Object.assign({}, p, { cargos: cargosDoItem({ q: p.quem }) }));
  const fila = cargoHoje ? todas.filter((p) => p.cargos.indexOf(cargoHoje) >= 0) : todas;
  const cargo = acharCargo(cargoHoje);
  const atrasados = fila.filter((p) => p.estado.atrasado).length;

  topo(cargo ? `Para hoje · ${cargo.curto}` : 'Para hoje', atrasados
    ? `${atrasados} ${atrasados === 1 ? 'pendência atrasada' : 'pendências atrasadas'} de ${fila.length}`
    : `${fila.length} ${fila.length === 1 ? 'pendência' : 'pendências'}`);

  // só entram na barra os cargos com pendência agora (mais o que estiver aberto)
  const comTarefa = CARGOS.filter((c) => c.id === cargoHoje || todas.some((p) => p.cargos.indexOf(c.id) >= 0));
  const abas = `<div class="abas">
    <button class="${cargoHoje ? '' : 'ativo'}" onclick="filtrarHoje('')">Geral ${todas.length}</button>
    ${comTarefa.map((c) => {
      const n = todas.filter((p) => p.cargos.indexOf(c.id) >= 0).length;
      return `<button class="${cargoHoje === c.id ? 'ativo' : ''}" onclick="filtrarHoje('${c.id}')">${esc(c.curto)} ${n}</button>`;
    }).join('')}</div>`;

  if (!fila.length) {
    $('#pagina').innerHTML = abas + `
      <div class="cartao" style="text-align:center;padding:48px 24px">
        <h3>Nada vencido agora${cargo ? ' para ' + esc(cargo.curto) : ''}</h3>
        <p style="color:var(--texto-fraco)">Quando o prazo de um item recorrente vencer, ele aparece aqui.
           Itens de uma vez só não voltam: ficam marcados na ficha do veículo.</p>
      </div>`;
    return;
  }

  // na aba de um cargo, agrupa por origem da cobrança; no Geral, agrupa por cargo
  const grupos = {};
  const poe = (chave, p) => (grupos[chave] = grupos[chave] || []).push(p);
  fila.forEach((p) => {
    if (cargoHoje) return poe(ROTULO_EIXO[p.eixo] || p.eixo, p);
    if (!p.cargos.length) return poe('Sem cargo definido', p);
    p.cargos.forEach((id) => poe((acharCargo(id) || {}).nome || id, p));
  });

  $('#pagina').innerHTML = abas + `
    <p class="aviso-topo">Marque conforme for fazendo. O item some da lista e volta sozinho
       quando vencer de novo: ${esc(Object.values(CADENCIAS).join(' · '))}.</p>
    ${Object.entries(grupos).map(([titulo, itens], gi) => `
      <div class="cartao" style="margin-bottom:14px">
        <div class="sub-grupo">${esc(titulo)} · ${itens.length}</div>
        ${itens.map((p, n) => `
          <div class="item-ck ${p.estado.atrasado ? 'atrasado' : ''}">
            <input type="checkbox" data-hoje="${gi}|${n}">
            <label class="txt">${esc(p.titulo)}
              <span class="quem">${esc(p.quem)} · fase ${esc(p.fase)}${
                p.alvo ? ' · <b>' + esc(p.alvo) + '</b>' : ''}${
                p.extra ? ' · ' + esc(p.extra) : ''}${
                cargoHoje ? '' : ' · ' + esc(ROTULO_EIXO[p.eixo] || p.eixo)}</span>
              <span class="marca-em ${p.estado.atrasado ? 'ruim' : ''}">${esc(p.estado.texto)} · ${
                esc(CADENCIAS[p.cada] || p.cada)}</span>
            </label>
          </div>`).join('')}
      </div>`).join('')}`;

  const listas = Object.values(grupos);
  $$('[data-hoje]').forEach((el) => {
    el.onchange = () => {
      const [gi, n] = el.dataset.hoje.split('|');
      const p = (listas[Number(gi)] || [])[Number(n)];
      if (!p) return;
      const alvo = p.eixo === 'veiculo' ? acharVeiculo(p.alvoId)
                 : p.eixo === 'lead' ? acharCliente(p.alvoId) : null;
      marcarRecorrente(p.eixo, p.chave, alvo);
      avisar('Feito. Volta quando vencer.');
      telaHoje();
    };
  });
}
