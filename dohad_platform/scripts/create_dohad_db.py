"""
create_dohad_db.py
Reads all CSV files from the Arsenic & Cadmium folders inside
"d:\\College\\Test DTI\\DTI DOHaD project files" and imports them
into a SQLite database named DOHaD.db.

Table structure:
  - arsenic_developmental   -> all CSVs from Arsenic/Developmental
  - arsenic_prenatal        -> all CSVs from Arsenic/Prenatal
  - cadmium                 -> all CSVs from Cadmium
Each row also gets a 'source_file' column tracking the originating CSV.
"""

import sqlite3
import pandas as pd
import os
import re
import io
import sys

# Force UTF-8 output on Windows terminals
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_DIR = r"d:\College\Test DTI\DTI DOHaD project files"
DB_PATH  = r"d:\College\Test DTI\DTI DOHaD project files\DOHaD.db"

FOLDERS = {
    "arsenic_developmental": os.path.join(BASE_DIR, "Arsenic", "Developmental"),
    "arsenic_prenatal":      os.path.join(BASE_DIR, "Arsenic", "Prenatal"),
    "cadmium":               os.path.join(BASE_DIR, "Cadmium"),
}

def sanitize_col(name: str) -> str:
    """Make a column name safe for SQLite."""
    name = name.strip()
    name = re.sub(r"[^\w]", "_", name)
    name = re.sub(r"_+", "_", name)
    return name.lower()

def load_csvs_from_folder(folder_path: str) -> pd.DataFrame:
    dfs = []
    for fname in os.listdir(folder_path):
        if not fname.lower().endswith(".csv"):
            continue
        fpath = os.path.join(folder_path, fname)
        try:
            df = pd.read_csv(fpath, encoding="ISO-8859-1", low_memory=False)
            df["source_file"] = fname
            dfs.append(df)
            print(f"  [OK] Loaded: {fname}  ({len(df):,} rows, {len(df.columns)} cols)")
        except Exception as e:
            print(f"  [SKIP] {fname}: {e}")
    if not dfs:
        return pd.DataFrame()
    combined = pd.concat(dfs, ignore_index=True)
    combined.columns = [sanitize_col(c) for c in combined.columns]
    return combined

def main():
    conn = sqlite3.connect(DB_PATH)
    print(f"Connected to SQLite database: {DB_PATH}\n")

    for table_name, folder_path in FOLDERS.items():
        print(f"Processing table '{table_name}' from:\n  {folder_path}")
        df = load_csvs_from_folder(folder_path)
        if df.empty:
            print(f"  (no data found, skipping)\n")
            continue
        df.to_sql(table_name, conn, if_exists="replace", index=False)
        print(f"  --> Written {len(df):,} total rows to table '{table_name}'\n")

    # Create a unified view combining all three tables with common columns
    print("Creating unified view 'all_papers'...")
    conn.execute("DROP VIEW IF EXISTS all_papers")
    conn.execute("""
        CREATE VIEW all_papers AS
        SELECT pmid, title, abstract, journal, year, 'Arsenic - Developmental' AS source_category, source_file
        FROM arsenic_developmental
        UNION ALL
        SELECT pmid, title, abstract, journal, year, 'Arsenic - Prenatal' AS source_category, source_file
        FROM arsenic_prenatal
        UNION ALL
        SELECT pmid, title, abstract, journal, year, 'Cadmium' AS source_category, source_file
        FROM cadmium
    """)
    conn.commit()

    # Print summary
    print("\n=== Database Summary ===")
    cursor = conn.cursor()
    for table_name in FOLDERS.keys():
        try:
            count = cursor.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
            cols  = [r[1] for r in cursor.execute(f"PRAGMA table_info({table_name})").fetchall()]
            print(f"  {table_name}: {count:,} rows | Columns: {', '.join(cols)}")
        except Exception as e:
            print(f"  {table_name}: ERROR - {e}")

    total = cursor.execute("SELECT COUNT(*) FROM all_papers").fetchone()[0]
    print(f"\n  all_papers (view): {total:,} total records")
    print(f"\n[DONE] DOHaD database created at: {DB_PATH}")
    conn.close()

if __name__ == "__main__":
    main()
