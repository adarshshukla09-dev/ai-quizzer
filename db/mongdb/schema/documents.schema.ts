import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
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

    // Cloudflare R2
    source: {
      provider: {
        type: String,
        default: "r2",
      },
      key: {
        type: String,
      },
      url: {
        type: String,
      },
      fileName: {
        type: String,
      },
      size: {
        type: Number,
      },
    },

    status: {
      type: String,
      enum: ["pending", "uploaded", "processing", "ready", "failed"],
      default: "pending",
    },

    processing: {
      parser: {
        type: String,
        enum: ["structured", "unstructured"],
        default: "unstructured",
      },

      parserVersion: {
        type: String,
      },

      chunkerVersion: {
        type: String,
      },

      embeddingModel: {
        type: String,
      },

      embeddingDimension: {
        type: Number,
      },
    },

    pageCount: {
      type: Number,
    },

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

export default mongoose.models.Document ||
  mongoose.model("Document", documentSchema);
