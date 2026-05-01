// Client-side file text extraction for the optional-context upload feature.
//
// Supported today (no extra dependencies, all client-side):
//   .txt, .md, .csv, .json, .tsv — read directly as text
//
// Not yet supported (would require pdfjs-dist or mammoth):
//   .pdf, .docx, .xlsx — would need ~1MB of additional bundle

export interface ExtractedFile {
  filename: string;
  text: string;
  bytes: number;
  warnings: string[];
}

const SUPPORTED_TEXT_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".tsv"];
const MAX_FILE_BYTES = 200_000; // 200KB cap per file

export async function extractFileText(file: File): Promise<ExtractedFile> {
  const filename = file.name;
  const lower = filename.toLowerCase();
  const warnings: string[] = [];

  if (file.size > MAX_FILE_BYTES) {
    return {
      filename,
      text: "",
      bytes: file.size,
      warnings: [
        `File is too large (${Math.round(file.size / 1000)}KB). Maximum is ${Math.round(MAX_FILE_BYTES / 1000)}KB. Try copying just the relevant sections into the text box instead.`,
      ],
    };
  }

  if (SUPPORTED_TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    const text = await file.text();
    return { filename, text, bytes: file.size, warnings };
  }

  if (lower.endsWith(".pdf")) {
    warnings.push(
      `PDF parsing is not supported in this version. Open the PDF, copy the relevant text, and paste it into the text box below.`
    );
    return { filename, text: "", bytes: file.size, warnings };
  }
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    warnings.push(
      `Word document parsing is not supported in this version. Copy the text from the document and paste it into the text box below.`
    );
    return { filename, text: "", bytes: file.size, warnings };
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    warnings.push(
      `Excel parsing is not supported in this version. Export the sheet as CSV and upload that instead.`
    );
    return { filename, text: "", bytes: file.size, warnings };
  }

  try {
    const text = await file.text();
    if (text && text.length > 0) {
      warnings.push(
        `Read ${filename} as plain text. If formatting looks wrong, copy and paste the content directly.`
      );
      return { filename, text, bytes: file.size, warnings };
    }
  } catch {
    // ignore
  }

  warnings.push(
    `Could not read ${filename}. Supported formats: .txt, .md, .csv, .json. For other formats, copy and paste the text directly.`
  );
  return { filename, text: "", bytes: file.size, warnings };
}

export function summarizeExtractedFiles(files: ExtractedFile[]): string {
  const valid = files.filter((f) => f.text && f.text.trim());
  if (valid.length === 0) return "";
  return valid
    .map((f) => `--- File: ${f.filename} ---\n${f.text}\n--- End ${f.filename} ---`)
    .join("\n\n");
}
