const { AppError } = require('./AppError');

class DuplicateEmailError extends AppError {
  constructor() {
    super('This email address is already registered.', 409);
  }
}

module.exports = {
  DuplicateEmailError
};