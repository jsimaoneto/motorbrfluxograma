// Gera js/recorrencia-dados.js a partir de processo-vendas/recorrencia.json, que é a
// fonte da classificação único x recorrente. Rodar sempre que o JSON mudar:
//     node modelos/exportar_recorrencia.js
// Sem isso, o site do fluxograma e o site do manual divergem.
const fs = require('fs');
const path = require('path');

const FONTE = 'D:\\Claude\\manual de emrpesas\\+MOTORBR\\processo-vendas\\recorrencia.json';
const SAIDA = path.join(__dirname, '..', 'js', 'recorrencia-dados.js');

const d = JSON.parse(fs.readFileSync(FONTE, 'utf8'));

// Só o que o navegador precisa: a regra de cada item, sem os comentários do JSON.
const regras = d.recorrentes.map((r) => {
  const o = { fase: r.fase, casa: r.casa, eixo: r.eixo, cada: r.cada };
  if (r.cada_morno) o.cadaMorno = r.cada_morno;
  if (r.ate) o.ate = r.ate;
  if (r.limite) o.limite = r.limite;
  if (r.marcos) o.marcos = r.marcos;
  if (r.so_quando) o.soQuando = r.so_quando;
  if (r.nota) o.nota = r.nota;
  if (r.desdobra) o.desdobra = r.desdobra.map((x) => ({ titulo: x.titulo, cada: x.cada, eixo: x.eixo || r.eixo }));
  return o;
});

const texto = `// GERADO por modelos/exportar_recorrencia.js a partir de
// +MOTORBR/processo-vendas/recorrencia.json. Não edite aqui: edite o JSON e rode o gerador.
// Classificação dos itens do processo que voltam com o tempo.

const CADENCIAS = ${JSON.stringify(d._cadencias, null, 2)};

const EIXOS = ${JSON.stringify(d._eixos, null, 2)};

// A vistoria não tem prazo: é refeita a cada ocasião (test drive, translado, entrega, devolução).
const POR_OCASIAO = ${JSON.stringify(d._por_ocasiao, null, 2)};

const REGRAS_RECORRENCIA = ${JSON.stringify(regras, null, 2)};
`;

fs.writeFileSync(SAIDA, texto, 'utf8');
console.log(`${regras.length} regras -> js/recorrencia-dados.js`);
const semEixo = regras.filter((r) => !r.eixo).map((r) => r.casa);
if (semEixo.length) throw new Error('regra sem eixo: ' + semEixo.join(' | '));
