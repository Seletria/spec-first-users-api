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

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};