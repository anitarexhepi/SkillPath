// Run after importing database.sql:  npm run seed
// Creates demo users with proper bcrypt hashes, gives them skills,
// and adds one sample application.

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const demoUsers = [
    ['Admin', 'admin@skillpath.com', adminHash, 'admin', 'Pristina', 'Platform admin'],
    ['Anna Smith', 'anna@example.com', userHash, 'user', 'Pristina', 'Designer with 3 years of experience.'],
    ['Ben Doe', 'ben@example.com', userHash, 'user', 'Tirana', 'Full-stack developer.'],
    ['Clara Rossi', 'clara@example.com', userHash, 'user', 'Berlin', 'Nurse looking for new role.'],
  ];

  for (const u of demoUsers) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, location, bio)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash),
                               role = VALUES(role),
                               location = VALUES(location),
                               bio = VALUES(bio)`,
      u
    );
  }

  // Look up the demo users we just upserted
  const [rows] = await pool.query(
    "SELECT id, email FROM users WHERE email IN ('anna@example.com','ben@example.com','clara@example.com')"
  );
  const idByEmail = Object.fromEntries(rows.map((r) => [r.email, r.id]));

  // Helper to fetch a skill id by name
  async function skillId(name) {
    const [r] = await pool.query('SELECT id FROM skills WHERE name = ?', [name]);
    if (!r.length) throw new Error(`Skill not found: ${name}. Did you import database.sql?`);
    return r[0].id;
  }

  const userSkills = [
    [idByEmail['anna@example.com'],  await skillId('UI Design'),    'advanced'],
    [idByEmail['anna@example.com'],  await skillId('Figma'),        'expert'],
    [idByEmail['anna@example.com'],  await skillId('Communication'),'advanced'],
    [idByEmail['ben@example.com'],   await skillId('JavaScript'),   'expert'],
    [idByEmail['ben@example.com'],   await skillId('React'),        'advanced'],
    [idByEmail['ben@example.com'],   await skillId('Node.js'),      'advanced'],
    [idByEmail['ben@example.com'],   await skillId('SQL'),          'intermediate'],
    [idByEmail['clara@example.com'], await skillId('Patient Care'), 'expert'],
    [idByEmail['clara@example.com'], await skillId('First Aid'),    'advanced'],
    [idByEmail['clara@example.com'], await skillId('Communication'),'advanced'],
  ];

  for (const us of userSkills) {
    await pool.query(
      `INSERT INTO user_skills (user_id, skill_id, level)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE level = VALUES(level)`,
      us
    );
  }

  // Sample application from Ben to the Frontend Developer job (id 1, if present)
  const [jobs] = await pool.query("SELECT id FROM jobs WHERE title = 'Frontend Developer' LIMIT 1");
  if (jobs.length) {
    await pool.query(
      `INSERT IGNORE INTO applications (user_id, job_id, cover_letter, status)
       VALUES (?, ?, ?, 'pending')`,
      [idByEmail['ben@example.com'], jobs[0].id, 'I would love to join Acme Tech as a frontend developer.']
    );
  }

  console.log('Seed complete.');
  console.log('Login as:');
  console.log('  admin@skillpath.com / admin123  (admin)');
  console.log('  anna@example.com    / user123');
  console.log('  ben@example.com     / user123');
  console.log('  clara@example.com   / user123');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
