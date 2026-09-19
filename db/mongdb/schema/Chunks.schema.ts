// chunk.model.ts
import mongoose, { Schema } from "mongoose";

const chunkSchema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      default: "123",
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

// Unique constraint to prevent duplicate chunks per document
chunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

// Compound index for filtered vector queries
chunkSchema.index({ teacherId: 1, documentId: 1 });

export const ChunkModel =
  mongoose.models.Chunk || mongoose.model("Chunk", chunkSchema);
