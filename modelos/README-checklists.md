# Como regerar as folhas de checklist

Depois de mexer nos itens de `js/vistoria.js` ou `js/recebimento.js`:

```powershell
node modelos/gerar_folha.js saida.html vistoria branco
node modelos/exportar_json.js ../ccc-motorbr/dados/checklists.json
```

- `gerar_folha.js <saida.html> <vistoria|recebimento> [branco]` monta a folha fora do navegador
  (mesmo código da impressão). Converta para PDF com:
  `chrome --headless --no-pdf-header-footer --allow-file-access-from-files --print-to-pdf=saida.pdf file:///caminho/saida.html`
- `exportar_json.js` regenera o `dados/checklists.json` do site **ccc-motorbr**, que mostra os
  mesmos itens. Sem rodar isso, os dois sites divergem.
- Os PDFs ficam em `modelos/` aqui e em `arquivos/` no ccc-motorbr — copie para os dois.
