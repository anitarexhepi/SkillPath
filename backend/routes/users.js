const express = require('express');
const pool = require('../src/config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me/skills
router.get('/me/skills', auth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.name, us.level
     FROM user_skills us
     JOIN skills s ON s.id = us.skill_id
     WHERE us.user_id = ?
     ORDER BY s.name`,
    [req.user.id]
  );
  res.json(rows);
});

// POST /api/users/me/skills    body: { skill_id, level } OR { name, level }
router.post('/me/skills', auth, async (req, res) => {
  try {
    let { skill_id, name, level } = req.body;
    level = level || 'intermediate';

    if (!skill_id && name) {
      // create the skill if it doesn't exist (case-insensitive lookup)
      const [existing] = await pool.query('SELECT id FROM skills WHERE LOWER(name) = LOWER(?)', [name]);
      if (existing.length) {
        skill_id = existing[0].id;
      } else {
        const [r] = await pool.query('INSERT INTO skills (name) VALUES (?)', [name.trim()]);
        skill_id = r.insertId;
      }
    }
    if (!skill_id) return res.status(400).json({ error: 'skill_id or name is required' });

    await pool.query(
      `INSERT INTO user_skills (user_id, skill_id, level)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE level = VALUES(level)`,
      [req.user.id, skill_id, level]
    );
    res.status(201).json({ ok: true, skill_id, level });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/me/skills/:skillId
router.delete('/me/skills/:skillId', auth, async (req, res) => {
  await pool.query('DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?', [
    req.user.id,
    req.params.skillId,
  ]);
  res.json({ ok: true });
});

// PUT /api/users/me  body: { name, location, bio }
router.put('/me', auth, async (req, res) => {
  const { name, location, bio } = req.body;
  await pool.query('UPDATE users SET name = COALESCE(?, name), location = ?, bio = ? WHERE id = ?', [
    name,
    location || null,
    bio || null,
    req.user.id,
  ]);
  const [rows] = await pool.query(
    'SELECT id, name, email, role, location, bio FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(rows[0]);
});

// GET /api/users/skills/all   - list of all skills (for autocomplete)
router.get('/skills/all', async (req, res) => {
  const [rows] = await pool.query('SELECT id, name FROM skills ORDER BY name');
  res.json(rows);
});

module.exports = router;
