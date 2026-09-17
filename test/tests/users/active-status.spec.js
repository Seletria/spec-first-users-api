const { test, expect } = require('@playwright/test');
const { generateTestUser } = require('../../utils/test-data.utils');

test.describe('Active Status', () => {
  test('POST /users with no active status is saved as active', async ({ request }) => {
    const { name, email } = generateTestUser();
    const response = await request.post('/users', {
      data: {
        name,
        email,
      }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.active).toBe(true);
  });

  test('GET /users excludes inactive users from the list', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        email
      }
    });

    const created = await createResponse.json();

    await request.put(`/users/${created.id}`, {
      data: {
        name: created.name,
        active: false
      }
    });

    const listResponse = await request.get('/users');
    const list = await listResponse.json();
    const found = list.find(user => user.id === created.id);
    expect(found).toBeUndefined();
  });

  test('GET /users/:id still returns an inactive user', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        email
      }
    });

    const created = await createResponse.json();
    await request.put(`/users/${created.id}`, {
      data: {
        name: created.name,
        active: false
      }
    });

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);
    const user = await getResponse.json();
    expect(user.active).toBe(false);
  })
});