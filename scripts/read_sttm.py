#!/usr/bin/env python3
"""Read a sheet from an STTM workbook dynamically via argparse."""
import argparse
import csv
import json
from pathlib import Path
from openpyxl import load_workbook


def read_sttm_sheet(workbook_path: Path, sheet_name: str):
    wb = load_workbook(filename=workbook_path, read_only=True)
    if sheet_name not in wb.sheetnames:
        raise ValueError(f"Sheet '{sheet_name}' not found in workbook {workbook_path}")
    ws = wb[sheet_name]
    rows = []
    for row in ws.iter_rows(values_only=True):
        rows.append([cell if cell is not None else "" for cell in row])
    return rows


def write_csv(rows, output_path: Path):
    with output_path.open("w", newline='', encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerows(rows)


def write_json(rows, output_path: Path):
    header = rows[0] if rows else []
    records = [dict(zip(header, row)) for row in rows[1:]]
    with output_path.open("w", encoding="utf-8") as fh:
        json.dump(records, fh, indent=2, ensure_ascii=False)


def print_table(rows, row_limit: int = 20):
    if not rows:
        print("<empty sheet>")
        return
    widths = [max(len(str(cell)) for cell in column) for column in zip(*rows[:row_limit])]
    for i, row in enumerate(rows[:row_limit]):
        print(" | ".join(str(cell).ljust(widths[idx]) for idx, cell in enumerate(row)))
        if i == 0:
            print("-+-".join("-" * width for width in widths))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Read an STTM workbook sheet dynamically.')
    parser.add_argument('--workbook', required=True, help='Path to STTM workbook (.xlsx)')
    parser.add_argument('--sheet', required=True, help='Sheet name to read from the workbook')
    parser.add_argument('--output', help='Optional path to write output (CSV or JSON by extension)')
    parser.add_argument('--format', choices=['csv', 'json', 'table'], default='table', help='Output format when writing to a file or printing')
    parser.add_argument('--row-limit', type=int, default=20, help='Number of rows to print when using table output')
    args = parser.parse_args()

    workbook_path = Path(args.workbook)
    if not workbook_path.exists():
        raise FileNotFoundError(f"Workbook not found: {workbook_path}")

    rows = read_sttm_sheet(workbook_path, args.sheet)

    if args.output:
        output_path = Path(args.output)
        if args.format == 'csv':
            write_csv(rows, output_path)
        elif args.format == 'json':
            write_json(rows, output_path)
        else:
            write_csv(rows, output_path)
        print(f"Wrote {len(rows)} rows from '{args.sheet}' to {output_path}")
    else:
        if args.format == 'json':
            print(json.dumps([dict(zip(rows[0], row)) for row in rows[1:]], indent=2, ensure_ascii=False))
        else:
            print_table(rows, args.row_limit)
