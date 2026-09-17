const { test, expect } = require('@playwright/test');
const { createUser } = require('../../utils/api.utils');

test.describe('DELETE /users/:id', () => {

  test('soft-deletes the user and leaves it fetchable', async ({ request }) => {
    const { user } = await createUser(request);

    const deleteResponse = await request.delete(`/users/${user.id}`);
    expect(deleteResponse.status()).toBe(204);

    const getResponse = await request.get(`/users/${user.id}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();
    expect(fetched.active).toBe(false);
  });

  test('is idempotent; a second DELETE returns 204', async ({ request }) => {
    const { user } = await createUser(request);

    const firstDelete = await request.delete(`/users/${user.id}`);
    expect(firstDelete.status()).toBe(204);

    const secondDelete = await request.delete(`/users/${user.id}`);
    expect(secondDelete.status()).toBe(204);
  });

});