import mongoose, { Schema } from "mongoose";

const chunkSchema = new Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
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

      pageNumber: {
        type: Number,
      },

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

chunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

export default mongoose.models.Chunk || mongoose.model("Chunk", chunkSchema);
