import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    answers: {
      type: [answerSchema],
      default: []
    },
    score: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
