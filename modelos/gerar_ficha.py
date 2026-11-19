# Gera a ficha Excel de cadastro de veículos que o sistema importa (botão "Importar Excel" na tela Veículos).
# Os títulos das colunas da aba "Veículos" são os mesmos que js/importar.js procura: mude os dois juntos.
# Uso: python modelos/gerar_ficha.py   ->   modelos/Ficha_Cadastro_Veiculos_MotorBR.xlsx
import os
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Ficha_Cadastro_Veiculos_MotorBR.xlsx")
LARANJA, PRETO, CINZA, FUNDO = "FF5A00", "1B1A19", "646872", "ECEDF2"

ORIGENS = ["Usado", "Consignado", "Zero km"]
STATUS = ["Em estoque", "Vendido", "Repassado"]
CAMBIOS = ["Manual", "Automático", "Automatizado", "CVT"]
COMBUSTIVEIS = ["Flex", "Gasolina", "Etanol", "Diesel", "Híbrido", "Elétrico", "GNV"]
SIMNAO = ["Sim", "Não"]
CARROCERIAS = ["SUV", "Sedã", "Hatch", "Picape", "Minivan", "Cupê", "Conversível", "Perua", "Utilitário"]

# (título, largura, tipo, obrigatório, explicação)
COLUNAS = [
    ("Placa", 11, "texto", False, "Sem traço. Junto com o chassi, identifica o veículo: se a placa já existir no sistema, a linha atualiza esse veículo."),
    ("Chassi (VIN)", 20, "texto", False, "Usado para achar o veículo quando não há placa (zero km)."),
    ("Renavam", 14, "texto", False, ""),
    ("Origem", 13, "lista:Origem", True, "Usado, Consignado ou Zero km. Define quais itens do checklist valem."),
    ("Status", 13, "lista:Status", False, "Em estoque, Vendido ou Repassado. Vazio = Em estoque."),
    ("Data de entrada", 14, "data", False, "Dia em que entrou na loja (dd/mm/aaaa). Conta o tempo de estoque. Vazio = hoje."),
    ("Marca", 14, "texto", True, "Ex.: Jeep"),
    ("Modelo", 16, "texto", True, "Ex.: Compass"),
    ("Versão", 18, "texto", False, "Como no anúncio do site. Ex.: SRX 4X4 7 LUGARES"),
    ("Motor", 18, "texto", False, "Como no site. Ex.: 2.8 4X4 16V TURBO INTERCOOLER"),
    ("Carroceria", 12, "lista:Carroceria", False, "SUV, Sedã, Hatch, Picape... Ajuda a cruzar com o gosto dos clientes."),
    ("Ano fabricação", 10, "ano", False, "Quatro dígitos"),
    ("Ano modelo", 10, "ano", False, "Quatro dígitos. É o ano que aparece no anúncio do site."),
    ("Cor", 11, "texto", False, "Ex.: Cinza"),
    ("Blindado", 10, "lista:SimNao", False, "Sim ou Não, como no anúncio do site."),
    ("Km", 10, "numero", False, "Só números"),
    ("Câmbio", 13, "lista:Cambio", False, "Manual, Automático, Automatizado ou CVT"),
    ("Combustível", 12, "lista:Combustivel", False, "Flex, Gasolina, Etanol, Diesel, Híbrido, Elétrico ou GNV"),
    ("Portas", 8, "numero", False, ""),
    ("Chaves", 8, "numero", False, "Quantidade de chaves"),
    ("Opcionais e observações", 40, "texto", False, "Separados por vírgula, como no site: Alarme, Ar condicionado digital, Bancos de couro, Câmera de ré, Chave reserva, IPVA pago, Licenciado, Manual do veículo..."),
    ("Título do anúncio", 40, "texto", False, "Nome completo como aparece no site, em maiúsculas. Ex.: TOYOTA HILUX SW4 2.8 SRX 4X4 7 LUGARES 16V TURBO INTERCOOLER DIESEL 4P AUTOMÁTICO"),
    ("Sobre o veículo", 40, "texto", False, "Texto do campo 'Sobre o Veículo' do anúncio"),
    ("Link do anúncio no site", 30, "texto", False, "Endereço da página do veículo em maismotorbr.com.br, quando já estiver publicado"),
    ("Preço de compra (R$)", 14, "moeda", False, "Valor pago pela loja (usado)"),
    ("Custo de preparação (R$)", 14, "moeda", False, ""),
    ("Preço de anúncio (R$)", 14, "moeda", False, ""),
    ("Preço de venda (R$)", 14, "moeda", False, "Preencha quando vender"),
    ("Proprietário (consignado)", 22, "texto", False, "Só para consignado"),
    ("Contato do proprietário", 18, "texto", False, "Só para consignado"),
    ("Valor mínimo de repasse (R$)", 15, "moeda", False, "Só para consignado"),
    ("Comissão", 10, "texto", False, "Ex.: 5% ou R$ 3.000"),
    ("Cliente comprador", 22, "texto", False, "Nome igual ao cadastro de Clientes do sistema; se não achar, a linha entra sem cliente."),
    ("Data da venda", 13, "data", False, "dd/mm/aaaa"),
    ("Data da entrega", 13, "data", False, "dd/mm/aaaa"),
]


