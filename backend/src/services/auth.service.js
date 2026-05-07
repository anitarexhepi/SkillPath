const bcrypt = require('bcryptjs');

const authRepository = require('../repositories/auth.repository');
const {
  generateAccessToken,
  generateRefreshToken
} = require('../utils/token.util');

const register = async ({ firstName, lastName, email, password }) => {
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userId = await authRepository.createUser({
    firstName,
    lastName,
    email,
    passwordHash
  });

  return {
    id: userId,
    firstName,
    lastName,
    email
  };
};

const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error('User account is inactive');
    error.statusCode = 403;
    throw error;
  }

  const payload = {
    id: user.id,
    email: user.email
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    },
    accessToken,
    refreshToken
  };
};

module.exports = {
  register,
  login
};