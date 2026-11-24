import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Results() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch(`/surveys/${id}/results`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setData(json);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading analytics...</p>;

  return (
    <div className="card">
      <h2>Results: {data.survey.title}</h2>
      <p>
        <strong>Total Responses:</strong> {data.totalResponses}
      </p>

      {data.results.map((q, idx) => (
        <div key={q._id} className="question-box">
          <h4>
            {idx + 1}. {q.questionText}
          </h4>

          {q.type === 'text' ? (
            <ul>
              {q.textResponses.length === 0 ? (
                <li>No text answers yet.</li>
              ) : (
                q.textResponses.map((txt, i) => <li key={i}>{txt}</li>)
              )}
            </ul>
          ) : (
            q.breakdown.map((b) => (
              <div key={b.option} className="bar-row">
                <div className="row-between">
                  <span>{b.option}</span>
                  <span>
                    {b.count} ({b.percentage}%)
                  </span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${b.percentage}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
