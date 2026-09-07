const { test, expect } = require('@playwright/test');

test('GET /health-check returns 200 and expected shape', async ({ request }) => {
  const response = await request.get('/health-check');

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.message).toBe('API is running');
  expect(body.endpoints).toEqual(['/health-check', '/users', '/users/:id']);
});