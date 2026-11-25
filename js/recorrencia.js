// Motor de recorrência do +Motor BR Fluxograma.
// Itens únicos, uma vez marcados, ficam marcados. Itens recorrentes voltam a cobrar
// quando vence o prazo da cadência. As regras vêm de recorrencia-dados.js (gerado da
// fonte única); aqui só mora o cálculo de vencimento e a montagem da caixa "Para hoje".
//
// Onde cada eixo guarda a marcação:
//   veiculo   -> v.concluido[chave] = { data, em }      (já existia; "em" é novo)
//   pessoa    -> DADOS.rotinas[chave] = { em, por }     (global, não depende de veículo)
//   lead      -> c.followUp = { em, contagem }          (no cliente)
//   pos_venda -> v.posVenda[marco] = { em }             (no veículo entregue)

const EXPEDIENTE = { inicio: 8, fim: 18 };

const agoraISO = () => new Date().toISOString();
const eFimDeSemanaData = (d) => d.getDay() === 0 || d.getDay() === 6;

/* ------------------------------------------------------------------ regras */

// A regra de um item, ou null se ele for de uma vez só.
function regraDoItem(nFase, texto) {
  return REGRAS_RECORRENCIA.find((r) => r.fase === String(nFase) && texto.includes(r.casa)) || null;
}

// Um item recorrente que se desdobra vira várias cobranças, cada uma com chave própria.
function cobrancasDoItem(nFase, texto) {
  const r = regraDoItem(nFase, texto);
  if (!r) return [];
  const base = chaveItem(nFase, texto);
  if (!r.desdobra) return [{ chave: base, titulo: texto, cada: r.cada, eixo: r.eixo, regra: r }];
  return r.desdobra.map((d, n) => ({
    chave: `${base}_r${n}`, titulo: d.titulo, cada: d.cada, eixo: d.eixo, regra: r,
  }));
}

/* ------------------------------------------------------------------ a quem cobrar */

// Onde o veículo está hoje decide se a cobrança faz sentido: não adianta pedir para
// ligar um carro que já foi entregue, nem cobrar prazo de fornecedor de um carro parado.
const EM_SERVICO = ['Funilaria e pintura', 'Mecânica e revisão', 'Blindagem',
  'Lavagem e higienização', 'Polimento', 'Vistoria e despachante'];

function cabeNoVeiculo(v, regra) {
  if (localDoV(v) === 'Entregue') return false;
  const quando = regra && regra.soQuando;
  if (quando === 'veículo fora da loja em serviço') {
    return foraDaLoja(v) || EM_SERVICO.includes(localDoV(v));
  }
  if (quando === 'veículo no pátio') return !foraDaLoja(v);
  return !foraDaLoja(v);
}

/* ------------------------------------------------------------------ vencimento */

// Quando a cobrança marcada em "em" vence de novo. Devolve Date.
function proximoVencimento(em, cada) {
  const d = new Date(em);
  if (isNaN(d)) return new Date(0);          // sem data válida: cobra agora

  if (cada === '2h') {
    const p = new Date(d.getTime() + 2 * 3600 * 1000);
    // fora do expediente, empurra para as 8h do próximo dia útil
    if (p.getHours() >= EXPEDIENTE.fim || p.getHours() < EXPEDIENTE.inicio || eFimDeSemanaData(p)) {
      p.setHours(EXPEDIENTE.inicio, 0, 0, 0);
      do { p.setDate(p.getDate() + 1); } while (eFimDeSemanaData(p));
    }
    return p;
  }
  if (cada === 'dia') {
    const p = new Date(d); p.setHours(EXPEDIENTE.inicio, 0, 0, 0);
    do { p.setDate(p.getDate() + 1); } while (eFimDeSemanaData(p));
    return p;
  }
  if (cada === 'sexta' || cada === 'segunda') {
    const alvo = cada === 'sexta' ? 5 : 1;
    const p = new Date(d); p.setHours(EXPEDIENTE.inicio, 0, 0, 0);
    do { p.setDate(p.getDate() + 1); } while (p.getDay() !== alvo);
    return p;
  }
  if (cada === '15d') { const p = new Date(d); p.setDate(p.getDate() + 15); return p; }
  if (cada === 'mes') { const p = new Date(d); p.setMonth(p.getMonth() + 1); return p; }
  return new Date(d.getTime() + 24 * 3600 * 1000);
}

