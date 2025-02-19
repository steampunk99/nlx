const userService = require('../services/user.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const nodePackageService = require('../services/nodePackage.service');
const nodeWithdrawalService = require('../services/nodeWithdrawal.service');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../services/logger.service');
const { generateUsername } = require('../utils/userUtils');
const fs = require('fs');
const path = require('path');
const commissionUtil = require('../utils/commission.utils');
const cloudinaryService = require('../services/cloudinary.service');

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

  /**
   * Get all transactions - ADMIN
   * @param {Request} req 
   * @param {Response} res
   */
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
        users,
        activeUsers,
        nodes,
        activeNodes,
        packages,
        activePackages,
        pendingWithdrawals,
        nodePayments,
        commissions,
        withdrawals
      ] = await Promise.all([
        // Total users
        prisma.user.count(),
        // Active users
        prisma.user.count({
          where: {
            status: 'ACTIVE'
          }
        }),
        // Total nodes
        prisma.node.count(),
        // Active nodes
        prisma.node.count({
          where: {
            status: 'ACTIVE'
          }
        }),
        // Total packages
        prisma.package.count(),
        // Active packages
        prisma.package.count({
          where: {
            status: 'ACTIVE'
          }
        }),
        // Pending withdrawals count
        prisma.nodeWithdrawal.count({
          where: {
            status: 'PENDING'
          }
        }),
        // All node payments (packages, upgrades, etc)
        prisma.nodePayment.aggregate({
          where: {
            status: 'SUCCESSFUL'
          },
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
        // All successful withdrawals
        prisma.nodeWithdrawal.aggregate({
          _sum: {
            amount: true
          },
          where: {
            status: 'SUCCESSFUL'
          }
        })
      ]);

      // Calculate total revenue and net revenue
      const totalRevenue = Number(nodePayments._sum.amount || 0);
      const totalCommissions = Number(commissions._sum.amount || 0);
      const totalWithdrawals = Number(withdrawals._sum.amount || 0);
      const systemRevenue = totalRevenue - totalCommissions - totalWithdrawals;

      return res.json({
        success: true,
        data: {
          users: {
            total: users,
            active: activeUsers
          },
          nodes: {
            total: nodes,
            active: activeNodes
          },
          packages: {
            total: packages,
            active: activePackages
          },
          pendingWithdrawals,
          revenue: {
            total: totalRevenue,
            commissions: totalCommissions,
            withdrawals: totalWithdrawals,
            systemRevenue
          }
        }
      });
    } catch (error) {
      console.error('Get system stats error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message 
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
        usdtWalletAddress,
        promoImageUrl
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
          usdtWalletAddress: usdtWalletAddress || undefined,
          promoImageUrl: promoImageUrl || undefined
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
          usdtWalletAddress,
          promoImageUrl
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
        referralCode = '',
        packageId
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

        // Create node if requested
        let node = null;
        if (createNode) {
          // Get the last node to determine placement if no sponsor
          const lastNode = !sponsorNode ? await tx.node.findFirst({
            orderBy: { id: 'desc' },
            where: { status: 'ACTIVE' }
          }) : null;

          // Get the selected package
          let selectedPackage = null;
          if (packageId) {
            selectedPackage = await tx.package.findUnique({ 
              where: { id: parseInt(packageId) } 
            });
            
            if (!selectedPackage) {
              throw new Error('Selected package not found');
            }
          }

          node = await tx.node.create({
            data: {
              userId: user.id,
              status: 'ACTIVE',
              sponsorId: sponsorNode?.id,
              placementId: lastNode?.id,
              level: selectedPackage?.level || 1
            }
          });

          // Assign the package to the node
          if (selectedPackage) {
            const now = new Date();
            const expiresAt = new Date();
            expiresAt.setDate(now.getDate() + selectedPackage.duration);

            // Create node package assignment
            await tx.nodePackage.create({
              data: {
                nodeId: node.id,
                packageId: selectedPackage.id,
                status: 'ACTIVE',
                activatedAt: now,
                expiresAt: expiresAt
              }
            });

            // Create payment record
            const payment = await tx.nodePayment.create({
              data: {
                transactionDetails: `Admin assigned package ${selectedPackage.id} to user ${user.id}`,
                amount: selectedPackage.price,
                transactionId: `ADMIN_PKG_${Date.now()}`,
                reference: `ADMIN_PKG_${user.id}_${selectedPackage.id}`,
                type: 'ADMIN',
                packageId: selectedPackage.id,
                nodeId: node.id,
                paymentMethod: 'ADMIN',
                status: 'SUCCESSFUL'
              }
            });

            // Create successful statement
            await tx.nodeStatement.create({
              data: {
                nodeId: node.id,
                amount: selectedPackage.price,
                type: 'DEBIT',
                status: 'SUCCESSFUL',
                description: `Package purchase - ${selectedPackage.name} (Admin Assigned)`,
                referenceType: 'DEPOSIT',
                referenceId: payment.id
              }
            });

            // Create system revenue record
            await tx.systemRevenue.create({
              data: {
                amount: selectedPackage.price,
                type: 'PACKAGE_PURCHASE',
                description: `Package purchase - ${selectedPackage.name} (Admin Assigned)`,
                status: 'SUCCESSFUL',
                paymentId: payment.id
              }
            });

            // Calculate and distribute commissions
            await commissionUtil.calculateCommissions(
              node.id,
              selectedPackage.price,
              selectedPackage.id,
              tx
            );

            // Create notification for user
            await tx.notification.create({
              data: {
                userId: user.id,
                title: 'Package Assigned',
                message: `An admin has assigned you the ${selectedPackage.name} package.`,
                type: 'PACKAGE',
                
              }
            });
          }
        }

        return { user, node };
      });

      res.json({
        success: true,
        message: 'User created successfully',
        data: result
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create user'
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

  /**
   * Get network statistics
   * @param {Request} req 
   * @param {Response} res 
   */
  async getNetworkStats(req, res) {
    try {
      const [
        nodes,
        activeNodes,
        levelDistribution
      ] = await Promise.all([
        // Total nodes
        prisma.node.count(),
        // Active nodes
        prisma.node.count({
          where: {
            status: 'ACTIVE'
          }
        }),
        // Level distribution
        prisma.node.groupBy({
          by: ['level'],
          _count: true,
          orderBy: {
            level: 'asc'
          }
        })
      ]);

      // Format level distribution
      const distribution = levelDistribution.reduce((acc, curr) => {
        acc[curr.level] = curr._count;
        return acc;
      }, {});

      return res.json({
        success: true,
        data: {
          nodes: {
            total: nodes,
            active: activeNodes
          },
          levelDistribution: distribution
        }
      });
    } catch (error) {
      console.error('Get network stats error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({
          status: 'error',
          message: 'No image file uploaded'
        });
      }

      const file = req.files.image;
      
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          status: 'error',
          message: 'Please upload an image file'
        });
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return res.status(400).json({
          status: 'error',
          message: 'File size must be less than 5MB'
        });
      }

      try {
        console.log('Starting file upload to Cloudinary:', {
          name: file.name,
          size: file.size,
          mimetype: file.mimetype,
          tempFilePath: file.tempFilePath
        });

        // Upload to Cloudinary using the temporary file path
        const uploadResult = await cloudinaryService.uploadFile(file.tempFilePath, {
          folder: 'earndrip/uploads',
          resource_type: 'image',
          public_id: `${Date.now()}_${path.parse(file.name).name}` // Add timestamp to prevent naming conflicts
        });

        console.log('Upload successful:', uploadResult);

        return res.status(200).json({
          status: 'success',
          data: {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            format: uploadResult.format,
            size: uploadResult.size
          }
        });
      } catch (uploadError) {
        console.error('Upload error details:', uploadError);
        return res.status(500).json({
          status: 'error',
          message: uploadError.message || 'Failed to upload image'
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new AdminController();
