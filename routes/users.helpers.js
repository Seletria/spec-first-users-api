const findUserById = (users, id) => {
  return users.find(user => user.id === id);
};

const isEmailTaken = (users, email, excludedUserId) => {
  return users.some(user => {
    const isDifferentUser = user.id !== excludedUserId;
    return isDifferentUser && user.email && user.email.toLowerCase() === email.toLowerCase();
  });
};

module.exports = {
  findUserById,
  isEmailTaken,
};