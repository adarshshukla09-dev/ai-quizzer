import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Define the exact structure of your metadata sub-document
export interface ChunkMetadata {
  heading: string[];
  pageNumber?: number; // Optional since it's not marked required: true
  fileName: string;
  keywords: string[];
}

// 2. Define the base interface for the Chunk Document
export interface IChunk {
  documentId: mongoose.Types.ObjectId;
  teacherId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  metadata: ChunkMetadata;
  createdAt: Date; // Added automatically by timestamps: true
  updatedAt: Date; // Added automatically by timestamps: true
}

// 3. Pass the interface into the Schema constructor <IChunk>
const chunkSchema = new Schema<IChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    teacherId: {
      type: String,
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    metadata: {
      heading: {
        type: [String],
        default: [],
      },
      pageNumber: Number,
      fileName: {
        type: String,
        required: true,
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
chunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
chunkSchema.index({ teacherId: 1, documentId: 1 });
chunkSchema.index({
  content: "text",
});

export const ChunkModel: Model<IChunk> =
  mongoose.models.Chunk || mongoose.model<IChunk>("Chunk", chunkSchema);
chunkSchema.index({ "metadata.keywords": 1 });
chunkSchema.index({ content: "text" });
export type ChunkDocument = Document & IChunk;
export type ChunkModelType = Model<IChunk>;
