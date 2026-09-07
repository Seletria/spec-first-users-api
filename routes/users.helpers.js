const findUserById = (users, id) => {
  return users.find(user => user.id === id);
};

const findUserIndex = (users, id) => {
  return users.findIndex(user => user.id === id);
};

const isEmailTaken = (users, email, excludedUserId) => {
  return users.some(user => {
    const isDifferentUser = user.id !== excludedUserId;
    return isDifferentUser && user.email && user.email.toLowerCase() === email.toLowerCase();
  });
};

const generateUserId = (users) => {
  return users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
};

module.exports = {
  findUserById,
  findUserIndex,
  isEmailTaken,
  generateUserId,
};