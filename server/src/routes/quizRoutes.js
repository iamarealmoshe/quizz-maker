import { Router } from "express";
import { createQuiz, getQuiz, listQuizzes, submitQuiz } from "../controllers/quizController.js";

const router = Router();

router.get("/", listQuizzes);
router.post("/", createQuiz);
router.get("/:id", getQuiz);
router.post("/:id/submissions", submitQuiz);

export default router;
