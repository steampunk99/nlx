const { PrismaClient } = require('@prisma/client');
const userService = require('../services/user.service');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodeService = require('../services/node.service');
const { generateUsername } = require('../utils/userUtils');
const crypto = require('crypto');

class AuthController {
  /**
   * Register a new user
   * @param {Request} req 
   * @param {Response} res 
   */
  async register(req, res) {
    try {
      const { 
        email,
        password,
        firstName,
        lastName, 
        phone,
        country,
        position
      } = req.body;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Generate username from first and last name
      const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
      let username = baseUsername;
      let counter = 1;

      // Check username availability and append number if needed
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          position,
          country,
          status: 'ACTIVE',
          role: 'USER',
        }
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Create session
      await prisma.session.create({
        data: {
          id: crypto.randomBytes(32).toString('hex'),
          userId: user.id,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        }
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            position:user.position,
            country: user.country,
            isVerified: user.isVerified,
            createdAt: user.createdAt
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during registration'
      });
    }
  }

  /**
   * Login user
   * @param {Request} req 
   * @param {Response} res 
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate session ID
      const sessionId = crypto.randomBytes(32).toString('hex');

      // Create new session
      await prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        }
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id,
          sessionId,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { 
          userId: user.id,
          sessionId,
          type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            country: user.country,
            isVerified: user.isVerified,
            createdAt: user.createdAt
          },
          accessToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during login'
      });
    }
  }

  /**
   * Logout user
   * @param {Request} req 
   * @param {Response} res 
   */
  async logout(req, res) {
    try {
      const { authorization } = req.headers;
      const refreshToken = req.cookies.refreshToken;

      if (!authorization && !refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'No active session found'
        });
      }

      // Extract token from Authorization header
      const accessToken = authorization?.split(' ')[1];
      
      if (accessToken) {
        try {
          // Verify and decode access token
          const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
          
          // Remove session
          if (decoded.sessionId) {
            await userService.removeSession(decoded.userId, decoded.sessionId);
          }
        } catch (err) {
          // Token might be expired, try refresh token
          console.warn('Access token verification failed during logout:', err.message);
        }
      }

      if (refreshToken) {
        try {
          // Verify and decode refresh token
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          
          // Remove session
          if (decoded.sessionId) {
            await userService.removeSession(decoded.userId, decoded.sessionId);
          }
        } catch (err) {
          console.warn('Refresh token verification failed during logout:', err.message);
        }
      }

      // Clear cookies
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
  }

  /**
   * Refresh access token
   * @param {Request} req 
   * @param {Response} res 
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Generate new access token
      const accessToken = jwt.sign(
        { 
          userId: decoded.userId,
          sessionId: decoded.sessionId,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({
        success: true,
        message: 'Token refresh successful',
        data: {
          accessToken
        }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  /**
   * Verify email
   * @param {Request} req 
   * @param {Response} res 
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
      
      // Update user
      await userService.update(decoded.userId, { isVerified: true });

      res.json({
        success: true,
        message: 'Email verification successful'
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
  }

  /**
   * Resend verification email
   * @param {Request} req 
   * @param {Response} res 
   */
  async resendVerification(req, res) {
    try {
      const userId = req.user.id;

      // Get user
      const user = await userService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }

      // Generate verification token
      const verificationToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_EMAIL_SECRET,
        { expiresIn: '24h' }
      );

      // TODO: Send verification email

      res.json({
        success: true,
        message: 'Verification email sent'
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while resending verification email'
      });
    }
  }

  /**
   * Reset password request
   * @param {Request} req 
   * @param {Response} res 
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate reset token
      const resetToken = await userService.generatePasswordResetToken(user.id);

      // TODO: Send reset token via email
      // For now, just return it in response
      res.json({
        success: true,
        message: 'Password reset token generated',
        data: { resetToken }
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing password reset request'
      });
    }
  }

  /**
   * Reset password with token
   * @param {Request} req 
   * @param {Response} res 
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      const userId = await userService.verifyPasswordResetToken(token);
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      await userService.updatePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Password reset successful'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting password'
      });
    }
  }

  /**
   * Change password while logged in
   * @param {Request} req 
   * @param {Response} res 
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await userService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await userService.update(userId, hashedPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error changing password'
      });
    }
  }

  /**
   * Get user profile
   * @param {Request} req 
   * @param {Response} res 
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await userService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          country: user.country,
          role: user.role,
          status: user.status
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting profile'
      });
    }
  }

  /**
   * Update user profile
   * @param {Request} req 
   * @param {Response} res 
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone, country } = req.body;

      const user = await userService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user profile
      await userService.update(userId, {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone || user.phone,
        country: country || user.country
      });

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile'
      });
    }
  }


  /**
   * Get user sessions
   * @param {Request} req 
   * @param {Response} res 
   */
  async getSessions(req, res) {
    try {
      const userId = req.user.id;

      const sessions = await userService.getUserSessions(userId);

      res.json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting sessions'
      });
    }
  }



  /**
   * Terminate specific session
   * @param {Request} req 
   * @param {Response} res 
   */
  async terminateSession(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      await userService.removeSession(userId, sessionId);

      res.json({
        success: true,
        message: 'Session terminated successfully'
      });

    } catch (error) {
      console.error('Terminate session error:', error);
      res.status(500).json({
        success: false,
        message: 'Error terminating session'
      });
    }
  }

  /**
   * Terminate all sessions except current
   * @param {Request} req 
   * @param {Response} res 
   */
  async terminateAllSessions(req, res) {
    try {
      const userId = req.user.id;
      const currentSessionId = req.sessionId;

      await userService.removeOtherSessions(userId, currentSessionId);

      res.json({
        success: true,
        message: 'All other sessions terminated successfully'
      });

    } catch (error) {
      console.error('Terminate all sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error terminating sessions'
      });
    }
  }
}

module.exports = new AuthController();
