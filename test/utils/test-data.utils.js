const { faker } = require('@faker-js/faker');
const { randomUUID } = require('crypto');

function generateTestUser() {
  const uniqueName = randomUUID();
  return {
    name: faker.person.fullName(),
    email: `test.${uniqueName}@example.com`,
  }
}

module.exports = {
  generateTestUser,
};