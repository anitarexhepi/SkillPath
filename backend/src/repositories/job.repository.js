const db = require('../config/db');

const createJob = async ({
  title,
  company,
  location,
  description,
  requirements,
  salary,
  createdBy
}) => {
  const [result] = await db.execute(
    `
    INSERT INTO jobs (
      title,
      company,
      location,
      description,
      requirements,
      salary,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      company,
      location,
      description,
      requirements,
      salary,
      createdBy
    ]
  );

  return result.insertId;
};

const getAllJobs = async () => {
  const [rows] = await db.execute(`
    SELECT
      jobs.*,
      users.first_name,
      users.last_name
    FROM jobs
    JOIN users
      ON jobs.created_by = users.id
    ORDER BY jobs.created_at DESC
  `);

  return rows;
};

module.exports = {
  createJob,
  getAllJobs
};