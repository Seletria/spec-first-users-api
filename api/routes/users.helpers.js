const generateUserId = (users) => {
  return users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
};

module.exports = {
  generateUserId,
};