def montar(linhas=(), saida=SAIDA):
    """Cria a ficha. linhas: lista de dicionários {título da coluna: valor} já preenchidos."""
    LINHAS = max(500, len(linhas) + 200)
    borda = Border(bottom=Side(style="thin", color="E6E8EC"), right=Side(style="thin", color="E6E8EC"))
    wb = Workbook()

    # ---------------------------------------------------------------- aba Veículos
    ws = wb.active
    ws.title = "Veículos"
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A2"
    ws.row_dimensions[1].height = 34
    for i, (titulo, larg, tipo, obrig, _) in enumerate(COLUNAS, start=1):
        c = ws.cell(row=1, column=i, value=titulo)
        c.font = Font(name="Poppins", bold=True, color="FFFFFF", size=10)
        c.fill = PatternFill("solid", fgColor=LARANJA if obrig else PRETO)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        letra = get_column_letter(i)
        ws.column_dimensions[letra].width = larg + 2
        fmt = {"data": "dd/mm/yyyy", "moeda": '"R$" #,##0.00', "numero": "0", "ano": "0"}.get(tipo)
        for r in range(2, LINHAS + 2):
            cel = ws.cell(row=r, column=i)
            cel.border = borda
            cel.font = Font(name="Poppins", size=10, color="333333")
            if fmt:
                cel.number_format = fmt
            elif tipo == "texto":
                cel.number_format = "@"  # placa, chassi e renavam não viram número
    for r, linha in enumerate(linhas, start=2):
        for i, (titulo, _, _, _, _) in enumerate(COLUNAS, start=1):
            v = linha.get(titulo)
            if v not in (None, ""):
                ws.cell(row=r, column=i, value=v)
    ws.auto_filter.ref = f"A1:{get_column_letter(len(COLUNAS))}1"

    # ---------------------------------------------------------------- listas (aba oculta) e validações
    ls = wb.create_sheet("Listas")
    for col, (nome, valores) in enumerate([("Origem", ORIGENS), ("Status", STATUS), ("Cambio", CAMBIOS), ("Combustivel", COMBUSTIVEIS),
                                           ("SimNao", SIMNAO), ("Carroceria", CARROCERIAS)], start=1):
        ls.cell(row=1, column=col, value=nome)
        for r, v in enumerate(valores, start=2):
            ls.cell(row=r, column=col, value=v)
        letra = get_column_letter(col)
        intervalo = f"Listas!${letra}$2:${letra}${len(valores) + 1}"
        for i, (_, _, tipo, _, _) in enumerate(COLUNAS, start=1):
            if tipo == f"lista:{nome}":
                dv = DataValidation(type="list", formula1=intervalo, allow_blank=True, showErrorMessage=True,
                                    errorTitle="Valor fora da lista", error="Escolha uma opção da lista.")
                alvo = get_column_letter(i)
                dv.add(f"{alvo}2:{alvo}{LINHAS + 1}")
                ws.add_data_validation(dv)
    for i, (_, _, tipo, _, _) in enumerate(COLUNAS, start=1):
        alvo = f"{get_column_letter(i)}2:{get_column_letter(i)}{LINHAS + 1}"
        if tipo == "data":
            dv = DataValidation(type="date", operator="greaterThan", formula1="DATE(2000,1,1)", allow_blank=True, showErrorMessage=True,
                                errorTitle="Data inválida", error="Digite a data como dd/mm/aaaa.")
        elif tipo == "ano":
            dv = DataValidation(type="whole", operator="between", formula1="1950", formula2="2100", allow_blank=True, showErrorMessage=True,
                                errorTitle="Ano inválido", error="Digite o ano com quatro dígitos.")
        else:
            continue
        dv.add(alvo)
        ws.add_data_validation(dv)
    ls.sheet_state = "hidden"

    # ---------------------------------------------------------------- aba Instruções
    ins = wb.create_sheet("Instruções", 0)
    ins.sheet_view.showGridLines = False
    ins.column_dimensions["A"].width = 3
    ins.column_dimensions["B"].width = 30
    ins.column_dimensions["C"].width = 14
    ins.column_dimensions["D"].width = 90
    ins["B2"] = "+Motor BR · Ficha de cadastro de veículos"
    ins["B2"].font = Font(name="Poppins", bold=True, size=16, color=PRETO)
    passos = [
        "1. Preencha um veículo por linha na aba Veículos, a partir da linha 2. Não mude nem apague os títulos da linha 1.",
        "2. Colunas laranja são obrigatórias (Origem, Marca e Modelo). As pretas são opcionais.",
        "3. No sistema, abra Veículos > Importar Excel e escolha este arquivo. Antes de gravar, ele mostra quantos são novos, quantos serão atualizados e os erros.",
        "4. Para atualizar: deixe a mesma placa (ou o chassi, se não houver placa). Só as células preenchidas mudam; as vazias mantêm o que já está no sistema.",
        "5. Não coloque CPF, documentos nem dados bancários: o sistema fica em página pública.",
    ]
    for k, t in enumerate(passos):
        c = ins.cell(row=4 + k, column=2, value=t)
        c.font = Font(name="Poppins", size=10, color="333333")
        ins.merge_cells(start_row=4 + k, start_column=2, end_row=4 + k, end_column=4)
    lin = 4 + len(passos) + 1
    for j, t in enumerate(["Coluna", "Obrigatória", "Como preencher"], start=2):
        c = ins.cell(row=lin, column=j, value=t)
        c.font = Font(name="Poppins", bold=True, color="FFFFFF", size=10)
        c.fill = PatternFill("solid", fgColor=PRETO)
    for k, (titulo, _, tipo, obrig, expl) in enumerate(COLUNAS, start=1):
        r = lin + k
        ins.cell(row=r, column=2, value=titulo).font = Font(name="Poppins", bold=True, size=10, color=LARANJA if obrig else PRETO)
        ins.cell(row=r, column=3, value="Sim" if obrig else "").font = Font(name="Poppins", size=10, color=CINZA)
        ins.cell(row=r, column=4, value=expl).font = Font(name="Poppins", size=10, color="333333")
        ins.cell(row=r, column=4).alignment = Alignment(wrap_text=True, vertical="top")
        if k % 2 == 0:
            for j in (2, 3, 4):
                ins.cell(row=r, column=j).fill = PatternFill("solid", fgColor=FUNDO)

    wb.active = wb.index(ws)
    wb.save(saida)
    return saida


if __name__ == "__main__":
    print("ok", montar(), len(COLUNAS), "colunas")
