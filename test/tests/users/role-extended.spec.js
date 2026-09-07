const { test, expect } = require('@playwright/test');

test.describe('Role Validation - Extended Enum', () => {

  test('POST /users with role "moderator" is accepted and saved as given', async ({ request }) => {
    const response = await request.post('/users', {
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'moderator'
      }
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.role).toBe('moderator');
  });

  // TODO: verify whether case-insensitive normalization (Admin -> admin)
  // also applies to `moderator` (e.g. "Moderator", "MODERATOR").
  // BUSINESS-LOGIC.md doesn't explicitly scope this rule to admin/user only,
  // needs clarification before writing the test.


});

