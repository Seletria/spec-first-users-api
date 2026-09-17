const { test, expect } = require('@playwright/test');
const { generateTestUser } = require('../../utils/test-data.utils');

test.describe('Email Validation', () => {
  test('POST /users with valid email format is accepted and saved as given', async ({ request }) => {
    const { name, email } = generateTestUser();
    const response = await request.post('/users', {
      data: {
        name,
        email
      }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.email).toBe(email);
  });

  test('POST /users with invalid email format is rejected', async ({ request }) => {
    const { name } = generateTestUser();
    const response = await request.post('/users', {
      data: {
        name,
        email: 'invalid-email-format.com'
      }
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.message).toContain('email');
  });

  test('POST /users with not unique email is rejected', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        email
      }
    });
    expect(createResponse.status()).toBe(201);

    const duplicateResponse = await request.post('/users', {
      data: {
        name: `${name} Duplicate`,
        email
      }
    });
    expect(duplicateResponse.status()).toBe(409);
  });

  test('POST /users with duplicate email in different case is rejected', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        email
      }
    });
    expect(createResponse.status()).toBe(201);

    const duplicateResponse = await request.post('/users', {
      data: {
        name: `${name} Duplicate`,
        email: email.toUpperCase()
      }
    });
    expect(duplicateResponse.status()).toBe(409);
  });

  test('PUT /users/:id without email preserves existing email', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        email
      }
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    const updateResponse = await request.put(`/users/${created.id}`, {
      data: {
        name: 'Updated Name'
      }
    });
    expect(updateResponse.status()).toBe(200);

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();
    expect(fetched.email).toBe(email);
  });
});