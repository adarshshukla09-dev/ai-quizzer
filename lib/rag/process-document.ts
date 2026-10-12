import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { extractKeywords } from "@/lib/keywords";
import { getDocumentEmbeddings } from "@/lib/utils/embedding";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {getUserGeminiApiKey}  from "@/lib/encryption";

import { DocumentModel } from "@/db/mongdb/schema/documents.schema";
import { ChunkModel } from "@/db/mongdb/schema/Chunks.schema";
import { connectDB } from "@/db/mongdb/connection";

import { extractTextFromBuffer } from "./extract-text";

export interface RagJob {
  jobId: string;
  filePath: string;
  fileName: string;
  teacherId: string;
  uploadedAt: number;
}

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export async function processDocument(job: RagJob) {
  const { jobId, filePath, fileName, teacherId } = job;

  if (!fileName || !filePath) {
    throw new Error("Invalid RAG job payload: missing fileName or filePath.");
  }

  if (!teacherId) {
    throw new Error("Missing teacherId in RAG ingestion job payload.");
  }

  await connectDB();

  console.log(`[Job ${jobId}] Processing RAG document: ${fileName}`);

  // 1. Retrieve the teacher's decrypted Gemini API key server-side
  const geminiApiKey = await getUserGeminiApiKey(teacherId);

  if (!geminiApiKey) {
    throw new Error(`Gemini API key could not be retrieved for teacher: ${teacherId}`);
  }

  // 2. Download original file from Supabase Storage
  const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
    .from("rag-documents")
    .download(filePath);

  if (downloadError || !fileBlob) {
    throw new Error(
      `Failed to download file from storage: ${downloadError?.message || "Unknown error"}`
    );
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  // 3. Extract text from uploaded document
  console.log(`[Job ${jobId}] Extracting text from ${fileName}...`);

  const { text: rawText, pageCount } = await extractTextFromBuffer(
    fileBuffer,
    fileName
  );

  if (!rawText || !rawText.trim()) {
    throw new Error(
      `Extracted text is empty. "${fileName}" might be corrupted, image-only, or unsupported.`
    );
  }

  console.log(`[Job ${jobId}] Extracted ${rawText.length} characters from ${fileName}`);

  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

  // 4. Create document record in MongoDB
  const document = await DocumentModel.create({
    teacherId,
    title: fileName,
    content: rawText,
    status: "processing",
    pageCount: pageCount || 0,
    filetype: fileExtension,
  });

  console.log(`[Job ${jobId}] Created document record ${document._id}`);

  try {
    // 5. Split document into chunks
    console.log(`[Job ${jobId}] Splitting document into chunks...`);
    const chunks = await splitter.splitText(rawText);

    if (chunks.length === 0) {
      throw new Error("No chunks were generated from document.");
    }

    console.log(`[Job ${jobId}] Created ${chunks.length} chunks`);

    // 6. Extract keywords for each chunk
    console.log(`[Job ${jobId}] Extracting keywords...`);
    const chunkKeywords = chunks.map((chunk) => extractKeywords(chunk));

    // 7. Generate embeddings using teacher's API key
    console.log(`[Job ${jobId}] Generating embeddings for ${chunks.length} chunks...`);
    const embeddings = await getDocumentEmbeddings(geminiApiKey, chunks);

    if (!embeddings || embeddings.length !== chunks.length) {
      throw new Error(
        `Embedding count mismatch. Expected ${chunks.length}, got ${
          embeddings?.length || 0
        }`
      );
    }

    // 8. Build MongoDB chunk records
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
        keywords: chunkKeywords[index],
      },
    }));

    // 9. Insert chunks into MongoDB
    console.log(`[Job ${jobId}] Storing ${chunkRecords.length} chunks...`);
    const insertedChunks = await ChunkModel.insertMany(chunkRecords);

    console.log(`[Job ${jobId}] Inserted ${insertedChunks.length} chunks into MongoDB`);

    // 10. Mark document status as ready
    const updatedDocument = await DocumentModel.findByIdAndUpdate(
      document._id,
      { status: "ready" },
      { new: true }
    );

    console.log(`[Job ${jobId}] Document ${updatedDocument?._id} marked ready`);

    return {
      jobId,
      documentId: document._id.toString(),
      chunks: insertedChunks.length,
      characters: rawText.length,
      fileName,
    };
  } catch (processingError) {
    // Mark document as failed if processing encounters an error
    await DocumentModel.findByIdAndUpdate(document._id, { status: "failed" });
    throw processingError;
  }
}