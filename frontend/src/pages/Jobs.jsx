import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function MatchBadge({ percent }) {
  if (percent == null) return null;
  let cls = 'match-low';
  if (percent >= 70) cls = 'match-high';
  else if (percent >= 40) cls = 'match-mid';
  return <span className={`match-badge ${cls}`}>{percent}% match</span>;
}

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (industry) params.industry = industry;
    if (location) params.location = location;
    if (user) params.match = '1';
    const r = await api.get('/jobs', { params });
    setJobs(r.data);
    setLoading(false);
  }

  useEffect(() => {
    api.get('/jobs/industries').then((r) => setIndustries(r.data));
    api.get('/jobs/locations').then((r) => setLocations(r.data));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [user]);

  function onSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <div className="container jobs-page">
      <h1>Browse jobs</h1>
      {user && (
        <p style={{ color: '#6b7280', marginTop: -10 }}>
          Sorted by best skill match for you. Add more skills on your{' '}
          <Link to="/profile">profile</Link> to improve matches.
        </p>
      )}

      <form className="filters" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Search title, company, keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">All industries</option>
          {industries.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? (
        <p>Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div className="job-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>
                {job.title}
                <MatchBadge percent={job.match_percent} />
              </h3>
              <div className="company">{job.company}</div>
              <div className="meta">
                {job.location && <span>{job.location}</span>}
                {job.industry && <span>{job.industry}</span>}
                {job.job_type && <span>{job.job_type}</span>}
                {(job.salary_min || job.salary_max) && (
                  <span>
                    €{job.salary_min || '?'} – €{job.salary_max || '?'}
                  </span>
                )}
              </div>
              <div className="skills">
                {(job.skills || []).slice(0, 6).map((s) => (
                  <span key={s} className="skill-pill">{s}</span>
                ))}
              </div>
              <div className="actions">
                <Link to={`/jobs/${job.id}`} className="btn-primary">View & apply</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
