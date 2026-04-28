import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [skillName, setSkillName] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });
  const [msg, setMsg] = useState('');

  async function loadSkills() {
    const r = await api.get('/users/me/skills');
    setSkills(r.data);
  }
  async function loadAllSkills() {
    const r = await api.get('/users/skills/all');
    setAllSkills(r.data);
  }

  useEffect(() => {
    loadSkills();
    loadAllSkills();
  }, []);

  async function addSkill(e) {
    e.preventDefault();
    if (!skillName.trim()) return;
    await api.post('/users/me/skills', { name: skillName.trim(), level });
    setSkillName('');
    setLevel('intermediate');
    await loadSkills();
    await loadAllSkills();
  }

  async function removeSkill(skillId) {
    await api.delete(`/users/me/skills/${skillId}`);
    await loadSkills();
  }

  async function saveProfile(e) {
    e.preventDefault();
    setMsg('');
    const r = await api.put('/users/me', profile);
    setUser(r.data);
    setMsg('Profile updated.');
    setTimeout(() => setMsg(''), 2500);
  }

  return (
    <div className="container">
      <h1>Your profile</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>About you</h2>
        {msg && <div className="success">{msg}</div>}
        <form onSubmit={saveProfile}>
          <div className="form-group">
            <label>Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Save profile</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Your skills</h2>
        <p style={{ color: '#6b7280', marginTop: 0 }}>
          The more skills you add, the better we can match you to the right jobs.
        </p>

        <div style={{ marginBottom: 16 }}>
          {skills.length === 0 && <p style={{ color: '#6b7280' }}>You haven't added any skills yet.</p>}
          {skills.map((s) => (
            <span key={s.id} className="chip-remove">
              {s.name} <small style={{ opacity: 0.7 }}>({s.level})</small>
              <button onClick={() => removeSkill(s.id)} title="Remove">×</button>
            </span>
          ))}
        </div>

        <form onSubmit={addSkill} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 220px', marginBottom: 0 }}>
            <label>Add a skill</label>
            <input
              list="skill-suggestions"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Customer Service"
            />
            <datalist id="skill-suggestions">
              {allSkills.map((s) => <option key={s.id} value={s.name} />)}
            </datalist>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Add</button>
        </form>
      </div>
    </div>
  );
}
