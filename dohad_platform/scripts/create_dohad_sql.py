"""
create_dohad_sql.py
Reads all CSV files from the Arsenic & Cadmium folders and generates
a MySQL-compatible DOHaD.sql file that can be opened/imported in MySQL Workbench.
"""

import pandas as pd
import os
import re
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_DIR = r"d:\College\Test DTI\DTI DOHaD project files"
SQL_PATH = r"d:\College\Test DTI\DTI DOHaD project files\DOHaD.sql"

FOLDERS = {
    "arsenic_developmental": os.path.join(BASE_DIR, "Arsenic", "Developmental"),
    "arsenic_prenatal":      os.path.join(BASE_DIR, "Arsenic", "Prenatal"),
    "cadmium":               os.path.join(BASE_DIR, "Cadmium"),
}

def sanitize_col(name: str) -> str:
    name = name.strip()
    name = re.sub(r"[^\w]", "_", name)
    name = re.sub(r"_+", "_", name)
    return name.lower()

def escape_sql(value) -> str:
    """Escape a single value for SQL INSERT."""
    if pd.isna(value):
        return "NULL"
    value = str(value)
    value = value.replace("\\", "\\\\")
    value = value.replace("'", "\\'")
    value = value.replace("\n", " ")
    value = value.replace("\r", " ")
    return f"'{value}'"

def infer_col_type(series: pd.Series) -> str:
    """Infer MySQL column type from a pandas Series."""
    if pd.api.types.is_integer_dtype(series):
        return "BIGINT"
    if pd.api.types.is_float_dtype(series):
        return "DOUBLE"
    # use TEXT for long string columns, VARCHAR(512) for short ones
    max_len = series.dropna().astype(str).str.len().max() if not series.dropna().empty else 0
    if max_len > 500:
        return "TEXT"
    return "VARCHAR(512)"

def load_csvs_from_folder(folder_path: str):
    dfs = []
    for fname in sorted(os.listdir(folder_path)):
        if not fname.lower().endswith(".csv"):
            continue
        fpath = os.path.join(folder_path, fname)
        try:
            df = pd.read_csv(fpath, encoding="ISO-8859-1", low_memory=False)
            df["source_file"] = fname
            dfs.append(df)
            print(f"  [OK] {fname}  ({len(df):,} rows)")
        except Exception as e:
            print(f"  [SKIP] {fname}: {e}")
    if not dfs:
        return pd.DataFrame()
    combined = pd.concat(dfs, ignore_index=True)
    combined.columns = [sanitize_col(c) for c in combined.columns]
    return combined

def write_table_sql(f, table_name: str, df: pd.DataFrame):
    cols = list(df.columns)

    # --- CREATE TABLE ---
    f.write(f"DROP TABLE IF EXISTS `{table_name}`;\n")
    f.write(f"CREATE TABLE `{table_name}` (\n")
    f.write(f"  `id` BIGINT NOT NULL AUTO_INCREMENT,\n")
    col_defs = []
    for col in cols:
        col_type = infer_col_type(df[col])
        col_defs.append(f"  `{col}` {col_type}")
    f.write(",\n".join(col_defs))
    f.write(",\n  PRIMARY KEY (`id`)\n")
    f.write(f") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n")

    # --- INSERT rows in batches of 500 ---
    batch_size = 500
    total = len(df)
    for start in range(0, total, batch_size):
        chunk = df.iloc[start:start + batch_size]
        col_list = ", ".join(f"`{c}`" for c in cols)
        f.write(f"INSERT INTO `{table_name}` ({col_list}) VALUES\n")
        rows = []
        for _, row in chunk.iterrows():
            vals = ", ".join(escape_sql(row[c]) for c in cols)
            rows.append(f"  ({vals})")
        f.write(",\n".join(rows))
        f.write(";\n")
    f.write("\n")
    print(f"  --> {total:,} rows written to table '{table_name}'")

def main():
    print(f"Generating SQL file: {SQL_PATH}\n")

    with open(SQL_PATH, "w", encoding="utf-8") as f:
        # Header
        f.write("-- ============================================================\n")
        f.write("-- DOHaD Research Database\n")
        f.write("-- Generated from CSV files in DTI DOHaD project files\n")
        f.write("-- Compatible with MySQL Workbench\n")
        f.write("-- ============================================================\n\n")

        f.write("CREATE DATABASE IF NOT EXISTS `DOHaD`\n")
        f.write("  DEFAULT CHARACTER SET utf8mb4\n")
        f.write("  DEFAULT COLLATE utf8mb4_unicode_ci;\n\n")
        f.write("USE `DOHaD`;\n\n")

        for table_name, folder_path in FOLDERS.items():
            print(f"Processing table '{table_name}' from:\n  {folder_path}")
            df = load_csvs_from_folder(folder_path)
            if df.empty:
                print("  (no data, skipping)\n")
                continue
            write_table_sql(f, table_name, df)
            print()

        # Unified view
        f.write("-- ============================================================\n")
        f.write("-- Unified view: all_papers\n")
        f.write("-- ============================================================\n")
        f.write("DROP VIEW IF EXISTS `all_papers`;\n")
        f.write("CREATE VIEW `all_papers` AS\n")
        f.write("  SELECT pmid, title, abstract, journal, year, 'Arsenic - Developmental' AS source_category, source_file FROM arsenic_developmental\n")
        f.write("  UNION ALL\n")
        f.write("  SELECT pmid, title, abstract, journal, year, 'Arsenic - Prenatal' AS source_category, source_file FROM arsenic_prenatal\n")
        f.write("  UNION ALL\n")
        f.write("  SELECT pmid, title, abstract, journal, year, 'Cadmium' AS source_category, source_file FROM cadmium;\n")

    size_mb = os.path.getsize(SQL_PATH) / (1024 * 1024)
    print(f"[DONE] DOHaD.sql created at: {SQL_PATH}  ({size_mb:.1f} MB)")

if __name__ == "__main__":
    main()
