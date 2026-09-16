const pool = require('../db/pool');
const { DuplicateEmailError } = require('../errors/DuplicateEmailError');

async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users WHERE active = true');
  return result.rows;
}

async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function createUser(name, email, role = 'user', active = true) {
  try {
    const result = await pool.query('INSERT INTO users (name, email, role, active) VALUES ($1, $2, $3, $4) RETURNING *', [name.trim(), email.toLowerCase(), role, active]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new DuplicateEmailError();
    }
    throw error;
  }
}

async function updateUser(id, name, email, role, active) {
  const normalizedEmail = email !== undefined ? email.toLowerCase() : null;
  const normalizedRole = role !== undefined ? role : null;
  const normalizedActive = active !== undefined ? active : null;

  try {
    const result = await pool.query(
      `UPDATE users
       SET
         name = $1,
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         active = COALESCE($4, active),
         updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name.trim(), normalizedEmail, normalizedRole, normalizedActive, id]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new DuplicateEmailError();
    }
    throw error;
  }
}

async function deactivateUser(id) {
  const result = await pool.query('UPDATE users SET active = false WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
};