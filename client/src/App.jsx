import { useEffect, useMemo, useState } from "react";
import { Check, CirclePlus, ClipboardList, Loader2, Save, Send, Trash2 } from "lucide-react";
import { createQuiz, getQuizzes, submitQuiz } from "./services/api";

const blankQuestion = () => ({
  prompt: "",
  options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
  correctIndex: 0
});

const initialQuiz = {
  title: "",
  description: "",
  questions: [blankQuestion()]
};

function App() {
  const [quizForm, setQuizForm] = useState(initialQuiz);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentAnswers, setStudentAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ loading: true, message: "" });

  const selectedQuiz = useMemo(
    () => quizzes.find((quiz) => quiz._id === selectedQuizId),
    [quizzes, selectedQuizId]
  );

  const loadQuizzes = async () => {
    setStatus({ loading: true, message: "" });
    try {
      const data = await getQuizzes();
      setQuizzes(data);
      setSelectedQuizId((current) => current || data[0]?._id || "");
      setStatus({ loading: false, message: "" });
    } catch (error) {
      setStatus({ loading: false, message: error.message });
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const updateQuestion = (index, patch) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, text) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, nextOptionIndex) =>
            nextOptionIndex === optionIndex ? { text } : option
          )
        };
      })
    }));
  };

  const addQuestion = () => {
    setQuizForm((current) => ({
      ...current,
      questions: [...current.questions, blankQuestion()]
    }));
  };

  const removeQuestion = (index) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.filter((_question, questionIndex) => questionIndex !== index)
    }));
  };

  const saveQuiz = async (event) => {
    event.preventDefault();
    setStatus({ loading: false, message: "Saving quiz..." });
    try {
      const created = await createQuiz(quizForm);
      setQuizForm(initialQuiz);
      setQuizzes((current) => [created, ...current]);
      setSelectedQuizId(created._id);
      setResult(null);
      setStudentAnswers({});
      setStatus({ loading: false, message: "Quiz template saved." });
    } catch (error) {
      setStatus({ loading: false, message: error.message });
    }
  };

  const submitAnswers = async (event) => {
    event.preventDefault();
    if (!selectedQuiz) return;

    setStatus({ loading: false, message: "Checking answers..." });
    try {
      const response = await submitQuiz(selectedQuiz._id, {
        studentName,
        answers: selectedQuiz.questions.map((question) => ({
          questionId: question._id,
          optionId: studentAnswers[question._id]
        }))
      });

      setResult(response);
      setStatus({ loading: false, message: "Submission scored." });
    } catch (error) {
      setStatus({ loading: false, message: error.message });
    }
  };

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">MERN Stack Project</p>
          <h1>Quiz Maker Engine</h1>
        </div>
        <div className="stat-strip">
          <span>{quizzes.length} templates</span>
          <span>{quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0)} questions</span>
        </div>
      </section>

      {status.message && <p className="notice">{status.message}</p>}

      <div className="workspace">
        <section className="panel builder">
          <div className="panel-heading">
            <ClipboardList size={22} />
            <h2>Create Quiz Template</h2>
          </div>

          <form onSubmit={saveQuiz} className="form-stack">
            <label>
              Quiz title
              <input
                value={quizForm.title}
                onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })}
                placeholder="JavaScript fundamentals"
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={quizForm.description}
                onChange={(event) =>
                  setQuizForm({ ...quizForm, description: event.target.value })
                }
                placeholder="A quick check on variables, arrays, and functions"
              />
            </label>

            <div className="question-list">
              {quizForm.questions.map((question, questionIndex) => (
                <article className="question-card" key={questionIndex}>
                  <div className="question-head">
                    <h3>Question {questionIndex + 1}</h3>
                    {quizForm.questions.length > 1 && (
                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={() => removeQuestion(questionIndex)}
                        aria-label="Remove question"
                        title="Remove question"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <label>
                    Prompt
                    <input
                      value={question.prompt}
                      onChange={(event) =>
                        updateQuestion(questionIndex, { prompt: event.target.value })
                      }
                      placeholder="Which method adds an item to the end of an array?"
                      required
                    />
                  </label>

                  <div className="options-grid">
                    {question.options.map((option, optionIndex) => (
                      <label className="option-field" key={optionIndex}>
                        <span>Option {optionIndex + 1}</span>
                        <div className="option-input">
                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={Number(question.correctIndex) === optionIndex}
                            onChange={() =>
                              updateQuestion(questionIndex, { correctIndex: optionIndex })
                            }
                            aria-label={`Mark option ${optionIndex + 1} as correct`}
                          />
                          <input
                            value={option.text}
                            onChange={(event) =>
                              updateOption(questionIndex, optionIndex, event.target.value)
                            }
                            placeholder={`Answer ${optionIndex + 1}`}
                            required
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="actions">
              <button type="button" className="secondary-button" onClick={addQuestion}>
                <CirclePlus size={18} />
                Add question
              </button>
              <button type="submit" className="primary-button">
                <Save size={18} />
                Save template
              </button>
            </div>
          </form>
        </section>

        <section className="panel submissions">
          <div className="panel-heading">
            <Check size={22} />
            <h2>Student Submission</h2>
          </div>

          {status.loading ? (
            <div className="loading">
              <Loader2 className="spin" size={22} />
              Loading quizzes
            </div>
          ) : (
            <form onSubmit={submitAnswers} className="form-stack">
              <label>
                Saved template
                <select
                  value={selectedQuizId}
                  onChange={(event) => {
                    setSelectedQuizId(event.target.value);
                    setStudentAnswers({});
                    setResult(null);
                  }}
                >
                  <option value="">Select a quiz</option>
                  {quizzes.map((quiz) => (
                    <option value={quiz._id} key={quiz._id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Student name
                <input
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Aarav Sharma"
                  required
                />
              </label>

              {selectedQuiz ? (
                <div className="student-questions">
                  <div className="quiz-summary">
                    <h3>{selectedQuiz.title}</h3>
                    <p>{selectedQuiz.description || "No description added."}</p>
                  </div>

                  {selectedQuiz.questions.map((question, questionIndex) => (
                    <fieldset className="answer-card" key={question._id}>
                      <legend>
                        {questionIndex + 1}. {question.prompt}
                      </legend>
                      {question.options.map((option) => (
                        <label className="answer-option" key={option._id}>
                          <input
                            type="radio"
                            name={question._id}
                            value={option._id}
                            checked={studentAnswers[question._id] === option._id}
                            onChange={() =>
                              setStudentAnswers((current) => ({
                                ...current,
                                [question._id]: option._id
                              }))
                            }
                            required
                          />
                          {option.text}
                        </label>
                      ))}
                    </fieldset>
                  ))}

                  <button type="submit" className="primary-button full-width">
                    <Send size={18} />
                    Submit answers
                  </button>
                </div>
              ) : (
                <div className="empty-state">Create or select a quiz template to begin.</div>
              )}
            </form>
          )}

          {result && (
            <div className="score-box">
              <p>Score</p>
              <strong>
                {result.score}/{result.total}
              </strong>
              <span>{result.percentage}%</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
