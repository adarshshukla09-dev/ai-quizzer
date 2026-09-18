import mongoose, { Schema } from "mongoose";

const testSchema = new Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Test generated from one or more documents
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
      },
    ],

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Questions selected from the Question collection
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],

    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      // Duration in minutes
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    settings: {
      shuffleQuestions: {
        type: Boolean,
        default: true,
      },

      shuffleOptions: {
        type: Boolean,
        default: true,
      },

      showResultImmediately: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

testSchema.index({ teacherId: 1, createdAt: -1 });

export default mongoose.models.Test || mongoose.model("Test", testSchema);
