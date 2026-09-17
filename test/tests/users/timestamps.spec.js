const { test, expect } = require('@playwright/test');
const { generateTestUser } = require('../../utils/test-data.utils');

test.describe('Timestamps', () => {

  test('POST /users creates user with a valid created_at timestamp', async ({ request }) => {
    const { name, email } = generateTestUser();
    const response = await request.post('/users', {
      data: {
        name,
        email,
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(body.created_at).toString()).not.toBe('Invalid Date');
  });

  test('PUT /users/:id refreshes updated_at but keeps created_at unchanged', async ({ request }) => {
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
        name: `${name} Updated`
      }
    });

    expect(updateResponse.status()).toBe(200);

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);

    const fetched = await getResponse.json();
    expect(fetched.created_at).toBe(created.created_at);
    expect(fetched.updated_at).not.toBe(created.updated_at);

  });

  test('PUT /users/:id twice keeps created_at unchanged and refreshes updated_at each time', async ({ request }) => {
    const { name, email } = generateTestUser();
    const createResponse = await request.post('/users', {
      data: {
        name,
        email
      }
    });

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    await new Promise(resolve => setTimeout(resolve, 100));
    const firstUpdateResponse = await request.put(`/users/${created.id}`, {
      data: { name: `${name} First Update` }
    });
    expect(firstUpdateResponse.status()).toBe(200);

    const firstGetResponse = await request.get(`/users/${created.id}`);
    expect(firstGetResponse.status()).toBe(200);
    const afterFirstUpdate = await firstGetResponse.json();

    await new Promise(resolve => setTimeout(resolve, 100));
    const secondUpdateResponse = await request.put(`/users/${created.id}`, {
      data: { name: `${name} Second Update` }
    });
    expect(secondUpdateResponse.status()).toBe(200);

    const secondGetResponse = await request.get(`/users/${created.id}`);
    expect(secondGetResponse.status()).toBe(200);
    const afterSecondUpdate = await secondGetResponse.json();

    expect(afterFirstUpdate.created_at).toBe(created.created_at);
    expect(afterSecondUpdate.created_at).toBe(created.created_at);

    expect(afterFirstUpdate.updated_at).not.toBe(created.updated_at);
    expect(afterSecondUpdate.updated_at).not.toBe(afterFirstUpdate.updated_at);
  });
});