import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NewJob() {
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState([]);
  const [form, setForm] = useState({
    title: '', company: '', description: '', location: '',
    industry: '', job_type: 'full-time', salary_min: '', salary_max: '',
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/users/skills/all').then((r) => setAllSkills(r.data));
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function toggleSkill(id) {
    setSelectedSkills((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        skill_ids: selectedSkills,
      };
      const r = await api.post('/jobs', payload);
      navigate(`/jobs/${r.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create job');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>Post a new job</h1>
      <div className="card">
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={update('title')} required />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input value={form.company} onChange={update('company')} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={update('description')} rows={5} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label>Location</label>
              <input value={form.location} onChange={update('location')} />
            </div>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label>Industry</label>
              <input value={form.industry} onChange={update('industry')} placeholder="e.g. Healthcare" />
            </div>
            <div className="form-group" style={{ flex: '0 0 160px' }}>
              <label>Type</label>
              <select value={form.job_type} onChange={update('job_type')}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Salary min (€)</label>
              <input type="number" value={form.salary_min} onChange={update('salary_min')} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Salary max (€)</label>
              <input type="number" value={form.salary_max} onChange={update('salary_max')} />
            </div>
          </div>
          <div className="form-group">
            <label>Required skills (click to toggle)</label>
            <div>
              {allSkills.map((s) => (
                <span
                  key={s.id}
                  onClick={() => toggleSkill(s.id)}
                  className="chip-remove"
                  style={{
                    cursor: 'pointer',
                    background: selectedSkills.includes(s.id) ? '#2563eb' : '#eff6ff',
                    color: selectedSkills.includes(s.id) ? 'white' : '#1d4ed8',
                  }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post job'}
          </button>
        </form>
      </div>
    </div>
  );
}
