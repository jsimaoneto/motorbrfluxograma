// As 13 fases do Manual Guia do Processo de Vendas da +Motor BR.
// Origem de cada item: T todos · U usado comprado para estoque (inclui o da troca) · C consignado · Z zero km
// Fonte: ENTREGAS/5-Processo-de-Vendas/Manual_Guia_Processo_de_Vendas_MotorBR.pdf

const ORIGENS = {
  U: { nome: 'Usado', desc: 'Comprado para o estoque (inclui o recebido na troca)', cor: 'u' },
  C: { nome: 'Consignado', desc: 'Veículo de terceiro, em contrato estimatório', cor: 'c' },
  Z: { nome: 'Zero km', desc: 'Veículo novo', cor: 'z' },
};

const FASES = [
  {
    n: 1, t: 'Entrada do veículo no estoque', jornada: 'veiculo',
    obj: 'Comprar, captar ou receber só veículos com procedência comprovada, documentação regular e condições claras.',
    gatilho: 'Oferta de um veículo (compra, troca ou consignação) ou chegada de um zero km',
    dono: 'Consultor de Vendas e Assistente de Consignação',
    prazo: 'Consulta de procedência antes de qualquer proposta',
    passa: 'Procedência conferida, documentação regular, veículo no CRM e, se consignado, contrato estimatório assinado.',
    grupos: [
      { t: 'Usado comprado para estoque (inclui o usado recebido na troca)', itens: [
        { i: 'Avaliar o veículo com o checklist de recebimento: lataria, vidros, pneus, interior, painel, test drive técnico e leitura de falhas (scanner)', q: 'Consultor / CEO', o: 'U' },
        { i: 'Consultar a procedência antes da proposta: IPVA, licenciamento, multas, restrições (judicial, administrativa, roubo e furto), gravame, leilão, sinistro e recall; laudo cautelar', q: 'Ger. Administrativo', o: 'U' },
        { i: 'Avaliação de entrada — precificar: referência de mercado, custo estimado de preparação e margem; proposta acima da alçada vai ao CEO', q: 'Consultor / CEO', o: 'U' },
        { i: 'Identificar o vendedor e a origem dos recursos; pagamento por terceiro, fracionado ou em espécie acima de R$ 30.000 vai à Diretoria (COAF)', q: 'Ger. Administrativo', o: 'U' },
        { i: 'Pagar o vendedor só depois da conferência documental; havendo financiamento, quitar o gravame direto com o banco', q: 'Ger. Administrativo', o: 'U' },
        { i: 'ATPV-e assinada pelo vendedor em favor da loja e entrada do veículo no Renave (Detran-SP)', q: 'Ger. Administrativo', o: 'U' },
        { i: 'Troca: valor da avaliação registrado na proposta da venda e no CRM', q: 'Consultor', o: 'U' },
      ]},
      { t: 'Consignado', itens: [
        { i: 'Registrar no CRM o contato do proprietário e a origem da captação (indicação, redes, plataformas)', q: 'Consignação', o: 'C' },
        { i: 'Avaliar condição, histórico e documentação; recusar com clareza veículo sem procedência ou regularidade comprovada', q: 'Consignação / Consultor / CEO', o: 'C' },
        { i: 'Combinar por escrito: valor mínimo de repasse, comissão, prazo, quem paga preparação, IPVA, multas e seguro durante a consignação', q: 'Consultor / Ger. Administrativo', o: 'C' },
        { i: 'Assinar o contrato estimatório (Código Civil, arts. 534 a 537) antes de expor ou anunciar; registrar a consignação no Renave quando exigido', q: 'Ger. Administrativo / CEO', o: 'C' },
        { i: 'Pedir autorização por escrito do proprietário para cada serviço de preparação com custo', q: 'Consultor', o: 'C' },
        { i: 'Nenhum documento de transferência assinado em branco: o proprietário assina a autorização só na venda', q: 'Ger. Administrativo', o: 'C' },
      ]},
      { t: 'Zero km', itens: [
        { i: 'Definir a forma da operação e informar o cliente: faturamento pela concessionária ou fábrica em nome do cliente (ele é o primeiro dono) ou veículo já registrado em nome da loja', q: 'CEO / Consultor', o: 'Z' },
        { i: 'Conferir nota fiscal de origem, ano de fabricação e ano modelo, chave reserva, manual e termo de garantia de fábrica', q: 'Financiamento e Doc.', o: 'Z' },
        { i: 'Vistoriar a chegada (avarias de transporte) com fotos e rodar só o necessário', q: 'Motorista / Consultor', o: 'Z' },
        { i: 'Acessórios só homologados pela fábrica, para não perder a garantia', q: 'Consultor / Motorista', o: 'Z' },
      ]},
      { t: 'Para todos os veículos', itens: [
        { i: 'Fotos de entrada: veículo por fora, detalhes (defeitos, marcas, acessórios, pneus), interior e painel com km e combustível', q: 'Motorista / Consultor', o: 'T' },
        { i: 'Cadastrar no CRM: ficha técnica completa (ano, versão, km, câmbio, opcionais, chaves), fotos, origem e data de entrada, que conta o tempo de estoque', q: 'Consultor', o: 'T' },
        { i: 'Abrir o prontuário do veículo: o digital é responsabilidade do Consultor de Vendas e o físico, do Gerente Administrativo (acesso restrito)', q: 'Consultor / Ger. Administrativo', o: 'T' },
        { i: 'Avisar o Consultor e o Social Media das novas entradas (captações consignadas: semanal)', q: 'Consultor / Pré-Vendas', o: 'T' },
      ]},
    ],
  },
  {
    n: 2, t: 'Diagnóstico e orçamento de preparação', jornada: 'veiculo',
    obj: 'Descobrir de uma vez tudo o que o veículo precisa e aprovar antes de mexer.',
    gatilho: 'Veículo aprovado na entrada', dono: 'Consultor de Vendas',
    prazo: 'Diagnóstico completo no mesmo dia da entrada (sugestão)',
    passa: 'Ordem de serviço aprovada, com fornecedor, prazo e custo. Item de segurança reprovado (freio, pneu, direção, suspensão, iluminação) impede o anúncio.',
    grupos: [
      { t: 'Diagnóstico', itens: [
        { i: 'Aplicar o Checklist 1 de Preparação (mecânica, freios, suspensão, pneus, elétrica, estética e documentação), marcando C, R ou NA', q: 'Consultor / CEO', o: 'T' },
        { i: 'Listar os serviços: funilaria e pintura, martelinho, mecânica, revisão, pneus, elétrica, ar-condicionado, vidros, polimento, higienização, ozonização e, se for o caso, blindagem', q: 'Consultor', o: 'T' },
        { i: 'Recall pendente agendado na rede autorizada', q: 'Consultor', o: 'T' },
      ]},
      { t: 'Orçamento e aprovação', itens: [
        { i: 'Orçar cada serviço com prazo: o Motorista orça e o CEO aprova; para serviço relevante, comparar mais de um fornecedor', q: 'Motorista / CEO', o: 'T' },
        { i: 'Aprovar dentro da alçada definida pela Diretoria; acima dela, o CEO decide', q: 'CEO', o: 'U' },
        { i: 'Consignado: proprietário aprova por escrito os serviços e o custo', q: 'Consultor', o: 'C' },
        { i: 'Lançar o custo de preparação no custo do veículo, depois do lançamento dos custos pelo Motorista', q: 'Motorista / Ger. Administrativo', o: 'T' },
        { i: 'Se o custo previsto não compensar, o CEO decide entre preparar, vender no estado informado ou repassar', q: 'CEO', o: 'U' },
      ]},
    ],
  },
  {
    n: 3, t: 'Translado do veículo', jornada: 'veiculo', repetivel: true,
    obj: 'Levar e buscar o veículo para oficina, funilaria, estética, higienização, blindagem, despachante, vistoria, rede autorizada ou cliente, com registro do começo ao fim.',
    gatilho: 'Toda saída do veículo da loja, por qualquer finalidade', dono: 'Motorista',
    prazo: 'Atraso avisado antes do horário, não depois',
    passa: 'Veículo de volta, com fotos de saída e chegada e serviço conferido.',
    grupos: [
      { t: 'Antes de sair', itens: [
        { i: 'Solicitação registrada: destino, serviço, prazo e quem recebe no destino', q: 'Quem pediu o translado / Motorista', o: 'T' },
        { i: 'CNH válida, documento do veículo e licenciamento em mãos; rota e rodízio conferidos', q: 'Motorista', o: 'T' },
        { i: 'Fotos do veículo por fora, dos detalhes que mereçam destaque (defeitos, alterações, marcas, estado externo, acessórios e pneus), do interior e do painel com km e combustível', q: 'Motorista', o: 'T' },
        { i: 'Documentos transportados em envelope fechado, nunca à vista', q: 'Motorista', o: 'T' },
      ]},
      { t: 'Durante', itens: [
        { i: 'Localização em tempo real no grupo do Motorista com os Consultores de Vendas e o CEO, da saída até a chegada', q: 'Motorista', o: 'T' },
        { i: 'Celular só com o carro parado; ocorrência comunicada na hora', q: 'Motorista', o: 'T' },
      ]},
      { t: 'No destino e na volta', itens: [
        { i: 'Deixar o veículo com protocolo: serviço pedido, km, combustível e objetos no carro', q: 'Motorista', o: 'T' },
        { i: 'Acompanhar o prazo do serviço com o fornecedor e avisar atraso', q: 'Motorista', o: 'T' },
        { i: 'Na retirada: conferir o serviço executado contra a ordem de serviço e refazer as fotos', q: 'Motorista / Consultor', o: 'T' },
        { i: 'Registrar o deslocamento (de onde, para onde, horário); multa ou avaria comunicadas', q: 'Motorista', o: 'T' },
      ]},
    ],
  },
  {
    n: 4, t: 'Preparação e liberação para venda', jornada: 'veiculo',
    obj: 'Deixar o veículo pronto, seguro e apresentável, com histórico do que foi feito.',
    gatilho: 'Ordem de serviço aprovada', dono: 'Consultor de Vendas',
    prazo: 'Meta sugerida: 3 a 7 dias da entrada até a vitrine (referência de mercado)',
    passa: 'Parecer "Liberado para venda" assinado e preço de anúncio aprovado.',
    grupos: [
      { t: 'Serviços', itens: [
        { i: 'Mecânica e revisão conforme a ordem de serviço; peças trocadas registradas no prontuário', q: 'Consultor', o: 'T' },
        { i: 'Funilaria e pintura conferidas: tonalidade, frestas e acabamento', q: 'Consultor / CEO', o: 'T' },
        { i: 'Blindagem, quando houver: empresa autorizada pelo Exército, Certificado de Segurança Veicular (CSV) e CRLV-e atualizado com a observação de veículo blindado; documentação guardada para o comprador', q: 'Ger. Administrativo / CEO', o: 'T' },
        { i: 'Higienização e estética final (na loja ou em estética externa)', q: 'Motorista', o: 'T' },
      ]},
      { t: 'Liberação', itens: [
        { i: 'Refazer o Checklist 1 de Preparação e dar o parecer: liberado, liberado com ressalvas ou reprovado; gestor assina', q: 'Motorista', o: 'T' },
        { i: 'Defeito que permanece é registrado e será mostrado ao cliente e informado no anúncio', q: 'Consultor', o: 'T' },
        { i: 'Ficha técnica do CRM atualizada: é a fonte do Social Media, do SDR e do anúncio', q: 'Consultor', o: 'T' },
      ]},
    ],
  },
  {
    n: 5, t: 'Vitrine: anúncio, mídia e conteúdo', jornada: 'veiculo',
    obj: 'Mostrar o veículo como ele é, em todos os canais, e transformar o estoque em conversa.',
    gatilho: 'Veículo liberado para venda', dono: 'Social Media e Gerente de Marketing',
    prazo: 'Anúncio no ar no dia da liberação (sugestão); vendido sai dos anúncios no mesmo dia',
    passa: 'Veículo anunciado em todos os canais e com conteúdo na pauta da semana.',
    grupos: [
      { t: 'Anúncio', itens: [
        { i: 'Preço e condição de anúncio aprovados pelo CEO; o que é anunciado obriga a loja (CDC, art. 30)', q: 'CEO', o: 'T' },
        { i: 'Fotos de anúncio: frente, traseira, laterais, diagonais, interior, painel, porta-malas e detalhes; placa decorativa ou borrada', q: 'Social Media / Fotógrafo', o: 'T' },
        { i: 'Publicar no site, nos portais (OLX Autos, Webmotors), no Google Meu Negócio e no Instagram, com os dados do CRM', q: 'Fotógrafo / Ger. Marketing / Social Media', o: 'T' },
        { i: 'Consignado: divulgação conforme o contrato; dados do proprietário nunca aparecem', q: 'Social Media', o: 'C' },
        { i: 'Veículos ligados e verificados (rotina diária do pátio e verificação completa às sextas); a cada 15 dias, relatório e estratégia para os parados há mais tempo', q: 'Motorista', o: 'T' },
      ]},
      { t: 'Produção de vídeos', itens: [
        { i: 'Toda segunda: necessidades de gravação e veículos por tempo de estoque, do mais antigo para o mais novo; mais material para os 4 mais antigos e para os recém-chegados', q: 'Social Media', o: 'T' },
        { i: 'Na véspera: avisar o Motorista quais veículos subir; até 9h30 o veículo está na área de gravação, preparado', q: 'Social Media / Motorista / Serviços Gerais', o: 'T' },
        { i: 'Gravar das 9h30 às 11h30 (meta de cerca de 10 vídeos em 20 minutos) os tipos de vídeo: 1 consultor apresentando, 2 close com música, 3 curiosidades com voz em off, 4 institucional, 5 histórias da vida profissional', q: 'Social Media / Consultor / CEO', o: 'T' },
        { i: 'A partir das 11h30: edição, programação, roteiros; material bruto guardado para vídeos futuros e reciclados', q: 'Social Media', o: 'T' },
        { i: 'Checklist de 10 itens e semáforo: verde publica; amarelo (preço, parcela, cliente identificado) a Gerência aprova em até 4 h úteis; vermelho (promoção, feirão, parceria) o CEO aprova em até 24 h', q: 'Social Media', o: 'T' },
        { i: 'Dúvida sobre o veículo: CRM e site, depois Consultor, por último CEO', q: 'Social Media', o: 'T' },
      ]},
    ],
  },
  {
    n: 6, t: 'Lead e pré-venda', jornada: 'cliente',
    obj: 'Responder rápido, entender quem é o cliente e entregar ao consultor uma visita que acontece.',
    gatilho: 'Contato do cliente por WhatsApp, Instagram, telefone, portais, site ou indicação',
    dono: 'Pré-Vendas (SDR)', prazo: 'Primeira resposta em menos de 5 minutos no horário de atendimento',
    passa: 'Visita agendada e confirmada, com qualificação, perfil e pré-análise registrados.',
    grupos: [
      { t: 'Primeiro contato', itens: [
        { i: 'Comentário ou direct com pergunta comercial: o Social Media passa ao SDR na hora, com print', q: 'Social Media / Pré-Vendas', o: 'T' },
        { i: 'Responder em até 5 minutos com o nome, o carro de interesse e uma pergunta', q: 'Pré-Vendas', o: 'T' },
        { i: 'Conferir no CRM e nos sites de anúncio as informações do veículo antes de responder; áudios ouvidos com fone de ouvido', q: 'Pré-Vendas', o: 'T' },
        { i: 'Registrar a origem do lead no CRM', q: 'Pré-Vendas', o: 'T' },
      ]},
      { t: 'Qualificação', itens: [
        { i: 'As 5 perguntas: para quem é o carro, qual o uso, quanto cabe no mês, se há carro na troca e quando quer decidir', q: 'Pré-Vendas', o: 'T' },
        { i: 'Perfil do cliente: tipo de veículo de que mais gosta, faixa de valor e cores preferidas', q: 'Pré-Vendas', o: 'T' },
        { i: 'Classificar: quente (agendar), morno (follow-up) ou frio (nutrir)', q: 'Pré-Vendas', o: 'T' },
        { i: 'Pré-análise de financiamento sem prometer aprovação, pedindo só os dados necessários pelo canal oficial', q: 'Pré-Vendas', o: 'T' },
      ]},
      { t: 'Agendamento e passagem', itens: [
        { i: 'Agendar com dia, hora, consultor e veículo separado', q: 'Pré-Vendas', o: 'T' },
        { i: 'Confirmar na véspera; faltou, reagendar em até 24 horas', q: 'Pré-Vendas', o: 'T' },
        { i: 'Follow-up: 3 contatos em 7 dias; lead perdido com o motivo registrado; parar na hora se a pessoa pedir', q: 'Pré-Vendas', o: 'T' },
        { i: 'Passar ao consultor com todo o contexto no CRM, para o cliente não repetir a história', q: 'Pré-Vendas', o: 'T' },
      ]},
    ],
  },
  {
    n: 7, t: 'Recepção e atendimento consultivo', jornada: 'cliente',
    obj: 'Receber bem e entender a necessidade antes de mostrar o carro.',
    gatilho: 'Cliente chega à loja (agendado ou não) ou faz contato direto com o consultor',
    dono: 'Consultor de Vendas', prazo: 'Registro no CRM no mesmo dia',
    passa: 'Cliente com interesse real em um veículo e condições a negociar.',
    grupos: [
      { t: 'Chegada', itens: [
        { i: 'Acolher em 4 passos: olhar e cumprimentar, perguntar o nome, entender a necessidade, oferecer água ou café', q: 'Consultor', o: 'T' },
        { i: 'Perguntar e registrar "como você conheceu a +Motor BR?"; anunciar o cliente ao consultor', q: 'Consultor', o: 'T' },
        { i: 'Veículo do agendamento separado, limpo e ligado', q: 'Motorista', o: 'T' },
      ]},
      { t: 'Atendimento', itens: [
        { i: 'Diagnóstico: uso, quem dirige, orçamento, troca e prazo, antes de apresentar', q: 'Consultor', o: 'T' },
        { i: 'Apresentação em 6 pontos (frente, lateral, traseira, interior, motor, porta-malas) com dados do sistema e defeitos mostrados', q: 'Consultor', o: 'T' },
        { i: 'Zero km: informar ano de fabricação e ano modelo e quem será o primeiro dono', q: 'Consultor', o: 'Z' },
        { i: 'Test drive: CNH conferida, rota padrão e consultor no banco do passageiro', q: 'Consultor', o: 'T' },
        { i: 'Usado na troca: avaliação pelo roteiro da Fase 1', q: 'Consultor', o: 'U' },
      ]},
      { t: 'Contato com o cliente', itens: [
        { i: 'Registrar o atendimento no CRM e enviar o reporte diário ao CEO', q: 'Consultor', o: 'T' },
        { i: 'Follow-up ativo dos clientes em negociação; na mesa redonda, ligação ou videochamada quando ajudar', q: 'Consultor', o: 'T' },
      ]},
    ],
  },
  {
    n: 8, t: 'Negociação, proposta e financiamento', jornada: 'cliente',
    obj: 'Fechar com firmeza e respeito, prometendo só o que a loja cumpre.',
    gatilho: 'Cliente pede proposta ou condição', dono: 'Consultor de Vendas e Analista de Financiamento',
    prazo: 'Proposta final por escrito antes de qualquer pagamento',
    passa: 'Proposta aceita por escrito, pagamento definido e, se financiado, crédito aprovado.',
    grupos: [
      { t: 'Proposta', itens: [
        { i: 'Negociar dentro da faixa de desconto definida pela Diretoria; acima dela, o CEO aprova', q: 'Consultor / CEO', o: 'T' },
        { i: 'Negociação parada vai à mesa redonda da tarde com CEO, gerências, Pré-Vendas e Financiamento', q: 'Consultor', o: 'T' },
        { i: 'Seguro e acessórios: identificar a oportunidade e encaminhar à profissional responsável', q: 'Consultor', o: 'T' },
        { i: 'Consignado: preço abaixo do mínimo só com aceite do proprietário', q: 'Consultor / CEO', o: 'C' },
        { i: 'Proposta final por escrito: preço, entrada, valor da troca, financiamento, serviços combinados, prazo de entrega e estado do veículo com ressalvas', q: 'Consultor', o: 'T' },
      ]},
      { t: 'Financiamento', itens: [
        { i: 'Simular financiamento, consórcio ou leasing com taxa e custo efetivo total claros', q: 'Consultor / Pré-Vendas', o: 'T' },
        { i: 'Conferir documentos do cliente e do veículo, enviar ao banco e acompanhar até a aprovação; nunca prometer aprovação', q: 'Consultor / Pré-Vendas', o: 'T' },
      ]},
      { t: 'Pagamento e cuidados', itens: [
        { i: 'Identificar o comprador; espécie acima de R$ 30.000, terceiros ou fracionamento vão à Diretoria (COAF)', q: 'Ger. Administrativo / CEO', o: 'T' },
        { i: 'Sinal ou reserva só com recibo e condições por escrito', q: 'Consultor / Ger. Administrativo', o: 'T' },
        { i: 'Fechamento por telefone ou WhatsApp: direito de arrependimento em 7 dias (CDC, art. 49) e contrato por escrito', q: 'Consultor', o: 'T' },
        { i: 'Venda registrada no CRM com as condições negociadas', q: 'Consultor', o: 'T' },
      ]},
    ],
  },
  {
    n: 9, t: 'Documentação e pagamento', jornada: 'cliente',
    obj: 'Fechar a parte legal sem pendência para o cliente nem para a loja.',
    gatilho: 'Proposta aceita', dono: 'Analista de Financiamento e Documentação',
    prazo: 'Comprador tem 30 dias para transferir (CTB, art. 123)',
    passa: 'Pagamento confirmado, documentação de transferência pronta e prontuário completo.',
    grupos: [
      { t: 'Contrato e pagamento', itens: [
        { i: 'Contrato de compra e venda assinado; nota fiscal de venda emitida', q: 'Consultor / Ger. Administrativo', o: 'T' },
        { i: 'Confirmar todos os pagamentos (entrada, quitação da troca, liberação do banco) antes de liberar o veículo', q: 'Ger. Administrativo', o: 'T' },
        { i: 'Financiado: contrato do banco assinado e gravame incluído', q: 'Financiamento e Doc.', o: 'T' },
      ]},
      { t: 'Transferência', itens: [
        { i: 'Saída do veículo no Renave e ATPV-e emitida em favor do comprador', q: 'Financiamento e Doc.', o: 'U' },
        { i: 'Consignado: proprietário assina a autorização de transferência para o comprador', q: 'Consultor / CEO', o: 'C' },
        { i: 'Zero km: nota fiscal ou documento conforme a forma da operação e termo de garantia de fábrica', q: 'Consultor / CEO', o: 'Z' },
        { i: 'Vistoria de transferência e despachante, quando necessários, com translado pela Fase 3', q: 'Consultor / Motorista', o: 'T' },
        { i: 'Orientar o comprador sobre o prazo de 30 dias da transferência e fazer a comunicação de venda quando a loja for a vendedora registrada (CTB, art. 134)', q: 'Consultor', o: 'T' },
        { i: 'Troca: baixa do gravame do usado recebido e entrada dele no estoque (Fase 1)', q: 'Consultor', o: 'U' },
      ]},
      { t: 'Fechamento', itens: [
        { i: 'Consignado: repasse ao proprietário no prazo do contrato, com recibo, e comissão da loja lançada', q: 'Ger. Administrativo', o: 'C' },
        { i: 'Prontuário da venda completo e arquivado (físico e digital, acesso restrito); documentos de cliente só pelos canais oficiais', q: 'Ger. Administrativo', o: 'T' },
      ]},
    ],
  },
  {
    n: 10, t: 'Preparação da entrega', jornada: 'cliente',
    obj: 'Fazer a entrega do jeito combinado, sem surpresa.',
    gatilho: 'Documentação e pagamento concluídos', dono: 'Consultor de Vendas',
    prazo: 'Entrega no dia e hora combinados com o cliente',
    passa: 'Checklist 2 completo e cliente confirmado.',
    grupos: [
      { t: 'Agenda', itens: [
        { i: 'Combinar dia, hora e local da entrega com o cliente', q: 'Consultor', o: 'T' },
        { i: 'Perguntar se o cliente topa o vídeo de entrega e entregar o termo de imagem com antecedência', q: 'Consultor', o: 'T' },
        { i: 'Combinar o horário com o Social Media', q: 'Consultor', o: 'T' },
      ]},
      { t: 'Veículo', itens: [
        { i: 'Checklist 2 de Entrega: limpeza, combustível como combinado, fluidos, pneus e estepe, iluminação, ar-condicionado, chaves, manual, triângulo, acessórios e serviços prometidos executados', q: 'Consultor / Motorista', o: 'T' },
        { i: 'Entrega fora da loja: Motorista com fotos de saída, localização em tempo real e envelope de documentos fechado', q: 'Motorista', o: 'T' },
      ]},
    ],
  },
  {
    n: 11, t: 'Entrega das chaves', jornada: 'cliente',
    obj: 'Transformar a entrega no momento que o cliente vai lembrar e indicar.',
    gatilho: 'Cliente presente para receber o veículo', dono: 'Consultor de Vendas',
    prazo: 'Protocolo assinado na hora',
    passa: 'Veículo entregue com protocolo assinado.',
    grupos: [
      { t: 'Entrega', itens: [
        { i: 'Receber o cliente pelo nome; vistoria de entrega em conjunto', q: 'Consultor', o: 'T' },
        { i: 'Explicar comandos, manual, revisões e garantia: legal de 90 dias para o usado (CDC, art. 26) e de fábrica para o zero km', q: 'Consultor', o: 'T' },
        { i: 'Entregar chaves (principal e reserva), documentos e nota fiscal; orientar a transferência', q: 'Consultor', o: 'T' },
        { i: 'Protocolo de entrega assinado: entregou, protocolou', q: 'Consultor', o: 'T' },
      ]},
      { t: 'Logo depois', itens: [
        { i: 'Pedir avaliação no Google e indicação', q: 'Consultor', o: 'T' },
        { i: 'Venda finalizada no CRM; anúncio retirado de todos os canais; consignante avisado', q: 'Social Media / Consultor / Ger. Administrativo', o: 'T' },
        { i: 'Agendar o pós-venda da terça-feira seguinte', q: 'Motorista', o: 'T' },
      ]},
    ],
  },
  {
    n: 12, t: 'Vídeo de entrega', jornada: 'cliente',
    obj: 'Registrar a prova social mais forte da loja, com autorização e respeito.',
    gatilho: 'Entrega com cliente que autorizou a gravação', dono: 'Social Media',
    prazo: 'Publicar em horário com alguém para responder',
    passa: 'Vídeo publicado com termo arquivado, ou guardado se a aprovação ainda não saiu.',
    grupos: [
      { t: 'Antes e durante', itens: [
        { i: 'Termo de autorização de imagem assinado antes de gravar; criança só com o responsável assinando', q: 'Social Media / Consultor / Fotógrafo', o: 'T' },
        { i: 'Respeitar as escolhas do termo, como marcar o perfil ou não', q: 'Social Media', o: 'T' },
        { i: 'Momento real, de 10 a 30 segundos, sem encenação longa; placa borrada e nenhum dado da compra', q: 'Social Media', o: 'T' },
      ]},
      { t: 'Publicação', itens: [
        { i: 'Entrega com cliente identificado: aprovação da Gerência no grupo', q: 'Social Media', o: 'T' },
        { i: 'Legenda na tela, áudio liberado para uso comercial, checklist de 10 itens', q: 'Social Media', o: 'T' },
        { i: 'Avisar #NO AR; enviar o vídeo ao cliente; material bruto guardado conforme a autorização', q: 'Social Media', o: 'T' },
      ]},
    ],
  },
  {
    n: 13, t: 'Pós-venda', jornada: 'cliente',
    obj: 'Fazer o cliente voltar, indicar e falar bem.',
    gatilho: 'Veículo entregue', dono: 'Consultor de Vendas',
    prazo: 'Primeiro contato na terça-feira seguinte à entrega',
    passa: 'Cliente acompanhado e caso encerrado no CRM.',
    grupos: [
      { t: 'Acompanhamento', itens: [
        { i: 'Ligação de pós-venda na terça-feira seguinte, em até 2 minutos, registrada no CRM (automação com IA usando áudios do CEO)', q: 'Automação com IA / CEO', o: 'T' },
        { i: 'Contatos de 1, 2 e 3 meses e de 1 ano (projeto em andamento; até a automação, manual)', q: 'Automação com IA / CEO', o: 'T' },
        { i: 'Confirmar que a transferência foi concluída no prazo', q: 'Ger. Administrativo', o: 'T' },
        { i: 'NPS, avaliação online e pedido de indicação', q: 'Consultor / Pré-Vendas', o: 'T' },
      ]},
      { t: 'Problemas e melhoria', itens: [
        { i: 'Reclamação ou garantia: registrar, encaminhar e dar retorno ao cliente com prazo', q: 'Consultor / Ger. Administrativo', o: 'T' },
        { i: 'Indicadores do processo no relatório mensal: tempo de preparação, tempo em estoque, conversão e entregas no prazo', q: 'Ger. Administrativo / Ger. Marketing / CEO', o: 'T' },
      ]},
    ],
  },
];

// Itens de uma fase que valem para uma origem (T sempre vale)
function itensDaFase(fase, origem) {
  const grupos = [];
  for (const g of fase.grupos) {
    const itens = g.itens.filter((x) => x.o === 'T' || x.o === origem);
    if (itens.length) grupos.push({ t: g.t, itens });
  }
  return grupos;
}

function totalItens(fase, origem) {
  return itensDaFase(fase, origem).reduce((s, g) => s + g.itens.length, 0);
}

// chave estável de um item, para guardar o que foi marcado
function chaveItem(nFase, texto) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) { h = (h * 31 + texto.charCodeAt(i)) | 0; }
  return `f${nFase}_${(h >>> 0).toString(36)}`;
}
