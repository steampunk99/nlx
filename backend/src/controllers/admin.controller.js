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
    const { 
      name, 
      description, 
      price, 
      level,
      status = 'ACTIVE',
      benefits,
      maxNodes = 1,
      duration = 30,
      features,
      dailyMultiplier = 1
    } = req.body;

    try {
      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Check if package with same name exists
        const existingPackage = await tx.package.findFirst({
          where: { name }
        });

        if (existingPackage) {
          throw new Error('A package with this name already exists');
        }

        // Validate price
        if (price <= 0) {
          throw new Error('Package price must be greater than zero');
        }

        // Create package
        const newPackage = await tx.package.create({
          data: {
            name,
            description,
            price: parseFloat(price),
            level: parseInt(level),
            status,
            benefits: benefits ? JSON.parse(benefits) : null,
            maxNodes: parseInt(maxNodes),
            duration: parseInt(duration),
            features: features ? JSON.stringify(features) : null,
            dailyMultiplier: parseFloat(dailyMultiplier)
          }
        });

        return newPackage;
      });

      return res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error creating package:', error);
      return res.status(
        error.message === 'A package with this name already exists' ? 409 : 500
      ).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Update package
   * @param {Request} req 
   * @param {Response} res 
   */
  async updatePackage(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Check if package exists
        const existingPackage = await tx.package.findUnique({
          where: { id: parseInt(id) },
          include: {
            nodePackages: {
              where: { status: 'ACTIVE' }
            }
          }
        });

        if (!existingPackage) {
          throw new Error('Package not found');
        }

        // If package has active subscriptions, prevent critical updates
        if (existingPackage.nodePackages.length > 0) {
          const criticalFields = ['price', 'duration', 'maxNodes', 'dailyMultiplier'];
          criticalFields.forEach(field => {
            if (updateData[field] && updateData[field] !== existingPackage[field]) {
              throw new Error(
                `Cannot modify ${field} for package with active subscriptions`
              );
            }
          });
        }

        // Format data for update
        const formattedData = {
          name: updateData.name,
          description: updateData.description,
          price: updateData.price ? parseFloat(updateData.price) : undefined,
          level: updateData.level ? parseInt(updateData.level) : undefined,
          status: updateData.status,
          benefits: updateData.benefits ? JSON.parse(updateData.benefits) : undefined,
          maxNodes: updateData.maxNodes ? parseInt(updateData.maxNodes) : undefined,
          duration: updateData.duration ? parseInt(updateData.duration) : undefined,
          features: updateData.features ? JSON.stringify(updateData.features) : undefined,
          dailyMultiplier: updateData.dailyMultiplier ? parseFloat(updateData.dailyMultiplier) : undefined
        };

        // Remove undefined values
        Object.keys(formattedData).forEach(key => {
          if (formattedData[key] === undefined) {
            delete formattedData[key];
          }
        });

        // Update package
        const updatedPackage = await tx.package.update({
          where: { id: parseInt(id) },
          data: formattedData
        });

        return updatedPackage;
      });

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error updating package:', error);
      return res.status(
        error.message === 'Package not found' ? 404 :
        error.message.includes('Cannot modify') ? 400 : 500
      ).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get all packages with pagination and filters
   * @param {Request} req 
   * @param {Response} res 
   */
  async getPackages(req, res) {
    const { 
      status,
      level,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    try {
      const where = {};
      
      // Build filter conditions
      if (status) where.status = status;
      if (level) where.level = parseInt(level);
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ];
      }

      // Get packages with pagination
      const [packages, total] = await Promise.all([
        prisma.package.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          include: {
            _count: {
              select: {
                nodePackages: true,
                nodePayments: true
              }
            }
          }
        }),
        prisma.package.count({ where })
      ]);

      // Calculate package statistics
      const packagesWithStats = await Promise.all(
        packages.map(async (pkg) => {
          const [revenue, commissions] = await Promise.all([
            prisma.nodePayment.aggregate({
              select: {
                _sum: {
                  select: {
                    amount: true
                  }
                }
              },
              where: {
                packageId: pkg.id,
                status: "SUCCESSFUL"
              }
            }),
            prisma.commission.aggregate({
              select: {
                _sum: {
                  select: {
                    amount: true
                  }
                }
              },
              where: {
                packageId: pkg.id,
                status: "PROCESSED"
              }
            })
          ]);

          return {
            ...pkg,
            statistics: {
              activeSubscriptions: pkg._count.nodePackages,
              totalPayments: pkg._count.nodePayments,
              totalRevenue: revenue._sum.amount || 0,
              totalCommissions: commissions._sum.amount || 0
            }
          };
        })
      );

      return res.json({
        success: true,
        data: packagesWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching packages:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get package statistics
   * @param {Request} req 
   * @param {Response} res 
   */
  async getPackageStats(req, res) {
    const { id } = req.params;

    try {
      const pkg = await prisma.package.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: {
              nodePackages: true,
              nodePayments: true
            }
          }
        }
      });

      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      // Get detailed statistics
      const [
        activeSubscriptions,
        revenue,
        commissions,
        recentPayments
      ] = await Promise.all([
        prisma.nodePackage.count({
          where: {
            packageId: parseInt(id),
            status: 'ACTIVE'
          }
        }),
        prisma.nodePayment.aggregate({
          where: {
            packageId: parseInt(id),
            status: 'SUCCESSFUL'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.commission.aggregate({
          where: {
            packageId: parseInt(id),
            status: 'PROCESSED'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.nodePayment.findMany({
          where: {
            packageId: parseInt(id),
            status: 'SUCCESSFUL'
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            node: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        })
      ]);

      return res.json({
        success: true,
        data: {
          package: pkg,
          statistics: {
            activeSubscriptions,
            totalSubscriptions: pkg._count.nodePackages,
            totalPayments: pkg._count.nodePayments,
            totalRevenue: revenue._sum.amount || 0,
            totalCommissions: commissions._sum.amount || 0,
            netRevenue: (revenue._sum.amount || 0) - (commissions._sum.amount || 0),
            recentPayments
          }
        }
      });

    } catch (error) {
      console.error('Error fetching package statistics:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
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
        createNode = true,
        referralCode = ''
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

        // Check referral code if provided
        let sponsorNode = null;
        if (referralCode) {
          const referralLink = await tx.referralLink.findUnique({
            where: { code: referralCode },
            include: {
              user: {
                include: { node: true }
              }
            }
          });

          if (!referralLink) {
            throw new Error('Invalid referral code');
          }

          sponsorNode = referralLink.user.node;
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
          // Get the last node to determine placement if no sponsor
          const lastNode = !sponsorNode ? await tx.node.findFirst({
            orderBy: { id: 'desc' },
            where: { status: 'ACTIVE' }
          }) : null;

          node = await tx.node.create({
            data: {
              userId: user.id,
              status: 'ACTIVE',
              position: 'ONE',
              level: 1,
              placementId: sponsorNode?.id || lastNode?.id || null,
              sponsorId: sponsorNode?.id || lastNode?.id || null
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
      return res.status(
        error.message === 'An account with this email already exists' ? 409 :
        error.message === 'Invalid referral code' ? 400 : 500
      ).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async getPackagesStats(req, res) {
    try {
      const [totalPackages, activePackages, totalUsers, totalRevenue] = await Promise.all([
        prisma.package.count(),
        prisma.package.count({
          where: {
            status: 'ACTIVE'
          }
        }),
        prisma.nodePackage.count({
          where: {
            status: 'ACTIVE'
          }
        }),
        prisma.nodePayment.aggregate({
          where: {
            status: 'SUCCESSFUL'
          },
          _sum: {
            amount: true
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalPackages,
          activePackages,
          totalUsers,
          totalRevenue: totalRevenue._sum.amount || 0
        }
      });
    } catch (error) {
      console.error('Error fetching package stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch package statistics',
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();
