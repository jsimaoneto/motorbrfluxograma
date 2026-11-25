// Caixa "Para hoje": junta, numa lista só, tudo que está vencido agora, venha de
// onde vier — o carro que precisa ser ligado no pátio, o lead que pede follow-up e
// a rotina do cargo. O cálculo de vencimento mora em recorrencia.js.
//
// Uma aba por cargo (o checklist de quem vai executar) e a aba Geral, que mostra
// tudo agrupado por cargo, para o gestor acompanhar a casa inteira de uma vez.

const ROTULO_EIXO = {
  subir: 'Subir veículo', veiculo: 'Veículo', lead: 'Lead',
  pessoa: 'Minha rotina', pos_venda: 'Pós-venda',
};

// Pedidos feitos na ficha do veículo ("Subir veículo"). Não têm prazo: valem até
// o Motorista dar baixa, por isso entram sempre como atrasados, no topo da fila.
function pendenciasDeSubida() {
  return pedidosDeSubida().map((v) => ({
    tipo: 'subir', eixo: 'subir', titulo: 'Subir este veículo',
    quem: 'Motorista', cargos: ['motorista'],
    alvoId: v.id, alvo: nomeVeiculo(v), extra: 'está em ' + localDoV(v),
    minuto: new Date(v.subir.em).getHours() * 60 + new Date(v.subir.em).getMinutes(),
    estado: { atrasado: true, texto: 'pedido em ' + quandoBR(v.subir.em) },
  }));
}

// A fila segue o relógio: vale a hora escrita no próprio item ("até 9h30", "das 14h
// às 16h") e, no pedido de subida, a hora em que foi pedido. Item sem hora marcada
// vai para o fim, na ordem que já tinha (atrasado antes do que ainda vai vencer).
const MINUTO_SEM_HORA = 24 * 60;
const horaTxt = (min) => `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, '0') : ''}`;
function minutoDoItem(p) {
  if (p.minuto !== undefined) return p.minuto;
  const m = /(\d{1,2})\s?h(\d{2})?/.exec(p.titulo);
  return m && Number(m[1]) < 24 ? Number(m[1]) * 60 + Number(m[2] || 0) : MINUTO_SEM_HORA;
}

let cargoHoje = '';   // '' = Geral
function filtrarHoje(id) { cargoHoje = id; telaHoje(); }

function telaHoje() {
  // os cargos saem do responsável do item, pela mesma regra do fluxograma
  const todas = pendenciasDeSubida().concat(
    pendenciasDeHoje().map((p) => Object.assign({}, p, { cargos: cargosDoItem({ q: p.quem }) })))
    .sort((a, b) => minutoDoItem(a) - minutoDoItem(b));
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

  // Na aba de um cargo é uma lista só, na ordem do relógio: é o roteiro do dia dele.
  // No Geral agrupa por cargo (a visão do gestor), cada um na mesma ordem de horário.
  const grupos = {};
  const poe = (chave, p) => (grupos[chave] = grupos[chave] || []).push(p);
  fila.forEach((p) => {
    if (cargoHoje) return poe('O dia, na ordem', p);
    if (!p.cargos.length) return poe('Sem cargo definido', p);
    p.cargos.forEach((id) => poe((acharCargo(id) || {}).nome || id, p));
  });

  $('#pagina').innerHTML = abas + `
    <p class="aviso-topo">Em ordem de horário, do começo do dia para o fim. Marque conforme for
       fazendo: o item some da lista e volta sozinho quando vencer de novo
       (${esc(Object.values(CADENCIAS).join(' · '))}).</p>
    ${Object.entries(grupos).map(([titulo, itens], gi) => `
      <div class="cartao" style="margin-bottom:14px">
        <div class="sub-grupo">${esc(titulo)} · ${itens.length}</div>
        ${itens.map((p, n) => `
          <div class="item-ck ${p.estado.atrasado ? 'atrasado' : ''}">
            <input type="checkbox" data-hoje="${gi}|${n}">
            <label class="txt">${esc(p.titulo)}
              <span class="quem">${minutoDoItem(p) < MINUTO_SEM_HORA
                ? '<b class="hora">' + horaTxt(minutoDoItem(p)) + '</b> · ' : ''}${
                esc(p.quem)}${p.fase ? ' · fase ' + esc(p.fase) : ''}${
                p.alvo ? ' · <b>' + esc(p.alvo) + '</b>' : ''}${
                p.extra ? ' · ' + esc(p.extra) : ''} · ${esc(ROTULO_EIXO[p.eixo] || p.eixo)}</span>
              <span class="marca-em ${p.estado.atrasado ? 'ruim' : ''}">${esc(p.estado.texto)}${
                p.cada ? ' · ' + esc(CADENCIAS[p.cada] || p.cada) : ' · até o Motorista dar baixa'}</span>
            </label>
          </div>`).join('')}
      </div>`).join('')}`;

  const listas = Object.values(grupos);
  $$('[data-hoje]').forEach((el) => {
    el.onchange = () => {
      const [gi, n] = el.dataset.hoje.split('|');
      const p = (listas[Number(gi)] || [])[Number(n)];
      if (!p) return;
      if (p.eixo === 'subir') return pedirSubir(p.alvoId, false);   // desenhar() redesenha a tela
      const alvo = p.eixo === 'veiculo' ? acharVeiculo(p.alvoId)
                 : p.eixo === 'lead' ? acharCliente(p.alvoId) : null;
      marcarRecorrente(p.eixo, p.chave, alvo);
      avisar('Feito. Volta quando vencer.');
      telaHoje();
    };
  });
}
