const { test, expect } = require('@playwright/test');
const { generateTestUser } = require('../../utils/test-data.utils');

test.describe('User Lifecycle', () => {

  test('POST /users then GET /users/:id returns the created user', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        role: 'admin',
        email
      }
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();

    expect(fetched.name).toBe(name);
    expect(fetched.role).toBe('admin');
  });

  test('PUT /users/:id then GET /users/:id returns updated data', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        role: 'user',
        email
      }
    });
    const created = await createResponse.json();

    const updateResponse = await request.put(`/users/${created.id}`, {
      data: {
        name: `${name} Updated`,
        role: 'admin'
      }
    });
    expect(updateResponse.status()).toBe(200);

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();

    expect(fetched.name).toBe(`${name} Updated`);
    expect(fetched.role).toBe('admin');
  });

  test('DELETE /users/:id soft-deletes and GET /users/:id still returns the user', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        role: 'user',
        email
      }
    });
    const created = await createResponse.json();

    const deleteResponse = await request.delete(`/users/${created.id}`);
    expect(deleteResponse.status()).toBe(204);

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();
    expect(fetched.active).toBe(false);
  });

  test('DELETE /users/:id twice — second call is idempotent and returns 204', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        role: 'user',
        email
      }
    });
    const created = await createResponse.json();

    const firstDelete = await request.delete(`/users/${created.id}`);
    expect(firstDelete.status()).toBe(204);

    const secondDelete = await request.delete(`/users/${created.id}`);
    expect(secondDelete.status()).toBe(204);
  });

});