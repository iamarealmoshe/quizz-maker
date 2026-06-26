import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import Submission from "../models/Submission.js";

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeQuizPayload = (body) => {
  const questions = (body.questions || []).map((question) => {
    const options = (question.options || []).map((option) => ({
      _id: new mongoose.Types.ObjectId(),
      text: option.text
    }));

    const correctIndex = Number(question.correctIndex);

    return {
      prompt: question.prompt,
      options,
      correctOption: options[correctIndex]?._id
    };
  });

  return {
    title: body.title,
    description: body.description,
    questions
  };
};

const serializeQuiz = (quiz) => {
  const plainQuiz = quiz.toObject ? quiz.toObject() : quiz;

  return {
    ...plainQuiz,
    questions: plainQuiz.questions.map(({ correctOption, ...question }) => question)
  };
};

export const listQuizzes = async (_req, res, next) => {
  try {
    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 });

    res.json(quizzes.map(serializeQuiz));
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create(normalizeQuizPayload(req.body));
    res.status(201).json(serializeQuiz(quiz));
  } catch (error) {
    next(createHttpError(400, error.message));
  }
};

export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      throw createHttpError(404, "Quiz not found.");
    }

    res.json(serializeQuiz(quiz));
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      throw createHttpError(404, "Quiz not found.");
    }

    const submittedAnswers = new Map(
      (req.body.answers || []).map((answer) => [String(answer.questionId), String(answer.optionId)])
    );

    const answers = quiz.questions.map((question) => {
      const optionId = submittedAnswers.get(String(question._id));
      const isCorrect = optionId === String(question.correctOption);

      return {
        questionId: question._id,
        optionId,
        isCorrect
      };
    });

    if (answers.some((answer) => !answer.optionId)) {
      throw createHttpError(400, "Every question must be answered.");
    }

    const score = answers.filter((answer) => answer.isCorrect).length;
    const total = quiz.questions.length;

    const submission = await Submission.create({
      quiz: quiz._id,
      studentName: req.body.studentName,
      answers,
      score,
      total
    });

    res.status(201).json({
      submissionId: submission._id,
      score,
      total,
      percentage: Math.round((score / total) * 100)
    });
  } catch (error) {
    next(error);
  }
};
