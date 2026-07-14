#!/usr/bin/env python3
"""
update_sttm.py
A small utility to update an Excel STTM workbook sheet from a CSV file.
Usage:
  python update_sttm.py --workbook /path/to/STTM_B5_PROJECT.xlsx --sheet PATIENT_DIAGNOSIS_BRG --csv patient_diagnosis_brg.csv
"""
import argparse
import csv
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter


def write_sheet_from_csv(workbook_path, sheet_name, csv_path):
    wb = load_workbook(filename=workbook_path)
    # Remove existing sheet if present
    if sheet_name in wb.sheetnames:
        std = wb[sheet_name]
        wb.remove(std)
    # Create new sheet at the end
    ws = wb.create_sheet(title=sheet_name)

    with open(csv_path, newline='', encoding='utf-8') as fh:
        reader = csv.reader(fh)
        for r, row in enumerate(reader, start=1):
            for c, val in enumerate(row, start=1):
                ws.cell(row=r, column=c, value=val)
    # Auto-adjust a few column widths (simple heuristic)
    for i, col in enumerate(ws.columns, start=1):
        max_length = 0
        for cell in col:
            if cell.value:
                l = len(str(cell.value))
                if l > max_length:
                    max_length = l
        ws.column_dimensions[get_column_letter(i)].width = min(max(10, max_length + 2), 60)

    wb.save(workbook_path)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Update STTM workbook sheet from CSV')
    parser.add_argument('--workbook', required=True, help='Path to STTM workbook (.xlsx)')
    parser.add_argument('--sheet', required=True, help='Sheet name to overwrite/create')
    parser.add_argument('--csv', help='CSV file path containing new sheet rows (if omitted, looks in ./ncg-b6-study)')
    parser.add_argument('--materialize', action='store_true', help='When set, actually write changes to the workbook')
    parser.add_argument('--in-dir', default=str(Path.cwd() / 'ncg-b6-study'), help='Input directory to read CSVs from when not explicitly provided')
    parser.add_argument('--preview-rows', type=int, default=5, help='Number of rows to show in dry-run preview')
    args = parser.parse_args()

    if args.csv:
        csv_path = Path(args.csv)
    else:
        csv_path = Path(args.in_dir) / f"{args.sheet}.csv"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    # Dry-run mode: do not touch workbook unless --materialize
    if not args.materialize:
        with open(csv_path, newline='', encoding='utf-8') as fh:
            reader = csv.reader(fh)
            rows = list(reader)
        print(f"Dry-run: {len(rows)} rows found in {csv_path}. Preview (first {args.preview_rows} rows):")
        for r in rows[:args.preview_rows]:
            print(r)
        print("To persist these changes into the workbook, re-run with --materialize.")
    else:
        write_sheet_from_csv(args.workbook, args.sheet, csv_path)
        print(f'Wrote sheet {args.sheet} to {args.workbook} from {csv_path}')
