// Agenda do +Motor BR Fluxograma: feriados nacionais e de São Paulo, datas comerciais do setor
// e aniversários dos clientes. Os feriados móveis são calculados a partir da Páscoa, para qualquer ano.

// Páscoa pelo algoritmo de Meeus/Jones/Butcher
function pascoa(ano) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const somaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// Segundo domingo de maio, segundo domingo de agosto, etc.
function enesimoDiaSemana(ano, mes, diaSemana, n) {
  const d = new Date(ano, mes - 1, 1);
  let conta = 0;
  while (d.getMonth() === mes - 1) {
    if (d.getDay() === diaSemana) { conta++; if (conta === n) return new Date(d); }
    d.setDate(d.getDate() + 1);
  }
  return null;
}

function feriadosDoAno(ano) {
  const p = pascoa(ano);
  const lista = [
    { data: `${ano}-01-01`, nome: 'Confraternização Universal', tipo: 'feriado' },
    { data: `${ano}-01-25`, nome: 'Aniversário de São Paulo', tipo: 'feriado', obs: 'Municipal' },
    { data: iso(somaDias(p, -48)), nome: 'Carnaval (segunda)', tipo: 'feriado', obs: 'Ponto facultativo' },
    { data: iso(somaDias(p, -47)), nome: 'Carnaval (terça)', tipo: 'feriado' },
    { data: iso(somaDias(p, -46)), nome: 'Quarta-feira de Cinzas', tipo: 'feriado', obs: 'Expediente a partir das 12h' },
    { data: iso(somaDias(p, -2)), nome: 'Sexta-feira Santa', tipo: 'feriado' },
    { data: iso(p), nome: 'Páscoa', tipo: 'comemorativa' },
    { data: `${ano}-04-21`, nome: 'Tiradentes', tipo: 'feriado' },
    { data: `${ano}-05-01`, nome: 'Dia do Trabalho', tipo: 'feriado' },
    { data: iso(somaDias(p, 60)), nome: 'Corpus Christi', tipo: 'feriado', obs: 'Ponto facultativo' },
    { data: `${ano}-07-09`, nome: 'Revolução Constitucionalista', tipo: 'feriado', obs: 'Estadual (SP)' },
    { data: `${ano}-09-07`, nome: 'Independência do Brasil', tipo: 'feriado' },
    { data: `${ano}-10-12`, nome: 'Nossa Senhora Aparecida', tipo: 'feriado' },
    { data: `${ano}-11-02`, nome: 'Finados', tipo: 'feriado' },
    { data: `${ano}-11-15`, nome: 'Proclamação da República', tipo: 'feriado' },
    { data: `${ano}-11-20`, nome: 'Consciência Negra', tipo: 'feriado', obs: 'Nacional desde 2024' },
    { data: `${ano}-12-25`, nome: 'Natal', tipo: 'feriado' },
  ];
  // datas comemorativas e comerciais que mexem na pauta da loja
  const maes = enesimoDiaSemana(ano, 5, 0, 2);
  const pais = enesimoDiaSemana(ano, 8, 0, 2);
  const blackFriday = (() => {
    const d = new Date(ano, 10, 30);
    while (d.getDay() !== 5) d.setDate(d.getDate() - 1);
    return d;
  })();
  lista.push(
    { data: `${ano}-03-08`, nome: 'Dia Internacional da Mulher', tipo: 'comemorativa' },
    { data: iso(maes), nome: 'Dia das Mães', tipo: 'comercial', obs: 'Pauta: carro para a família' },
    { data: `${ano}-06-12`, nome: 'Dia dos Namorados', tipo: 'comemorativa' },
    { data: iso(pais), nome: 'Dia dos Pais', tipo: 'comercial', obs: 'Pauta: primeiro carro, presente' },
    { data: `${ano}-09-15`, nome: 'Dia do Cliente', tipo: 'comercial', obs: 'Pauta: agradecer e pedir indicação' },
    { data: `${ano}-10-12`, nome: 'Dia das Crianças', tipo: 'comemorativa' },
    { data: iso(blackFriday), nome: 'Black Friday', tipo: 'comercial', obs: 'Só com condição real, aprovada pelo CEO' },
    { data: `${ano}-12-31`, nome: 'Virada do ano', tipo: 'comemorativa' },
  );
  // janelas comerciais do Guia de Comunicação
  lista.push(
    { data: `${ano}-01-10`, nome: 'Temporada de IPVA e licenciamento', tipo: 'janela', obs: 'Reforçar procedência e documentação em dia (jan a mar)' },
    { data: `${ano}-07-01`, nome: 'Férias de julho', tipo: 'janela', obs: 'Pauta: SUVs, porta-malas, revisão antes da estrada' },
    { data: `${ano}-12-01`, nome: '13º salário', tipo: 'janela', obs: 'Pauta: entrada e parcela' },
  );
  return lista.sort((a, b) => a.data.localeCompare(b.data));
}

// Aniversários dos clientes no ano pedido
function aniversarios(clientes, ano) {
  return clientes.filter((c) => c.nascimento).map((c) => {
    const [, m, d] = c.nascimento.split('-');
    return {
      data: `${ano}-${m}-${d}`, nome: `Aniversário de ${c.nome || 'cliente'}`,
      tipo: 'aniversario', clienteId: c.id,
      obs: c.telefone ? `Telefone: ${c.telefone}` : '',
    };
  });
}

// Tudo o que aparece no calendário de um ano: feriados + aniversários + compromissos lançados
function calendarioDoAno(ano, clientes, eventos) {
  return [...feriadosDoAno(ano), ...aniversarios(clientes, ano), ...eventos.filter((e) => (e.data || '').startsWith(String(ano)))]
    .sort((a, b) => a.data.localeCompare(b.data));
}

const TIPOS_EVENTO = {
  feriado: { rotulo: 'Feriado', cor: '#8E8E93' },
  comemorativa: { rotulo: 'Data comemorativa', cor: '#C77DBB' },
  comercial: { rotulo: 'Data comercial', cor: '#D4A017' },
  janela: { rotulo: 'Janela de pauta', cor: '#7B9A6D' },
  aniversario: { rotulo: 'Aniversário de cliente', cor: '#E0533D' },
  fase: { rotulo: 'Etapa do processo', cor: '#FF5A00' },
  visita: { rotulo: 'Visita agendada', cor: '#2E6FB7' },
  entrega: { rotulo: 'Entrega', cor: '#2E7D5B' },
  posvenda: { rotulo: 'Pós-venda', cor: '#5B6ABF' },
  outro: { rotulo: 'Compromisso', cor: '#555' },
};

// Próxima terça-feira depois de uma data: o pós-venda da casa
function proximaTerca(isoData) {
  const d = new Date(isoData + 'T00:00:00');
  do { d.setDate(d.getDate() + 1); } while (d.getDay() !== 2);
  return iso(d);
}

function ehFimDeSemana(isoData) {
  const d = new Date(isoData + 'T00:00:00').getDay();
  return d === 0 || d === 6;
}
