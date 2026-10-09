import mongoose, { Document, Schema, Types } from "mongoose";

export type TestStatus =
  | "GENERATING"
  | "COMPLETED"
  | "FAILED"
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface IQuestionCount {
  mcq: number;
  msq: number;
  nat: number;
  trueFalse: number;
}

export interface ITestSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultImmediately: boolean;
}

export interface ITest {
  teacherId: string;
  testCode: string;
  documentIds: Types.ObjectId[];
  title: string;
  description?: string;
  questionIds?: Types.ObjectId[];
  questionCount: IQuestionCount;
  totalMarks: number;
  duration: number;
  status: TestStatus;
  settings: ITestSettings;
  createdAt?: Date;
  updatedAt?: Date;
  isAvailable: boolean;
}

export interface ITestDocument extends ITest, Document {}

const testSchema = new Schema<ITestDocument>(
  {
    
    teacherId: {
      type: String,
      required: true,
      index: true,
    },
    testCode: {
      type: String,
      unique: true,
      sparse: true,
      index:true,
      trim: true,
    },
    documentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
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
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    questionCount: {
      mcq: { type: Number, default: 0 },
      msq: { type: Number, default: 0 },
      nat: { type: Number, default: 0 },
      trueFalse: { type: Number, default: 0 },
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
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
    isAvailable: {
      type: Boolean,
      default: true,
    },
    settings: {
      shuffleQuestions: { type: Boolean, default: true },
      shuffleOptions: { type: Boolean, default: true },
      showResultImmediately: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
);

testSchema.index({
  teacherId: 1,
  createdAt: -1,
});

export const Test =
  (mongoose.models.Test as mongoose.Model<ITestDocument>) ||
  mongoose.model<ITestDocument>("Test", testSchema);
