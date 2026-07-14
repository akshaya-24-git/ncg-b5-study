import openpyxl
wb = openpyxl.load_workbook(r'C:\Users\p.samuel\Documents\VS_workspace\STTM_B5_PROJECT.xlsx', read_only=True)
ws = wb['RISK_SCORE_FCT']
rows = list(ws.iter_rows(values_only=True))
print('rows', len(rows))
for row in rows[1:]:
    if row and row[0] and 'RISK_SCORE_FCT' in str(row[8] or ''):
        print(row[0], '|', row[1], '|', row[3], '|', row[8], '|', row[9], '|', row[7], '|', row[10])
