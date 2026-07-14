#!/usr/bin/env python3
"""Orchestrate STTM extraction and update pipelines.

Usage examples:
  Extract (dry-run, no files written):
    python pipeline_sttm.py extract --workbook ../STTM_B5_PROJECT.xlsx

  Extract (materialize CSVs into ./ncg-b6-study):
    python pipeline_sttm.py extract --workbook ../STTM_B5_PROJECT.xlsx --materialize

  Update workbook from CSVs in ncg-b6-study (dry-run):
    python pipeline_sttm.py update --workbook ../STTM_B5_PROJECT.xlsx --sheets PATIENT_DIAGNOSIS_BRG

  Update (materialize):
    python pipeline_sttm.py update --workbook ../STTM_B5_PROJECT.xlsx --materialize
"""
import argparse
from pathlib import Path
import sys

from read_sttm import read_sttm_sheet, write_csv, write_json, print_table
from update_sttm import write_sheet_from_csv


def extract(workbook, sheets, out_dir, fmt, materialize):
    wb = Path(workbook)
    if not wb.exists():
        raise FileNotFoundError(f"Workbook not found: {wb}")

    out_dir = Path(out_dir)
    for sheet in sheets:
        rows = read_sttm_sheet(wb, sheet)
        if materialize:
            out_dir.mkdir(parents=True, exist_ok=True)
            path = out_dir / f"{sheet}.{fmt}"
            if fmt == 'csv':
                write_csv(rows, path)
            else:
                write_json(rows, path)
            print(f"Wrote {len(rows)} rows to {path}")
        else:
            print(f"Dry-run: sheet '{sheet}' contains {len(rows)} rows")
            print_table(rows, 10)


def update(workbook, sheets, in_dir, materialize):
    wb = Path(workbook)
    if not wb.exists():
        raise FileNotFoundError(f"Workbook not found: {wb}")
    in_dir = Path(in_dir)
    for sheet in sheets:
        csv_path = in_dir / f"{sheet}.csv"
        if not csv_path.exists():
            print(f"CSV for sheet {sheet} not found in {in_dir}, skipping.")
            continue
        if materialize:
            write_sheet_from_csv(str(wb), sheet, str(csv_path))
            print(f"Updated workbook {wb} sheet {sheet} from {csv_path}")
        else:
            print(f"Dry-run: Would update workbook {wb} sheet {sheet} from {csv_path}")


def main():
    parser = argparse.ArgumentParser(description='STTM extract/update pipeline')
    sub = parser.add_subparsers(dest='cmd')

    e = sub.add_parser('extract')
    e.add_argument('--workbook', required=True)
    e.add_argument('--sheets', nargs='*', help='List of sheets to extract; default=all not implemented, pass explicit list', required=True)
    e.add_argument('--out-dir', default=str(Path.cwd() / 'ncg-b6-study'))
    e.add_argument('--format', choices=['csv', 'json'], default='csv')
    e.add_argument('--materialize', action='store_true')

    u = sub.add_parser('update')
    u.add_argument('--workbook', required=True)
    u.add_argument('--sheets', nargs='*', required=True)
    u.add_argument('--in-dir', default=str(Path.cwd() / 'ncg-b6-study'))
    u.add_argument('--materialize', action='store_true')

    args = parser.parse_args()
    if args.cmd == 'extract':
        extract(args.workbook, args.sheets, args.out_dir, args.format, args.materialize)
    elif args.cmd == 'update':
        update(args.workbook, args.sheets, args.in_dir, args.materialize)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
