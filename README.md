# +Motor BR Fluxograma

Sistema de acompanhamento do processo de vendas da +Motor BR, revenda de veículos em São Paulo.
Cada veículo entra no sistema e percorre as 13 fases do **Manual Guia do Processo de Vendas**, da chegada ao
estoque até a entrega das chaves e o pós-venda.

**Acesso:** https://jsimaoneto.github.io/motorbrfluxograma/
**Senha inicial:** `motorbr2026` (pode ser trocada em *Dados e backup*)

---

## O que o sistema faz

| Tela | Para que serve |
|---|---|
| **Painel** | Mostra em que fase está cada veículo, quantos estão em preparação, anunciados ou parados há mais de 30 dias, os compromissos dos próximos 14 dias e o que precisa de atenção |
| **Veículos** | Banco de veículos com ficha completa, fotos, checklist das 13 fases e anotações. Filtros por origem, status e fase |
| **Clientes** | Banco de clientes com os dados básicos mais o perfil de gosto: tipo de veículo preferido, faixa de valor e cores. Cruza o perfil com o estoque e sugere os carros que combinam |
| **Agenda** | Calendário com as etapas do processo, feriados nacionais e de São Paulo, datas comerciais do setor e os aniversários dos clientes |
| **O processo** | Consulta das 13 fases como estão no manual, com objetivo, dono, prazo e todos os itens |
| **Dados e backup** | Baixar e restaurar o backup, ver o espaço usado, trocar a senha e carregar dados de exemplo |

### O checklist se ajusta à origem do veículo

Cada item do manual vale para todos os veículos ou só para um tipo. Ao escolher a origem na ficha, o checklist
se ajusta sozinho:

- **Usado** comprado para o estoque, inclusive o recebido na troca
- **Consignado**, em contrato estimatório
- **Zero km**

### Agenda

Os feriados móveis (Carnaval, Sexta-feira Santa, Corpus Christi) são calculados a partir da Páscoa, então valem
para qualquer ano. Entram também as datas comerciais que mexem na pauta da loja (Dia das Mães, Dia dos Pais,
Dia do Cliente, Black Friday, temporada de IPVA, férias de julho, 13º salário) e o aniversário de cada cliente
cadastrado.

---

## Onde os dados ficam guardados

Os dados ficam **só no navegador de quem usa**, neste aparelho:

- registros (veículos, clientes, checklists, agenda e anotações) no `localStorage`
- fotos no `IndexedDB`, que aguenta mais espaço; elas são reduzidas antes de salvar

O que isso significa na prática:

- quem abrir o sistema em outro computador ou celular **não vê** o que foi lançado aqui
- limpar os dados do navegador **apaga tudo**
- navegação anônima não guarda nada

**Faça backup com frequência**, em *Dados e backup*. O arquivo `.json` leva tudo, inclusive as fotos, e serve
para passar os dados para outro aparelho ou recuperar o sistema.

### Para a equipe compartilhar os mesmos dados

Isso exige um banco de dados de verdade, o que uma página estática no GitHub Pages não tem. O código já está
organizado para essa troca: todo o acesso a dados está em [`js/db.js`](js/db.js), e basta reescrever aquelas
funções apontando para um serviço como o Supabase, sem mexer no resto do sistema.

---

## Segurança e LGPD

A senha da tela de entrada é **apenas um obstáculo visual**, não é segurança de verdade: o site é público e
qualquer pessoa com conhecimento técnico contorna essa tela.

Por isso, enquanto o sistema estiver em página pública, **não cadastre** CPF, documentos, dados bancários nem
outros dados sensíveis de clientes. Para uso com dados reais, é preciso antes:

1. um banco de dados com login de verdade, por usuário
2. hospedagem com controle de acesso
3. a base legal e o registro de tratamento previstos na LGPD

---

## Como mexer no sistema

Não tem build nem dependência: é HTML, CSS e JavaScript puro.

```
index.html          tela de entrada e estrutura
css/styles.css      visual (identidade da +Motor BR: laranja #FF5A00, preto e cinza)
js/fases.js         as 13 fases do manual, com os itens e a origem de cada um
js/db.js            camada de dados (localStorage e IndexedDB)
js/agenda.js        feriados, datas comerciais e aniversários
js/app.js           as telas
```

Para mudar um item do checklist, edite `js/fases.js`. Para rodar na sua máquina:

```bash
python -m http.server 8777
```

e abra `http://localhost:8777`.

---

Base: **Manual Guia do Processo de Vendas da +Motor BR** e **Manual Organizacional** (versão ABNT).
Elaboração: José Simão Neto, psicólogo, CRP 06/92454, 2026.
