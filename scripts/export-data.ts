/**
 * Export Excel data to JSON for the Next.js app.
 * Run: npm run export-data (or tsx scripts/export-data.ts)
 * Reads from project root or public/Bases_de_datos_Airbnb.xlsx
 */

import * as fs from "fs";
import * as path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const EXCEL_PATHS = [
  path.join(PROJECT_ROOT, "Bases_de_datos_Airbnb.xlsx"),
  path.join(PROJECT_ROOT, "public", "Bases_de_datos_Airbnb.xlsx"),
];
const OUTPUT_PATH = path.join(PROJECT_ROOT, "lib", "airbnb-data.json");

const NUMERIC_COLUMNS = [
  "price",
  "minimum_nights",
  "number_of_reviews",
  "reviews_per_month",
  "availability_365",
  "calculated_host_listings_count",
  "id",
  "host_id",
];

function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const k = String(key).trim();
    if (NUMERIC_COLUMNS.includes(k)) {
      const n = Number(value);
      out[k] = Number.isNaN(n) ? (value ?? null) : n;
    } else {
      out[k] = value == null ? null : String(value);
    }
  }
  return out;
}

function main() {
  let excelPath: string | null = null;
  for (const p of EXCEL_PATHS) {
    if (fs.existsSync(p)) {
      excelPath = p;
      break;
    }
  }
  if (!excelPath) {
    console.error(
      "No Excel file found. Place Bases_de_datos_Airbnb.xlsx in project root or public/"
    );
    process.exit(1);
  }

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

  const data = raw.map(normalizeRow);

  const libDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 0), "utf-8");
  console.log(`Exported ${data.length} rows to ${OUTPUT_PATH}`);
}

main();
