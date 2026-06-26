import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (options) => options.length >= 2,
        message: "Each question needs at least two options."
      }
    },
    correctOption: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions) => questions.length > 0,
        message: "A quiz needs at least one question."
      }
    }
  },
  { timestamps: true }
);

quizSchema.pre("validate", function ensureCorrectOptions(next) {
  for (const question of this.questions) {
    const hasCorrectOption = question.options.some((option) =>
      option._id.equals(question.correctOption)
    );

    if (!hasCorrectOption) {
      return next(new Error("Correct option must belong to its question."));
    }
  }

  next();
});

export default mongoose.model("Quiz", quizSchema);
