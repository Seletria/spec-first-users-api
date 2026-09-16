const express = require('express');
const { createUser, getAllUsers, getUserById, updateUser, deactivateUser } = require('../repository/users.repository');
const router = express.Router();

const SEED_TIMESTAMP = new Date('2026-01-01T00:00:00.000Z').toISOString();

const users = [
  { id: 1, name: 'Ayşe', role: 'admin', active: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  { id: 2, name: 'Mehmet', role: 'user', active: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  { id: 3, name: 'Zeynep', role: 'user', active: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP }
];

const MESSAGES = {
  NAME_REQUIRED: 'Name is required and must be a non-empty string',
  USER_NOT_FOUND: 'User not found',
  INVALID_ROLE: 'Invalid role',
  EMAIL_REQUIRED: 'Email is required and must be a valid email address',
  EMAIL_TAKEN: 'Email is already taken',
  INVALID_ID: 'Invalid user id',
};

const isValidId = (id) => {
  return Number.isInteger(id) && id > 0;
};

const isValidEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const VALID_ROLES = ['admin', 'user', 'moderator'];

const isValidName = (name) => {
  return typeof name === 'string' && name.trim() !== '';
};

const isValidRole = (role) => {
  if (typeof role !== 'string') return false;
  return VALID_ROLES.includes(normalizeRole(role));
};

const normalizeRole = (role) => {
  return role.toLowerCase();
};

router.get('/', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({ message: MESSAGES.INVALID_ID });
  }

  const user = await getUserById(id);

  if (!user) {
    return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND });
  }

  res.json(user);
});

router.post('/', async (req, res) => {
  const { name, role, active, email } = req.body;

  if (!isValidName(name)) {
    return res.status(400).json({ message: MESSAGES.NAME_REQUIRED });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: MESSAGES.EMAIL_REQUIRED });
  }

  if (role !== undefined && !isValidRole(role)) {
    return res.status(400).json({ message: MESSAGES.INVALID_ROLE });
  }

  const normalizedRole = role !== undefined ? normalizeRole(role) : 'user';
  const resolvedActive = active !== undefined ? active : true;

  const newUser = await createUser(name, email, normalizedRole, resolvedActive);
  res.status(201).json(newUser);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, role, active, email } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ message: MESSAGES.INVALID_ID });
  }

  if (!isValidName(name)) {
    return res.status(400).json({ message: MESSAGES.NAME_REQUIRED });
  }

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: MESSAGES.EMAIL_REQUIRED });
    }
  }

  if (role !== undefined && !isValidRole(role)) {
    return res.status(400).json({ message: MESSAGES.INVALID_ROLE });
  }

  const normalizedRole = role !== undefined ? normalizeRole(role) : undefined;

  const updatedUser = await updateUser(id, name, email, normalizedRole, active);
  if (!updatedUser) {
    return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND });
  }

  res.json(updatedUser);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({ message: MESSAGES.INVALID_ID });
  }

  const result = await deactivateUser(id)

  if (!result) {
    return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND });
  }
  res.status(204).send();
});

module.exports = router;