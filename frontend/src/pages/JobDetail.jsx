import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data));
  }, [id]);

  async function apply(e) {
    e.preventDefault();
    setMsg(''); setError(''); setSubmitting(true);
    try {
      await api.post('/applications', { job_id: Number(id), cover_letter: coverLetter });
      setMsg('Application sent. Track its status under "My Applications".');
      setCoverLetter('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send application');
    } finally {
      setSubmitting(false);
    }
  }

  if (!job) return <div className="container"><p>Loading…</p></div>;

  return (
    <div className="container">
      <div className="job-detail">
        <div className="card">
          <Link to="/jobs">← Back to jobs</Link>
          <h1 style={{ marginBottom: 4 }}>{job.title}</h1>
          <div className="company" style={{ color: '#6b7280', fontSize: 16, marginBottom: 14 }}>
            {job.company}
          </div>
          <div className="meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {job.location && <span style={chip}>{job.location}</span>}
            {job.industry && <span style={chip}>{job.industry}</span>}
            {job.job_type && <span style={chip}>{job.job_type}</span>}
            {(job.salary_min || job.salary_max) && (
              <span style={chip}>€{job.salary_min || '?'} – €{job.salary_max || '?'}</span>
            )}
          </div>
          <h3>Description</h3>
          <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{job.description || 'No description provided.'}</p>

          <h3>Required skills</h3>
          <div className="skills">
            {(job.skills || []).map((s) => (
              <span key={s.id} className="skill-pill">{s.name}</span>
            ))}
            {(!job.skills || job.skills.length === 0) && <span>No specific skills listed.</span>}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Apply</h3>
          {!user && (
            <p>
              Please <Link to="/login">sign in</Link> to apply for this job.
            </p>
          )}
          {user && (
            <form onSubmit={apply}>
              {msg && <div className="success">{msg}</div>}
              {error && <div className="error">{error}</div>}
              <div className="form-group">
                <label>Cover letter (optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a great fit?"
                  rows={6}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const chip = { background: '#f3f4f6', padding: '4px 10px', borderRadius: 999, fontSize: 13, color: '#374151' };
