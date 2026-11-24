import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState('');

  const loadSurveys = async () => {
    try {
      const endpoint = user.role === 'admin' ? '/surveys/admin/all' : '/surveys/my';
      const res = await authFetch(endpoint);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSurveys(data.surveys || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user.role === 'owner' || user.role === 'admin') {
      loadSurveys();
    }
  }, [user.role]);

  const handleToggleDisable = async (survey) => {
    try {
      const res = await authFetch(`/surveys/${survey._id}/disable`, {
        method: 'PATCH',
        body: JSON.stringify({
          isDisabled: !survey.isDisabled,
          disabledReason: 'Disabled by administrator'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      loadSurveys();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="row-between">
        <h2>
          {user.role === 'admin' ? 'Admin Moderation Dashboard' : 'My Surveys'}
        </h2>
        {(user.role === 'owner' || user.role === 'admin') && (
          <Link to="/builder" className="btn">
            + Create Survey
          </Link>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {user.role === 'respondent' ? (
        <div className="card">
          <p>
            You are logged in as a <strong>Respondent</strong>. Paste a shared survey link
            into your browser (e.g., <code>/survey/&lt;id&gt;</code>) to participate.
          </p>
        </div>
      ) : surveys.length === 0 ? (
        <p>No surveys found yet.</p>
      ) : (
        surveys.map((s) => (
          <div key={s._id} className="card">
            <h3>
              {s.title} {s.isDisabled && <span className="badge-danger">[DISABLED]</span>}
            </h3>
            <p>{s.description}</p>
            <small>
              Open: {new Date(s.openDate).toLocaleString()} | Close:{' '}
              {new Date(s.closeDate).toLocaleString()}
            </small>
            <div className="actions">
              <Link to={`/survey/${s._id}`}>Public Link</Link>
              <Link to={`/survey/${s._id}/results`}>View Results</Link>
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => handleToggleDisable(s)}
                  className="btn-secondary"
                >
                  {s.isDisabled ? 'Re-enable Survey' : 'Disable Survey'}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
