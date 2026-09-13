const pool = require('../db/pool');

async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
}

async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function createUser(name, email) {
  try {
    const result = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('This email address is already registered.');
    }
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};