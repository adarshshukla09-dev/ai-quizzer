import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    questionIndex: {
      type: Number,
      required: true,
    },

    questionType: {
      type: String,
      enum: ["MCQ", "MSQ", "TRUE_FALSE", "NAT"],
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
    },

    correctOptions: {
      type: [String],
      default: [],
    },

    explanation: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

questionSchema.index({ documentId: 1, questionIndex: 1 }, { unique: true });

export default mongoose.models.Question ||
  mongoose.model("Question", questionSchema);
