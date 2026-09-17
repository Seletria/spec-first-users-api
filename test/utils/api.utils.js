const { expect } = require('@playwright/test');
const { generateTestUser } = require('./test-data.utils');

async function createUser(request, overrides = {}) {
  const payload = { ...generateTestUser(), ...overrides };
  const response = await request.post('/users', { data: payload });
  expect(response.status()).toBe(201);
  const user = await response.json();
  return { payload, user };
}

module.exports = {
  createUser,
};