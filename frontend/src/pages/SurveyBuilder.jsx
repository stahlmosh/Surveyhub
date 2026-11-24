import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SurveyBuilder() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', type: 'single_choice', options: ['Option 1', 'Option 2'] }
  ]);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', type: 'single_choice', options: ['Option 1', 'Option 2'] }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push(`Option ${updated[qIndex].options.length + 1}`);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authFetch('/surveys', {
        method: 'POST',
        body: JSON.stringify({ title, description, openDate, closeDate, questions })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Create New Survey</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Survey Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Open Date & Time</label>
        <input
          type="datetime-local"
          value={openDate}
          onChange={(e) => setOpenDate(e.target.value)}
          required
        />

        <label>Close Date & Time</label>
        <input
          type="datetime-local"
          value={closeDate}
          onChange={(e) => setCloseDate(e.target.value)}
          required
        />

        <h3>Questions</h3>
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="question-box">
            <label>Question {qIdx + 1}</label>
            <input
              placeholder="Enter question..."
              value={q.questionText}
              onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
              required
            />

            <label>Question Type</label>
            <select
              value={q.type}
              onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}
            >
              <option value="single_choice">Single Choice</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="text">Text Answer</option>
            </select>

            {q.type !== 'text' && (
              <div>
                <label>Options</label>
                {q.options.map((opt, optIdx) => (
                  <input
                    key={optIdx}
                    value={opt}
                    onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                    required
                  />
                ))}
                <button type="button" onClick={() => addOption(qIdx)}>
                  + Add Option
                </button>
              </div>
            )}
          </div>
        ))}

        <button type="button" onClick={addQuestion}>
          + Add Question
        </button>
        <button type="submit">Publish Survey</button>
      </form>
    </div>
  );
}
