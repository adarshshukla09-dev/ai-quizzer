import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { extractKeywords } from "@/lib/keywords";
import { Worker } from "bullmq";
import { redis } from "./redis";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getDocumentEmbeddings } from "./embedding";
import { supabaseAdmin } from "../supabase-admin";

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { parseOffice } from "officeparser";
import { DocumentModel } from "@/db/mongdb/schema/documents.schema";
import { ChunkModel } from "@/db/mongdb/schema/Chunks.schema";
import { connectDB } from "@/db/mongdb/connection";

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTextFromAST(node: unknown): string {
  if (typeof node === "string") {
    return node;
  }

  if (typeof node === "number" || typeof node === "boolean") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractTextFromAST).filter(Boolean).join("\n");
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

async function extractTextFromPDF(buffer: Buffer): Promise<{
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

async function extractTextFromDOCX(buffer: Buffer): Promise<{
  text: string;
}> {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return {
    text: cleanText(result.value || ""),
  };
}

/* =========================================================
   PPTX
========================================================= */

async function extractTextFromPPTX(buffer: Buffer): Promise<{
  text: string;
}> {
  const ast = await parseOffice(buffer);

  const text = extractTextFromAST(ast);

  return {
    text: cleanText(text),
  };
}

async function extractTextFromXLSX(buffer: Buffer): Promise<{
  text: string;
}> {
  const ast = await parseOffice(buffer);

  const text = extractTextFromAST(ast);

  return {
    text: cleanText(text),
  };
}

async function extractTextFromTextFile(buffer: Buffer): Promise<{
  text: string;
}> {
  return {
    text: cleanText(buffer.toString("utf-8")),
  };
}

async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<{
  text: string;
  pageCount?: number;
}> {
  const ext = path.extname(fileName).toLowerCase().replace(".", "");

  switch (ext) {
    case "pdf": {
      return extractTextFromPDF(buffer);
    }
    case "docx": {
      return extractTextFromDOCX(buffer);
    }
    case "pptx": {
      return extractTextFromPPTX(buffer);
    }
    case "xlsx": {
      return extractTextFromXLSX(buffer);
    }
    case "txt":
    case "md":
    case "csv":
    case "html":
    case "json": {
      return extractTextFromTextFile(buffer);
    }
    default:
      throw new Error(
        `Unsupported file extension: .${ext} for file "${fileName}"`,
      );
  }
}

/* =========================================================
   CHUNKER
========================================================= */

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const ragWorker = new Worker(
  "rag-ingestion",

  async (job) => {
    console.log("Processing:", job.name, "| Job ID:", job.id);

    await connectDB();

    const { fileName, filePath, teacherId } = job.data;

    if (!fileName || !filePath) {
      throw new Error("Invalid job payload: missing fileName or filePath.");
    }

    if (!teacherId) {
      throw new Error("Missing teacherId in RAG ingestion job payload.");
    }

    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from("rag-documents")
      .download(filePath);

    if (downloadError || !fileBlob) {
      throw new Error(
        `Failed to download file from storage: ${
          downloadError?.message || "Unknown error"
        }`,
      );
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    console.log(`Extracting text from ${fileName}...`);

    const { text: rawText, pageCount } = await extractTextFromBuffer(
      fileBuffer,
      fileName,
    );

    if (!rawText || !rawText.trim()) {
      throw new Error(
        `Extracted text is empty. "${fileName}" might be corrupted, image-only, or unsupported.`,
      );
    }

    console.log(`Extracted ${rawText.length} characters from ${fileName}`);

    const fileExtension = path.extname(fileName).toLowerCase().replace(".", "");

    const document = await DocumentModel.create({
      teacherId,
      title: fileName,
      content: rawText,
      status: "processing",
      pageCount: pageCount || 0,
      filetype: fileExtension,
    });

    console.log(`Created document ${document._id}`);

    console.log("Splitting document into chunks...");
    const chunks = await splitter.splitText(rawText);
    console.log(`Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      throw new Error("No chunks were generated from document.");
    }

    console.log(`Extracting keywords for ${chunks.length} chunks...`);
    const chunkKeywords = chunks.map((chunk) => extractKeywords(chunk));

    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const embeddings = await getDocumentEmbeddings(chunks);

    if (!embeddings || embeddings.length !== chunks.length) {
      throw new Error(
        `Embedding count mismatch. Expected ${chunks.length}, got ${
          embeddings?.length || 0
        }`,
      );
    }

    const chunkRecords = chunks.map((chunkText, index) => ({
      documentId: document._id,
      teacherId: document.teacherId,
      chunkIndex: index,
      content: chunkText,
      embedding: embeddings[index],
      metadata: {
        fileName,
        fileType: fileExtension,
        pageCount: pageCount || 0,
        chunkIndex: index,
        keywords: chunkKeywords[index], // <-- Attached keywords here
      },
    }));
    console.log(`Storing ${chunkRecords.length} chunks...`);
    const insertedChunks = await ChunkModel.insertMany(chunkRecords);
    console.log(`Inserted ${insertedChunks.length} chunks into MongoDB`);
    const updatedDocument = await DocumentModel.findByIdAndUpdate(
      document._id,
      { status: "ready" },
      { new: true },
    );

    console.log(`Document ${updatedDocument?._id} is ready`);

    return {
      documentId: document._id.toString(),
      chunks: insertedChunks.length,
      characters: rawText.length,
      fileName,
    };
  },
  {
    connection: redis,
    concurrency: 1,
  },
);

ragWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

ragWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
