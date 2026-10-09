import mongoose, { Schema, Types } from "mongoose";

export type QuestionType = "MCQ" | "MSQ" | "TRUE_FALSE" | "NAT";

export interface IQuestion {
  teacherId: string;
  documentIds: Types.ObjectId[];
  questionIndex: number;
  questionType: QuestionType;
  question: string;
  answer: string;
  correctOptions: string[];
  explanation: string;
  options: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    teacherId: {
      type: String,
      required: true,
      index: true,
    },

    documentIds: [
      {
        type: Schema.Types.ObjectId,
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

questionSchema.index({
  teacherId: 1,
  createdAt: -1,
});

const Question =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", questionSchema);

export default Question;
