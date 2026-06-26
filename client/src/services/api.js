const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getQuizzes = () => request("/quizzes");

export const createQuiz = (quiz) =>
  request("/quizzes", {
    method: "POST",
    body: JSON.stringify(quiz)
  });

export const submitQuiz = (quizId, submission) =>
  request(`/quizzes/${quizId}/submissions`, {
    method: "POST",
    body: JSON.stringify(submission)
  });
