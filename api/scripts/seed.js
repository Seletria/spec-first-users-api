require('dotenv').config();
const { createUser } = require('../repository/users.repository');
const { DuplicateEmailError } = require('../errors/DuplicateEmailError');
const pool = require('../db/pool');

const seedUsers = [
  { name: 'Ayşe', email: 'ayse@example.com', role: 'admin', active: true },
  { name: 'Mehmet', email: 'mehmet@example.com', role: 'user', active: true },
  { name: 'Zeynep', email: 'zeynep@example.com', role: 'user', active: true },
];

async function seedDatabase() {
  for (const user of seedUsers) {
    try {
      await createUser(user.name, user.email, user.role, user.active);
      console.log(`✓ ${user.name} added.`);
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        console.log(`- ${user.name} already exists, skipping.`);
      } else {
        throw err;
      }
    }
  }
}

seedDatabase()
  .then(() => {
    console.log('Database seeding completed.');
    return pool.end();
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
    return pool.end();
  });