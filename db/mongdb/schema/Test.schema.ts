import mongoose, { Schema } from "mongoose";

const testSchema = new Schema(
  {
    teacherId: {
      type: String,
      required: true,
      index: true,
    },

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

    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    questionCount: {
      mcq: {
        type: Number,
        default: 0,
      },
      msq: {
        type: Number,
        default: 0,
      },
      nat: {
        type: Number,
        default: 0,
      },
      trueFalse: {
        type: Number,
        default: 0,
      },
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
      enum: [
        "GENERATING",
        "COMPLETED",
        "FAILED",
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
      ],
      default: "GENERATING",
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

const Test = mongoose.models.Test || mongoose.model("Test", testSchema);
export default Test;