// Já venceu? Sem marcação nenhuma, conta como vencido (nunca foi feito).
function venceu(registro, cada) {
  if (!registro || !registro.em) return true;
  return proximoVencimento(registro.em, cada) <= new Date();
}

// Texto curto do estado: "vence em 40 min", "atrasado desde ontem".
function comoEsta(registro, cada) {
  if (!registro || !registro.em) return { atrasado: true, texto: 'nunca foi feito' };
  const v = proximoVencimento(registro.em, cada);
  const min = Math.round((v - new Date()) / 60000);
  if (min <= 0) {
    const h = Math.round(-min / 60);
    return { atrasado: true, texto: h < 24 ? `atrasado há ${h}h` : `atrasado há ${Math.round(h / 24)}d` };
  }
  if (min < 60) return { atrasado: false, texto: `vence em ${min} min` };
  if (min < 24 * 60) return { atrasado: false, texto: `vence em ${Math.round(min / 60)}h` };
  return { atrasado: false, texto: `vence em ${Math.round(min / 1440)} dias` };
}

/* ------------------------------------------------------------------ marcar */

function marcarRecorrente(eixo, chave, alvo) {
  const reg = { em: agoraISO(), data: hoje() };
  if (eixo === 'pessoa') {
    DADOS.rotinas = DADOS.rotinas || {};
    DADOS.rotinas[chave] = reg;
    salvar();
  } else if (eixo === 'lead' && alvo) {
    alvo.followUp = { em: reg.em, contagem: ((alvo.followUp || {}).contagem || 0) + 1 };
    salvarCliente(alvo);
  } else if (alvo) {
    alvo.concluido[chave] = reg;
    salvarVeiculo(alvo);
  }
}

/* ------------------------------------------------------------------ caixa "Para hoje" */

// Tudo que está vencido agora, dos quatro eixos, numa lista só.
function pendenciasDeHoje() {
  const fila = [];
  const rotinas = DADOS.rotinas || {};

  FASES.forEach((f) => {
    (f.grupos || []).forEach((g) => {
      (g.itens || []).forEach((it) => {
        cobrancasDoItem(f.n, it.i).forEach((c) => {
          if (c.eixo === 'pessoa') {
            if (venceu(rotinas[c.chave], c.cada)) {
              fila.push({ tipo: 'rotina', titulo: c.titulo, quem: it.q, fase: f.n,
                          chave: c.chave, cada: c.cada, eixo: c.eixo,
                          estado: comoEsta(rotinas[c.chave], c.cada) });
            }
          } else if (c.eixo === 'veiculo') {
            DADOS.veiculos.filter((v) => cabeNoVeiculo(v, c.regra)).forEach((v) => {
              if (venceu(v.concluido[c.chave], c.cada)) {
                fila.push({ tipo: 'veiculo', titulo: c.titulo, quem: it.q, fase: f.n,
                            chave: c.chave, cada: c.cada, eixo: c.eixo, alvoId: v.id,
                            alvo: nomeVeiculo(v),
                            estado: comoEsta(v.concluido[c.chave], c.cada) });
              }
            });
          } else if (c.eixo === 'lead') {
            DADOS.clientes.filter((cl) => cl.status === 'lead' || cl.status === 'negociacao').forEach((cl) => {
              const cada = cl.temperatura === 'quente' ? c.cada : (c.regra.cadaMorno || c.cada);
              const reg = cl.followUp;
              if (c.regra.limite && reg && reg.contagem >= c.regra.limite) return;  // 3 contatos e para
              if (venceu(reg, cada)) {
                fila.push({ tipo: 'lead', titulo: c.titulo, quem: it.q, fase: f.n,
                            chave: c.chave, cada, eixo: c.eixo, alvoId: cl.id,
                            alvo: cl.nome || 'Lead sem nome',
                            extra: cl.temperatura,
                            estado: comoEsta(reg, cada) });
              }
            });
          }
        });
      });
    });
  });

  // atrasado primeiro, depois o que vence antes
  fila.sort((a, b) => (b.estado.atrasado - a.estado.atrasado));
  return fila;
}
