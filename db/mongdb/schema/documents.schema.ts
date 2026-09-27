// document.model.ts
import mongoose, { Schema, Document } from "mongoose";

const documentSchema = new Schema(
  {
    teacherId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "uploaded", "processing", "ready", "failed"],
      default: "pending",
      index: true,
    },
    processing: {
      parser: {
        type: String,
        enum: ["structured", "unstructured"],
        default: "unstructured",
      },
      parserVersion: String,
      chunkerVersion: String,
      embeddingModel: String,
      embeddingDimension: Number,
      errorMsg: String,
    },
    pageCount: Number,
    filetype: {
      type: String,
      enum: ["pdf", "docx", "ppt", "odt", "txt", "html", "md", "csv"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
