const { test, expect } = require('@playwright/test');

test.describe('User Lifecycle', () => {

  test('POST /users then GET /users/:id returns the created user', async ({ request }) => {
    const createResponse = await request.post('/users', {
      data: {
        name: 'Lifecycle Create User',
        role: 'admin',
        email: 'lifecycle.create@example.com'
      }
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();

    expect(fetched.name).toBe('Lifecycle Create User');
    expect(fetched.role).toBe('admin');
  });

  test('PUT /users/:id then GET /users/:id returns updated data', async ({ request }) => {
    const createResponse = await request.post('/users', {
      data: {
        name: 'Lifecycle Original Name',
        role: 'user',
        email: 'lifecycle.original@example.com'
      }
    });
    const created = await createResponse.json();

    const updateResponse = await request.put(`/users/${created.id}`, {
      data: {
        name: 'Lifecycle Updated Name',
        role: 'admin'
      }
    });
    expect(updateResponse.status()).toBe(200);

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();

    expect(fetched.name).toBe('Lifecycle Updated Name');
    expect(fetched.role).toBe('admin');
  });

  test('DELETE /users/:id then GET /users/:id returns 404', async ({ request }) => {
    const createResponse = await request.post('/users', {
      data: {
        name: 'Lifecycle Delete User',
        role: 'user',
        email: 'lifecycle.delete@example.com'
      }
    });
    const created = await createResponse.json();

    const deleteResponse = await request.delete(`/users/${created.id}`);
    expect(deleteResponse.status()).toBe(204);

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(404);
  });

  test('DELETE /users/:id twice — second call returns 404', async ({ request }) => {
    const createResponse = await request.post('/users', {
      data: {
        name: 'Lifecycle Double Delete User',
        role: 'user',
        email: 'lifecycle.double.delete@example.com'
      }
    });
    const created = await createResponse.json();

    const firstDelete = await request.delete(`/users/${created.id}`);
    expect(firstDelete.status()).toBe(204);

    const secondDelete = await request.delete(`/users/${created.id}`);
    expect(secondDelete.status()).toBe(404);
  });

});