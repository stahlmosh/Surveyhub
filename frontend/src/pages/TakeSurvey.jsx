import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE, useAuth } from '../context/AuthContext';

export default function TakeSurvey() {
  const { id } = useParams();
  const { user, authFetch } = useAuth();

  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    fetch(`${API_BASE}/surveys/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        setSurvey(data.survey);
        setQuestions(data.questions);
      })
      .catch((err) => setStatus({ error: err.message, success: '' }));
  }, [id]);

  const handleSingleChange = (qId, option) => {
    setAnswers({ ...answers, [qId]: { selectedOptions: [option], textAnswer: '' } });
  };

  const handleMultiChange = (qId, option) => {
    const prev = answers[qId]?.selectedOptions || [];
    const updated = prev.includes(option)
      ? prev.filter((o) => o !== option)
      : [...prev, option];
    setAnswers({ ...answers, [qId]: { selectedOptions: updated, textAnswer: '' } });
  };

  const handleTextChange = (qId, text) => {
    setAnswers({ ...answers, [qId]: { selectedOptions: [], textAnswer: text } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });

    const formattedAnswers = questions.map((q) => ({
      question: q._id,
      selectedOptions: answers[q._id]?.selectedOptions || [],
      textAnswer: answers[q._id]?.textAnswer || ''
    }));

    try {
      const res = await authFetch(`/responses/${id}`, {
        method: 'POST',
        body: JSON.stringify({ answers: formattedAnswers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus({ error: '', success: 'Thank you! Your response has been recorded.' });
    } catch (err) {
      setStatus({ error: err.message, success: '' });
    }
  };

  if (!survey) return <p>{status.error || 'Loading survey...'}</p>;

  return (
    <div className="card">
      <h2>{survey.title}</h2>
      <p>{survey.description}</p>

      {survey.isDisabled && (
        <p className="error">This survey has been disabled: {survey.disabledReason}</p>
      )}
      {status.error && <p className="error">{status.error}</p>}
      {status.success && <p className="success">{status.success}</p>}

      {!user ? (
        <p>
          Please <Link to="/login">log in</Link> to submit your response (one response per
          user).
        </p>
      ) : (
        !survey.isDisabled &&
        !status.success && (
          <form onSubmit={handleSubmit}>
            {questions.map((q, idx) => (
              <div key={q._id} className="question-box">
                <p>
                  <strong>
                    {idx + 1}. {q.questionText}
                  </strong>
                </p>

                {q.type === 'single_choice' &&
                  q.options.map((opt) => (
                    <label key={opt} className="choice-row">
                      <input
                        type="radio"
                        name={q._id}
                        checked={answers[q._id]?.selectedOptions?.[0] === opt}
                        onChange={() => handleSingleChange(q._id, opt)}
                        required
                      />
                      {opt}
                    </label>
                  ))}

                {q.type === 'multiple_choice' &&
                  q.options.map((opt) => (
                    <label key={opt} className="choice-row">
                      <input
                        type="checkbox"
                        checked={answers[q._id]?.selectedOptions?.includes(opt) || false}
                        onChange={() => handleMultiChange(q._id, opt)}
                      />
                      {opt}
                    </label>
                  ))}

                {q.type === 'text' && (
                  <textarea
                    value={answers[q._id]?.textAnswer || ''}
                    onChange={(e) => handleTextChange(q._id, e.target.value)}
                    required
                  />
                )}
              </div>
            ))}
            <button type="submit">Submit Response</button>
          </form>
        )
      )}
    </div>
  );
}
