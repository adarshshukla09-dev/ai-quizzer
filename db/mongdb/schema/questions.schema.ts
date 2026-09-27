import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
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
      default: "",
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

// Indexed for faster querying by teacher
questionSchema.index({ teacherId: 1, createdAt: -1 });

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
export default Question;
