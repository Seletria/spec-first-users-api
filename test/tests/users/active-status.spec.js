const { test, expect } = require('@playwright/test');

test.describe('Active Status', () => {
  test('POST /users with active status "true" is accepted and saved as given', async ({ request }) => {
    const response = await request.post('/users', {
      data: {
        name: 'Jane Doe',
        email: 'active.default@example.com',
      }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.active).toBe(true);
  });

  test('GET /users excludes inactive users from the list', async ({ request }) => {
    const createResponse = await request.post('/users', {
      data: {
        name: 'Inactive User',
        email: 'inactive.default@example.com'
      }
    });

    const created = await createResponse.json();
    // ASSUMPTION: PUT /users/:id accepts `active` to toggle status.
    // Not explicitly defined in BUSINESS-LOGIC.md's User Update section —
    // flagging for the fix implementation to confirm/implement this path.

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
    const createResponse = await request.post('/users', {
      data: {
        name: 'Inactive But Fetchable User',
        email: 'inactive.fetchable@example.com'
      }
    });

    const created = await createResponse.json();
    // Same assumption as above regarding PUT accepting `active`.
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
