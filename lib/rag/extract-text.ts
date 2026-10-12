import path from "path";

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { parseOffice } from "officeparser";


PDFParse.setWorker(
  path.join(
    process.cwd(),
    "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs",
  ),
);
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTextFromAST(node: unknown): string {
  if (typeof node === "string") return node;

  if (
    typeof node === "number" ||
    typeof node === "boolean"
  ) {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node
      .map(extractTextFromAST)
      .filter(Boolean)
      .join("\n");
  }

  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;

    return Object.values(obj)
      .map(extractTextFromAST)
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

async function extractTextFromPDF(
  buffer: Buffer,
): Promise<{
  text: string;
  pageCount: number;
}> {
  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    return {
      text: cleanText(result.text || ""),
      pageCount: result.total || 0,
    };
  } finally {
    await parser.destroy();
  }
}

async function extractTextFromDOCX(
  buffer: Buffer,
): Promise<{
  text: string;
}> {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return {
    text: cleanText(result.value || ""),
  };
}

async function extractTextFromPPTX(
  buffer: Buffer,
): Promise<{
  text: string;
}> {
  const ast = await parseOffice(buffer);

  return {
    text: cleanText(extractTextFromAST(ast)),
  };
}

async function extractTextFromXLSX(
  buffer: Buffer,
): Promise<{
  text: string;
}> {
  const ast = await parseOffice(buffer);

  return {
    text: cleanText(extractTextFromAST(ast)),
  };
}

async function extractTextFromTextFile(
  buffer: Buffer,
): Promise<{
  text: string;
}> {
  return {
    text: cleanText(buffer.toString("utf-8")),
  };
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<{
  text: string;
  pageCount?: number;
}> {
  const ext = path
    .extname(fileName)
    .toLowerCase()
    .replace(".", "");

  switch (ext) {
    case "pdf":
      return extractTextFromPDF(buffer);

    case "docx":
      return extractTextFromDOCX(buffer);

    case "pptx":
      return extractTextFromPPTX(buffer);

    case "xlsx":
      return extractTextFromXLSX(buffer);

    case "txt":
    case "md":
    case "csv":
    case "html":
    case "json":
      return extractTextFromTextFile(buffer);

    default:
      throw new Error(
        `Unsupported file extension: .${ext} for file "${fileName}"`,
      );
  }
}
