const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const assignedRole = ['owner', 'respondent', 'admin'].includes(role) ? role : 'owner';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole
    });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401);
      throw new Error('Refresh token is required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      res.status(403);
      throw new Error('Invalid refresh token');
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    res.status(403);
    next(new Error('Refresh token expired or invalid'));
  }
};

const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshToken');
    if (user) {
      user.refreshToken = '';
      await user.save({ validateBeforeSave: false });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshAccessToken, logout };
