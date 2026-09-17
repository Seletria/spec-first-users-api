const { test, expect } = require('@playwright/test');
const { createUser } = require('../../utils/api.utils');
const { generateTestUser } = require('../../utils/test-data.utils');

test.describe('POST /users', () => {

  test('creates a user with the provided email', async ({ request }) => {
    const { payload, user } = await createUser(request);

    expect(user.email).toBe(payload.email);
  });

  test('rejects invalid email format with 400', async ({ request }) => {
    const response = await request.post('/users', {
      data: {
        name: 'Invalid Email User',
        email: 'invalid-email-format.com'
      }
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.message).toContain('email');
  });

  test('rejects a request without a body with 400', async ({ request }) => {
    const response = await request.post('/users');
    expect(response.status()).toBe(400);
  });

  test('rejects a non-boolean active value with 400', async ({ request }) => {
    const { name, email } = generateTestUser();
    const response = await request.post('/users', {
      data: {
        name,
        email,
        active: 'yes'
      }
    });
    expect(response.status()).toBe(400);
  });

  test('rejects active: null with 400', async ({ request }) => {
    const { name, email } = generateTestUser();
    const response = await request.post('/users', {
      data: {
        name,
        email,
        active: null
      }
    });
    expect(response.status()).toBe(400);
  });

  test('rejects a duplicate email with 409', async ({ request }) => {
    const { payload } = await createUser(request);

    const duplicateResponse = await request.post('/users', {
      data: {
        name: `${payload.name} Duplicate`,
        email: payload.email
      }
    });
    expect(duplicateResponse.status()).toBe(409);
  });

  test('rejects a duplicate email in different case with 409', async ({ request }) => {
    const { payload } = await createUser(request);

    const duplicateResponse = await request.post('/users', {
      data: {
        name: `${payload.name} Duplicate`,
        email: payload.email.toUpperCase()
      }
    });
    expect(duplicateResponse.status()).toBe(409);
  });

  test('accepts role "moderator" and saves it', async ({ request }) => {
    const { user } = await createUser(request, { role: 'moderator' });

    expect(user.role).toBe('moderator');
  });

  test('normalizes a mixed-case "Moderator" role to lowercase', async ({ request }) => {
    const { user } = await createUser(request, { role: 'Moderator' });

    expect(user.role).toBe('moderator');
  });

  test('creates a user as active by default', async ({ request }) => {
    const { user } = await createUser(request);

    expect(user.active).toBe(true);
  });

  test('creates a user with a valid created_at timestamp', async ({ request }) => {
    const { user } = await createUser(request);

    expect(user.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(user.created_at).toString()).not.toBe('Invalid Date');
  });

});