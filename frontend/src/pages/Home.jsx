import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <h1>Find a career that fits you.</h1>
        <p>
          SkillPath matches your skills to real jobs across every industry —
          from healthcare and education to construction, design, and tech.
        </p>
        {user ? (
          <Link to="/jobs" className="btn-primary">Browse matched jobs</Link>
        ) : (
          <Link to="/register" className="btn-primary">Create a free account</Link>
        )}
      </section>

      <section className="features">
        <div className="feature">
          <h3>1. Build your skill profile</h3>
          <p>Add the skills you actually have — from "Patient Care" to "Welding" to "JavaScript".</p>
        </div>
        <div className="feature">
          <h3>2. See your match score</h3>
          <p>Every job shows how much of its required skills you already have.</p>
        </div>
        <div className="feature">
          <h3>3. Apply in one click</h3>
          <p>Send a quick cover letter and track your applications in one place.</p>
        </div>
      </section>
    </>
  );
}
