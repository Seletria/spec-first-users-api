const { test, expect } = require('@playwright/test');
const { createUser } = require('../../utils/api.utils');

test.describe('PUT /users/:id', () => {

  test('preserves existing email when omitted', async ({ request }) => {
    const { payload, user } = await createUser(request);

    const updateResponse = await request.put(`/users/${user.id}`, {
      data: {
        name: 'Updated Name'
      }
    });
    expect(updateResponse.status()).toBe(200);

    const getResponse = await request.get(`/users/${user.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();
    expect(fetched.email).toBe(payload.email);
  });

  test('updates name and role', async ({ request }) => {
    const { payload, user } = await createUser(request, { role: 'user' });

    const updateResponse = await request.put(`/users/${user.id}`, {
      data: {
        name: `${payload.name} Updated`,
        role: 'admin'
      }
    });
    expect(updateResponse.status()).toBe(200);

    const getResponse = await request.get(`/users/${user.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();

    expect(fetched.name).toBe(`${payload.name} Updated`);
    expect(fetched.role).toBe('admin');
  });

  test('refreshes updated_at and keeps created_at unchanged', async ({ request }) => {
    const { user } = await createUser(request);

    const updateResponse = await request.put(`/users/${user.id}`, {
      data: {
        name: `${user.name} Updated`
      }
    });
    expect(updateResponse.status()).toBe(200);

    const getResponse = await request.get(`/users/${user.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();

    expect(fetched.created_at).toBe(user.created_at);
    expect(fetched.updated_at).not.toBe(user.updated_at);
  });

  test('refreshes updated_at on each update', async ({ request }) => {
    const { user } = await createUser(request);

    await new Promise(resolve => setTimeout(resolve, 100));
    const firstUpdateResponse = await request.put(`/users/${user.id}`, {
      data: { name: `${user.name} First Update` }
    });
    expect(firstUpdateResponse.status()).toBe(200);

    const firstGetResponse = await request.get(`/users/${user.id}`);
    expect(firstGetResponse.status()).toBe(200);
    const afterFirstUpdate = await firstGetResponse.json();

    await new Promise(resolve => setTimeout(resolve, 100));
    const secondUpdateResponse = await request.put(`/users/${user.id}`, {
      data: { name: `${user.name} Second Update` }
    });
    expect(secondUpdateResponse.status()).toBe(200);

    const secondGetResponse = await request.get(`/users/${user.id}`);
    expect(secondGetResponse.status()).toBe(200);
    const afterSecondUpdate = await secondGetResponse.json();

    expect(afterFirstUpdate.created_at).toBe(user.created_at);
    expect(afterSecondUpdate.created_at).toBe(user.created_at);

    expect(afterFirstUpdate.updated_at).not.toBe(user.updated_at);
    expect(afterSecondUpdate.updated_at).not.toBe(afterFirstUpdate.updated_at);
  });

  test('rejects a request without a body with 400', async ({ request }) => {
    const { user } = await createUser(request);

    const response = await request.put(`/users/${user.id}`);
    expect(response.status()).toBe(400);
  });

  test('rejects a non-boolean active value with 400', async ({ request }) => {
    const { user } = await createUser(request);

    const response = await request.put(`/users/${user.id}`, {
      data: {
        name: user.name,
        active: 'yes'
      }
    });
    expect(response.status()).toBe(400);
  });

});