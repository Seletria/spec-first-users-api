const { test, expect } = require('@playwright/test');
const { createUser } = require('../../utils/api.utils');

test.describe('GET /users', () => {

  test('includes a newly created active user in the list', async ({ request }) => {
    const { payload, user } = await createUser(request);

    const listResponse = await request.get('/users');
    expect(listResponse.status()).toBe(200);
    const list = await listResponse.json();
    expect(Array.isArray(list)).toBe(true);

    const found = list.find(item => item.id === user.id);
    expect(found).toBeDefined();
    expect(found.email).toBe(payload.email);
    expect(found.active).toBe(true);
  });

  test('excludes inactive users from the list', async ({ request }) => {
    const { user } = await createUser(request);

    await request.put(`/users/${user.id}`, {
      data: {
        name: user.name,
        active: false
      }
    });

    const listResponse = await request.get('/users');
    const list = await listResponse.json();
    const found = list.find(item => item.id === user.id);
    expect(found).toBeUndefined();
  });

});

test.describe('GET /users/:id', () => {

  test('returns the created user', async ({ request }) => {
    const { payload, user } = await createUser(request, { role: 'admin' });

    const getResponse = await request.get(`/users/${user.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();

    expect(fetched.name).toBe(payload.name);
    expect(fetched.role).toBe('admin');
  });

  test('returns an inactive user', async ({ request }) => {
    const { user } = await createUser(request);

    await request.put(`/users/${user.id}`, {
      data: {
        name: user.name,
        active: false
      }
    });

    const getResponse = await request.get(`/users/${user.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();
    expect(fetched.active).toBe(false);
  });

});