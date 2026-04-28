const express = require('express');
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/applications/me   - current user's applications
router.get('/me', auth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, j.title, j.company, j.location, j.industry
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// POST /api/applications   body: { job_id, cover_letter }
router.post('/', auth, async (req, res) => {
  try {
    const { job_id, cover_letter } = req.body;
    if (!job_id) return res.status(400).json({ error: 'job_id is required' });

    await pool.query(
      `INSERT INTO applications (user_id, job_id, cover_letter)
       VALUES (?, ?, ?)`,
      [req.user.id, job_id, cover_letter || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'Job not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/applications/job/:jobId   (admin only)
router.get('/job/:jobId', auth, adminOnly, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS user_name, u.email AS user_email
       FROM applications a
       JOIN users u ON u.id = a.user_id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC`,
    [req.params.jobId]
  );
  res.json(rows);
});

// PUT /api/applications/:id/status   body: { status }   (admin only)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'reviewed', 'accepted', 'rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
  }
  await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
