const userService = require('../services/user.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const nodePackageService = require('../services/nodePackage.service');
const nodeWithdrawalService = require('../services/nodeWithdrawal.service');
const nodePaymentService = require('../services/nodePayment.service');
const { validatePackage } = require('../middleware/validate');
const { prisma } = require('../config/prisma');
const logger = require('../services/logger.service');
const bcrypt = require('bcryptjs');
const { generateUsername } = require('../utils/userUtils');

class AdminController {
  /**
   * Get all users with pagination and filters
   * @param {Request} req 
   * @param {Response} res 
   */
  async getUsers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const users = await userService.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        search,
        sortBy,
        sortOrder
      });

      // Detailed logging
      users.forEach(user => {
        console.log('User:', user.id);
        console.log('Node:', user.node);
        if (user.node) {
          console.log('Package:', user.node.package);
        }
      });

      console.log('users returned:::', JSON.stringify(users, null, 2));
      res.json({
        success: true,
        data: {
          users,
         
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving users'
      });
    }
  }

  // Get all transactions - ADMIN
  async getTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const search = req.query.search;
      const type = req.query.type;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      const where = {};

      // Add filters
      if (status) {
        where.status = status;
      }
      if (type) {
        where.type = type;
      }
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }
      if (search) {
        where.OR = [
          { transactionId: { contains: search } },
          { 
            node: {
              user: {
                OR: [
                  { email: { contains: search } },
                  { firstName: { contains: search } },
                  { lastName: { contains: search } }
                ]
              }
            }
          }
        ];
      }

      // Get total count with the same where clause
      const total = await prisma.nodePayment.count({ where });

      // Get pending count (always get this regardless of filters)
      const pendingCount = await prisma.nodePayment.count({
        where: { status: 'PENDING' }
      });

      // Get paginated transactions
      const transactions = await prisma.nodePayment.findMany({
        where,
        include: {
          node: {
            include: {
              user: true
            }
          },
          package: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      });

      res.json({
        success: true,
        data: {
          transactions,
          pendingCount,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving transactions'
      });
    }
  }

  /**
   * Get user by ID with full details
   * @param {Request} req 
   * @param {Response} res 
   */
  async getUserDetails(req, res) {
    try {
      const { id } = req.params;

      const user = await userService.findById(parseInt(id), {
        includeNode: true,
        includePackages: true,
        includeWithdrawals: true
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Get user details error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving user details'
      });
    }
  }

  /**
   * Update user status
   * @param {Request} req 
   * @param {Response} res 
   */
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await userService.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await userService.updateStatus(id, status);

      res.json({
        success: true,
        message: 'User status updated successfully'
      });

    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user status'
      });
    }
  }

  /**
   * Delete user (soft delete)
   * @param {Request} req 
   * @param {Response} res 
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await userService.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await userService.softDelete(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user'
      });
    }
  }

  /**
   * Get system statistics
   * @param {Request} req 
   * @param {Response} res 
   */
  async getSystemStats(req, res) {
    try {
      
      const [
        totalUsers,
        activeUsers,
        totalNodes,
        activeNodes,
        totalPackages,
        activePackages,
        pendingWithdrawals,
        nodePayments,
        commissions,
        withdrawals
      ] = await Promise.all([
        userService.count(),
        userService.count({ status: 'ACTIVE' }),
        nodeService.count(),
        nodeService.count({ status: 'ACTIVE' }),
        packageService.count(),
        packageService.count({ status: 'ACTIVE' }),
        nodeWithdrawalService.count({ status: 'PENDING' }),
        // All node payments (packages, upgrades, etc)
        prisma.nodePayment.aggregate({
          _sum: {
            amount: true
          }
        }),
        // All commissions
        prisma.commission.aggregate({
          _sum: {
            amount: true
          }
        }),
        // All withdrawals
        prisma.nodeWithdrawal.aggregate({
          _sum: {
            amount: true
          }
        })
      ]);

      // Calculate total system revenue
      const totalRevenue = Number(nodePayments._sum.amount || 0);
      const totalCommissions = Number(commissions._sum.amount || 0);
      const totalWithdrawals = Number(withdrawals._sum.amount || 0);
      const systemRevenue = totalRevenue - totalCommissions - totalWithdrawals;

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers
          },
          nodes: {
            total: totalNodes,
            active: activeNodes
          },
          packages: {
            total: totalPackages,
            active: activePackages
          },
          pendingWithdrawals,
          systemRevenue,
          revenue: {
            total: totalRevenue,
            commissions: totalCommissions,
            withdrawals: totalWithdrawals
          }
        }
      });

    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving system statistics'
      });
    }
  }

  /**
   * Create new package
   * @param {Request} req 
   * @param {Response} res 
   */
  async createPackage(req, res) {
    try {
      const { error } = validatePackage(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const pkg = await packageService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: pkg
      });

    } catch (error) {
      console.error('Create package error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update package
   * @param {Request} req 
   * @param {Response} res 
   */
  async updatePackage(req, res) {
    try {
      const { id } = req.params;
      const { error } = validatePackage(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const pkg = await packageService.findById(id);
      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      await packageService.update(id, req.body);

      res.json({
        success: true,
        message: 'Package updated successfully',
        data: pkg
      });

    } catch (error) {
      console.error('Update package error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete package
   * @param {Request} req 
   * @param {Response} res 
   */
  async deletePackage(req, res) {
    try {
      const { id } = req.params;

      const pkg = await packageService.findById(id);
      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      await packageService.delete(id);

      res.json({
        success: true,
        message: 'Package deleted successfully'
      });

    } catch (error) {
      console.error('Delete package error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Process withdrawal request
   * @param {Request} req 
   * @param {Response} res 
   */
  async processWithdrawal(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const withdrawal = await nodeWithdrawalService.findById(id);
      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal request not found'
        });
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Withdrawal request has already been processed'
        });
      }

      await nodeWithdrawalService.update(id, {
        status,
        reason: reason || null
      });

      // If rejected, create a reversal statement
      if (status === 'rejected') {
        await nodePackageService.createReversalStatement(withdrawal);
      }

      res.json({
        success: true,
        message: 'Withdrawal request processed successfully',
        data: withdrawal
      });

    } catch (error) {
      console.error('Process withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get admin config
   * @param {Request} req 
   * @param {Response} res 
   */
  async getAdminConfig(req, res) {
    try {
      const config = await prisma.adminConfig.findFirst();
      res.json({ success: true, data: config });
    } catch (error) {
      logger.error('Error fetching admin config:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch admin configuration' });
    }
  }

  /**
   * Update admin config
   * @param {Request} req 
   * @param {Response} res 
   */
  async updateAdminConfig(req, res) {
    try {
      const {
        siteName,
        siteLogoUrl,
        siteBaseUrl,
        mtnCollectionNumber,
        airtelCollectionNumber,
        supportPhone,
        supportEmail,
        supportLocation,
        depositDollarRate,
        withdrawalDollarRate,
        withdrawalCharge,
        usdtWalletAddress
      } = req.body;

      // Get existing config or create new one
      const existingConfig = await prisma.adminConfig.findFirst();

      const config = await prisma.adminConfig.upsert({
        where: {
          id: existingConfig?.id || -1
        },
        update: {
          siteName: siteName || undefined,
          siteLogoUrl: siteLogoUrl || undefined,
          siteBaseUrl: siteBaseUrl || undefined,
          mtnCollectionNumber: mtnCollectionNumber || undefined,
          airtelCollectionNumber: airtelCollectionNumber || undefined,
          supportPhone: supportPhone || undefined,
          supportEmail: supportEmail || undefined,
          supportLocation: supportLocation || undefined,
          depositDollarRate: depositDollarRate ? parseFloat(depositDollarRate) : undefined,
          withdrawalDollarRate: withdrawalDollarRate ? parseFloat(withdrawalDollarRate) : undefined,
          withdrawalCharge: withdrawalCharge ? parseFloat(withdrawalCharge) : undefined,
          usdtWalletAddress: usdtWalletAddress || undefined
        },
        create: {
          siteName: siteName || "Zillionaires",
          siteLogoUrl,
          siteBaseUrl: siteBaseUrl || "https://zillionaires.com",
          mtnCollectionNumber,
          airtelCollectionNumber,
          supportPhone,
          supportEmail,
          supportLocation,
          depositDollarRate: depositDollarRate ? parseFloat(depositDollarRate) : 3900.0,
          withdrawalDollarRate: withdrawalDollarRate ? parseFloat(withdrawalDollarRate) : 3900.0,
          withdrawalCharge: withdrawalCharge ? parseFloat(withdrawalCharge) : 0.0,
          usdtWalletAddress
        }
      });

      res.json({ success: true, data: config });
    } catch (error) {
      logger.error('Error updating admin config:', error);
      res.status(500).json({ success: false, message: 'Failed to update admin configuration' });
    }
  }

  async createUser(req, res) {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phone,
        role = 'USER',
        status = 'ACTIVE', 
        country = 'UG',
        createNode = true 
      } = req.body;

      // Start a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Check if email exists
        const existingUser = await tx.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          throw new Error('An account with this email already exists');
        }

        // Generate unique username
        const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
        let username = baseUsername;
        let counter = 1;

        while (await tx.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            username,
            firstName,
            lastName,
            phone,
            role,
            status,
            country,
            isVerified: true 
          }
        });

        // Create node if requested and user is not an admin
        let node = null;
        if (createNode && role === 'USER') {
          // Get the last node to determine placement
          const lastNode = await tx.node.findFirst({
            orderBy: { id: 'desc' },
            where: { status: 'ACTIVE' }
          });

          node = await tx.node.create({
            data: {
              userId: user.id,
              status: 'ACTIVE',
              position: 'ONE',
              level: 1,
              placementId: lastNode?.id || null,
              sponsorId: lastNode?.id || null
            }
          });
        }

        return { user, node };
      });

      // Remove password from response
      const { user, node } = result;
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: userWithoutPassword,
          node
        }
      });

    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(error.message === 'An account with this email already exists' ? 409 : 500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new AdminController();
