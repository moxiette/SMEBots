// File exporters for bot outputs.
// Generates real .xlsx, .docx, .csv, and .txt files in the browser.

import { saveAs } from "file-saver";

// ============================================================
// Markdown → structured data helpers
// ============================================================

/**
 * Extract all markdown tables from a markdown string.
 * Returns an array of { title, headers, rows } where title is the
 * preceding heading (if any).
 */
export function extractMarkdownTables(md: string): Array<{
  title: string;
  headers: string[];
  rows: string[][];
}> {
  const tables: Array<{ title: string; headers: string[]; rows: string[][] }> = [];
  const lines = md.split("\n");

  let currentHeading = "";
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].trim();
      i++;
      continue;
    }

    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const headerLine = line;
      const sepLine = lines[i + 1];
      if (sepLine && /^\s*\|[\s\-:|]+\|\s*$/.test(sepLine)) {
        const headers = parseMdRow(headerLine);
        const rows: string[][] = [];
        let j = i + 2;
        while (
          j < lines.length &&
          lines[j].trim().startsWith("|") &&
          lines[j].trim().endsWith("|")
        ) {
          rows.push(parseMdRow(lines[j]));
          j++;
        }
        if (headers.length && rows.length) {
          tables.push({ title: currentHeading || "Table", headers, rows });
        }
        i = j;
        continue;
      }
    }
    i++;
  }
  return tables;
}

function parseMdRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim().replace(/\*\*/g, "").replace(/\*/g, ""));
}

// ============================================================
// Excel (.xlsx) export
// ============================================================

export async function downloadAsXlsx(content: string, filename: string) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SMEBots";
  workbook.created = new Date();

  const tables = extractMarkdownTables(content);

  if (tables.length === 0) {
    const sheet = workbook.addWorksheet("Content");
    sheet.addRow(["Content"]).font = { bold: true };
    content.split("\n").forEach((line) => sheet.addRow([line]));
    sheet.columns = [{ width: 80 }];
  } else {
    const usedNames = new Set<string>();
    function uniqueSheetName(base: string): string {
      let name = base.slice(0, 30) || "Sheet";
      name = name.replace(/[:\\/?*[\]]/g, " ").trim() || "Sheet";
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
      let suffix = 2;
      while (usedNames.has(`${name.slice(0, 27)} (${suffix})`)) {
        suffix++;
      }
      const final = `${name.slice(0, 27)} (${suffix})`;
      usedNames.add(final);
      return final;
    }

    tables.forEach((table, idx) => {
      const sheetName = uniqueSheetName(table.title || `Sheet ${idx + 1}`);
      const sheet = workbook.addWorksheet(sheetName);

      const headerRow = sheet.addRow(table.headers);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F2937" },
      };
      headerRow.alignment = {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      };
      headerRow.height = 22;

      table.rows.forEach((row) => {
        sheet.addRow(row);
      });

      sheet.columns = table.headers.map((_h, ci) => ({
        width: Math.min(
          50,
          Math.max(
            12,
            ...table.rows.map((r) => (r[ci] || "").length + 2),
            (table.headers[ci] || "").length + 2
          )
        ),
      }));

      sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFD1D5DB" } },
            bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
            left: { style: "thin", color: { argb: "FFD1D5DB" } },
            right: { style: "thin", color: { argb: "FFD1D5DB" } },
          };
          cell.alignment = { vertical: "top", wrapText: true };
        });
        if (rowNumber > 1 && rowNumber % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }
      });

      sheet.views = [{ state: "frozen", ySplit: 1 }];
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

// ============================================================
// Word (.docx) export
// ============================================================

export async function downloadAsDocx(content: string, filename: string) {
  const docxModule = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
  } = docxModule;

  const lines = content.split("\n");
  const elements: InstanceType<typeof Paragraph | typeof Table>[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const h1 = line.match(/^#\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);

    if (h1) {
      elements.push(
        new Paragraph({
          text: h1[1].replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_1,
        })
      );
      i++;
      continue;
    }
    if (h2) {
      elements.push(
        new Paragraph({
          text: h2[1].replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_2,
        })
      );
      i++;
      continue;
    }
    if (h3) {
      elements.push(
        new Paragraph({
          text: h3[1].replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_3,
        })
      );
      i++;
      continue;
    }

    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const sep = lines[i + 1];
      if (sep && /^\s*\|[\s\-:|]+\|\s*$/.test(sep)) {
        const headers = parseMdRow(line);
        const rows: string[][] = [];
        let j = i + 2;
        while (
          j < lines.length &&
          lines[j].trim().startsWith("|") &&
          lines[j].trim().endsWith("|")
        ) {
          rows.push(parseMdRow(lines[j]));
          j++;
        }

        const tableRows = [
          new TableRow({
            children: headers.map(
              (h) =>
                new TableCell({
                  width: {
                    size: Math.floor(100 / headers.length),
                    type: WidthType.PERCENTAGE,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: h, bold: true, color: "FFFFFF" }),
                      ],
                    }),
                  ],
                  shading: { fill: "1F2937" },
                })
            ),
          }),
          ...rows.map(
            (r) =>
              new TableRow({
                children: r.map(
                  (cell) =>
                    new TableCell({
                      width: {
                        size: Math.floor(100 / headers.length),
                        type: WidthType.PERCENTAGE,
                      },
                      children: [new Paragraph(cell)],
                    })
                ),
              })
          ),
        ];

        elements.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
        elements.push(new Paragraph({ text: "" }));
        i = j;
        continue;
      }
    }

    const bulletMatch = line.match(/^(\s*)[-*•]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        new Paragraph({
          text: bulletMatch[2].replace(/\*\*/g, ""),
          bullet: {
            level: Math.min(3, Math.floor((bulletMatch[1].length || 0) / 2)),
          },
        })
      );
      i++;
      continue;
    }

    const numMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (numMatch) {
      elements.push(
        new Paragraph({
          text: numMatch[2].replace(/\*\*/g, ""),
          alignment: AlignmentType.LEFT,
        })
      );
      i++;
      continue;
    }

    if (line.trim()) {
      const cleanText = line.replace(/\*\*([^*]+)\*\*/g, "$1");
      elements.push(new Paragraph(cleanText));
    } else {
      elements.push(new Paragraph({ text: "" }));
    }
    i++;
  }

  const doc = new Document({
    creator: "SMEBots",
    title: filename.replace(/\.(docx|md|txt)$/, ""),
    sections: [{ children: elements }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
}

// ============================================================
// CSV / TXT / MD passthrough
// ============================================================

export function downloadAsCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  saveAs(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export function downloadAsTxt(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, filename.endsWith(".txt") ? filename : `${filename}.txt`);
}

export function downloadAsMd(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, filename.endsWith(".md") ? filename : `${filename}.md`);
}
