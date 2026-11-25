// GERADO por modelos/exportar_recorrencia.js a partir de
// +MOTORBR/processo-vendas/recorrencia.json. Não edite aqui: edite o JSON e rode o gerador.
// Classificação dos itens do processo que voltam com o tempo.

const CADENCIAS = {
  "2h": "de 2 em 2 horas, só em dia útil das 8h às 18h",
  "dia": "uma vez por dia útil",
  "sexta": "toda sexta-feira",
  "segunda": "toda segunda-feira",
  "15d": "a cada 15 dias",
  "mes": "uma vez por mês",
  "marcos": "em datas fixas contadas da entrega"
};

const EIXOS = {
  "veiculo": "repete enquanto aquele veículo está no pátio; para quando sai da loja ou é entregue",
  "lead": "repete enquanto aquela negociação está aberta; para quando fecha ou é marcada como perdida",
  "pessoa": "rotina do cargo, não depende de veículo nem de cliente; repete sempre",
  "pos_venda": "disparado pela entrega, em marcos fixos; some depois do último marco"
};

// A vistoria não tem prazo: é refeita a cada ocasião (test drive, translado, entrega, devolução).
const POR_OCASIAO = [
  {
    "o_que": "Checklist de vistoria do veículo (78 itens)",
    "onde": "site do fluxograma, aba Vistoria da ficha do veículo",
    "gatilhos": [
      "antes do test drive",
      "antes do translado",
      "antes da entrega ao cliente",
      "na devolução"
    ],
    "nota": "não entra na caixa Para hoje por prazo: é o evento que chama a folha, não o relógio"
  },
  {
    "o_que": "Checklist de recebimento do veículo (40 itens)",
    "onde": "site do fluxograma, aba Recebimento da ficha",
    "gatilhos": [
      "chegada do veículo comprado"
    ],
    "tipo": "unico",
    "nota": "avaliação técnica de compra: acontece uma vez, na entrada"
  }
];

const REGRAS_RECORRENCIA = [
  {
    "fase": "3",
    "casa": "Acompanhar o prazo do serviço com o fornecedor",
    "eixo": "veiculo",
    "cada": "dia",
    "ate": "o veículo voltar para a loja",
    "soQuando": "veículo fora da loja em serviço",
    "nota": "cobra todo dia enquanto o carro está na funilaria, mecânica ou estética"
  },
  {
    "fase": "5",
    "casa": "Veículos ligados e verificados",
    "eixo": "veiculo",
    "cada": "dia",
    "ate": "o veículo ser entregue",
    "soQuando": "veículo no pátio",
    "nota": "o item original junta três cadências numa frase só; aqui vira três cobranças separadas",
    "desdobra": [
      {
        "titulo": "Ligar o veículo e verificar",
        "cada": "dia",
        "eixo": "veiculo"
      },
      {
        "titulo": "Verificação completa do veículo",
        "cada": "sexta",
        "eixo": "veiculo"
      },
      {
        "titulo": "Relatório e estratégia dos veículos parados",
        "cada": "15d",
        "eixo": "pessoa"
      }
    ]
  },
  {
    "fase": "5",
    "casa": "Toda segunda: necessidades de gravação",
    "eixo": "pessoa",
    "cada": "segunda",
    "ate": "sempre"
  },
  {
    "fase": "5",
    "casa": "Na véspera: avisar o Motorista quais veículos subir",
    "eixo": "pessoa",
    "cada": "dia",
    "ate": "sempre"
  },
  {
    "fase": "5",
    "casa": "Gravar das 9h30 às 11h30",
    "eixo": "pessoa",
    "cada": "dia",
    "ate": "sempre"
  },
  {
    "fase": "5",
    "casa": "A partir das 11h30: edição, programação",
    "eixo": "pessoa",
    "cada": "dia",
    "ate": "sempre"
  },
  {
    "fase": "6",
    "casa": "Follow-up: 3 contatos em 7 dias",
    "eixo": "lead",
    "cada": "dia",
    "ate": "o lead virar atendimento ou ser marcado como perdido",
    "limite": 3,
    "nota": "o processo manda 3 contatos em 7 dias; depois do terceiro, o lead vai para perdido com o motivo"
  },
  {
    "fase": "7",
    "casa": "Registrar o atendimento no CRM e enviar o reporte diário",
    "eixo": "pessoa",
    "cada": "dia",
    "ate": "sempre"
  },
  {
    "fase": "7",
    "casa": "Follow-up ativo dos clientes em negociação",
    "eixo": "lead",
    "cada": "2h",
    "cadaMorno": "dia",
    "ate": "a venda fechar ou a negociação ser encerrada",
    "nota": "de 2 em 2 horas só enquanto o lead está quente e dentro do expediente; morno e frio cobram uma vez por dia"
  },
  {
    "fase": "8",
    "casa": "Negociação parada vai à mesa redonda da tarde",
    "eixo": "pessoa",
    "cada": "dia",
    "ate": "sempre"
  },
  {
    "fase": "13",
    "casa": "Ligação de pós-venda na terça-feira seguinte",
    "eixo": "pos_venda",
    "cada": "marcos",
    "marcos": [
      "primeira terça depois da entrega"
    ]
  },
  {
    "fase": "13",
    "casa": "Contatos de 1, 2 e 3 meses e de 1 ano",
    "eixo": "pos_venda",
    "cada": "marcos",
    "marcos": [
      "30 dias",
      "60 dias",
      "90 dias",
      "365 dias"
    ]
  },
  {
    "fase": "13",
    "casa": "Confirmar que a transferência foi concluída no prazo",
    "eixo": "pos_venda",
    "cada": "marcos",
    "marcos": [
      "30 dias"
    ],
    "nota": "prazo legal de transferência (CTB, art. 134)"
  },
  {
    "fase": "13",
    "casa": "NPS, avaliação online e pedido de indicação",
    "eixo": "pos_venda",
    "cada": "marcos",
    "marcos": [
      "7 dias"
    ]
  },
  {
    "fase": "13",
    "casa": "Indicadores do processo no relatório mensal",
    "eixo": "pessoa",
    "cada": "mes",
    "ate": "sempre"
  }
];
