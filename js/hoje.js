// Caixa "Para hoje": junta, numa lista só, tudo que está vencido agora, venha de
// onde vier — o carro que precisa ser ligado no pátio, o lead que pede follow-up e
// a rotina do cargo. O cálculo de vencimento mora em recorrencia.js.

const ROTULO_EIXO = {
  veiculo: 'Veículo', lead: 'Lead', pessoa: 'Minha rotina', pos_venda: 'Pós-venda',
};

function telaHoje() {
  const fila = pendenciasDeHoje();
  const atrasados = fila.filter((p) => p.estado.atrasado).length;

  topo('Para hoje', atrasados
    ? `${atrasados} ${atrasados === 1 ? 'pendência atrasada' : 'pendências atrasadas'} de ${fila.length}`
    : `${fila.length} ${fila.length === 1 ? 'pendência' : 'pendências'}`);

  if (!fila.length) {
    $('#pagina').innerHTML = `
      <div class="cartao" style="text-align:center;padding:48px 24px">
        <h3>Nada vencido agora</h3>
        <p style="color:var(--texto-fraco)">Quando o prazo de um item recorrente vencer, ele aparece aqui.
           Itens de uma vez só não voltam: ficam marcados na ficha do veículo.</p>
      </div>`;
    return;
  }

  const porEixo = {};
  fila.forEach((p) => (porEixo[p.eixo] = porEixo[p.eixo] || []).push(p));

  $('#pagina').innerHTML = `
    <p class="aviso-topo">Marque conforme for fazendo. O item some da lista e volta sozinho
       quando vencer de novo: ${esc(Object.values(CADENCIAS).join(' · '))}.</p>
    ${Object.entries(porEixo).map(([eixo, itens]) => `
      <div class="cartao" style="margin-bottom:14px">
        <div class="sub-grupo">${esc(ROTULO_EIXO[eixo] || eixo)} · ${itens.length}</div>
        ${itens.map((p, n) => `
          <div class="item-ck ${p.estado.atrasado ? 'atrasado' : ''}">
            <input type="checkbox" data-hoje="${n}|${esc(eixo)}">
            <label class="txt">${esc(p.titulo)}
              <span class="quem">${esc(p.quem)} · fase ${esc(p.fase)}${
                p.alvo ? ' · <b>' + esc(p.alvo) + '</b>' : ''}${
                p.extra ? ' · ' + esc(p.extra) : ''}</span>
              <span class="marca-em ${p.estado.atrasado ? 'ruim' : ''}">${esc(p.estado.texto)} · ${
                esc(CADENCIAS[p.cada] || p.cada)}</span>
            </label>
          </div>`).join('')}
      </div>`).join('')}`;

  $$('[data-hoje]').forEach((el) => {
    el.onchange = () => {
      const [n, eixo] = el.dataset.hoje.split('|');
      const p = (porEixo[eixo] || [])[Number(n)];
      if (!p) return;
      const alvo = p.eixo === 'veiculo' ? acharVeiculo(p.alvoId)
                 : p.eixo === 'lead' ? acharCliente(p.alvoId) : null;
      marcarRecorrente(p.eixo, p.chave, alvo);
      avisar('Feito. Volta quando vencer.');
      telaHoje();
    };
  });
}
