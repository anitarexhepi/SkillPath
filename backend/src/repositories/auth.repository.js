const db = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    `
      SELECT *
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0];
};

const createUser = async ({
  firstName,
  lastName,
  email,
  passwordHash
}) => {
  const [result] = await db.execute(
    `
      INSERT INTO users
      (
        first_name,
        last_name,
        email,
        password_hash,
        is_active,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, NOW())
    `,
    [
      firstName,
      lastName,
      email,
      passwordHash,
      true
    ]
  );

  return result.insertId;
};

module.exports = {
  findUserByEmail,
  createUser
};