const { test, expect } = require('@playwright/test');

test.describe('Timestamps', () => {

  test('POST /users creates user with a valid createdAt timestamp', async ({ request }) => {
    const response = await request.post('/users', {
      data: {
        name: 'example test name',
        email: 'exampletestname@gmail.com',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(body.createdAt).toString()).not.toBe('Invalid Date');
  });

  test('PUT /users/:id refreshes updatedAt but keeps createdAt unchanged', async ({ request }) => {
    const createResponse = await request.post('/users', {
      data: {
        name: 'Betty Boop',
        email: 'bettyboop123@gmail.com'
      }
    });

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    const updateResponse = await request.put(`/users/${created.id}`, {
      data: {
        name: 'Betty Boop Updated'
      }
    });

    expect(updateResponse.status()).toBe(200);

    const getResponse = await request.get(`/users/${created.id}`);
    expect(getResponse.status()).toBe(200);

    const fetched = await getResponse.json();
    expect(fetched.createdAt).toBe(created.createdAt);
    expect(fetched.updatedAt).not.toBe(created.updatedAt);

  });

  test('PUT /users/:id twice keeps createdAt unchanged and refreshes updatedAt each time', async ({ request }) => {
    const createResponse = await request.post('/users', {
      data: {
        name: 'Double Update Test',
        email: 'doubleupdatetest99@gmail.com'
      }
    });

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    await new Promise(resolve => setTimeout(resolve, 100));
    const firstUpdateResponse = await request.put(`/users/${created.id}`, {
      data: { name: 'Double Update Test - First Update' }
    });
    expect(firstUpdateResponse.status()).toBe(200);

    const firstGetResponse = await request.get(`/users/${created.id}`);
    expect(firstGetResponse.status()).toBe(200);
    const afterFirstUpdate = await firstGetResponse.json();

    await new Promise(resolve => setTimeout(resolve, 100));
    const secondUpdateResponse = await request.put(`/users/${created.id}`, {
      data: { name: 'Double Update Test - Second Update' }
    });
    expect(secondUpdateResponse.status()).toBe(200);

    const secondGetResponse = await request.get(`/users/${created.id}`);
    expect(secondGetResponse.status()).toBe(200);
    const afterSecondUpdate = await secondGetResponse.json();

    expect(afterFirstUpdate.createdAt).toBe(created.createdAt);
    expect(afterSecondUpdate.createdAt).toBe(created.createdAt);

    expect(afterFirstUpdate.updatedAt).not.toBe(created.updatedAt);
    expect(afterSecondUpdate.updatedAt).not.toBe(afterFirstUpdate.updatedAt);
  });
});