import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/me')
      .then((r) => setApps(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p>Loading…</p></div>;

  return (
    <div className="container">
      <h1>My applications</h1>
      {apps.length === 0 ? (
        <p>You haven't applied to any jobs yet. <Link to="/jobs">Browse jobs</Link>.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Location</th>
              <th>Applied</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td><Link to={`/jobs/${a.job_id}`}>{a.title}</Link></td>
                <td>{a.company}</td>
                <td>{a.location || '—'}</td>
                <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                <td><span className={`status status-${a.status}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
