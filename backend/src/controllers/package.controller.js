const packageService = require('../services/package.service');
const nodePackageService = require('../services/nodePackage.service');
const userService = require('../services/user.service');
const nodeService = require('../services/node.service');
const commissionService = require('../services/commission.service');
const { validatePackagePurchase, validatePackageCreate } = require('../middleware/package.validate');
const { calculateCommissions } = require('../utils/commission.utils');
const prisma = require('../config/prisma');

class PackageController {
  /**
   * Get all available packages
   * @param {Request} req 
   * @param {Response} res 
   */
  async getAllPackages(req, res) {
    try {
      const packages = await packageService.findAll();

      res.json({
        success: true,
        data: packages
      });

    } catch (error) {
      console.error('Get packages error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving packages'
      });
    }
  }

  /**
   * Get user's purchased packages
   * @param {Request} req 
   * @param {Response} res 
   */
  async getUserPackages(req, res) {
    try {
      const userId = req.user.id;
      const node = await nodeService.findByUserId(userId);
      
      if (!node) {
        return res.status(404).json({
          success: false,
          message: 'Node not found for user'
        });
      }

      const packages = await nodePackageService.findByNodeId(node.id);

      res.json({
        success: true,
        data: packages
      });

    } catch (error) {
      console.error('Get user packages error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving user packages'
      });
    }
  }

  /**
   * Purchase a new package
   * @param {Request} req 
   * @param {Response} res 
   */
  async purchasePackage(req, res) {
    try {
      // Validate request
      const { error } = validatePackagePurchase(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { packageId, paymentMethod, phoneNumber } = req.body;
      const userId = req.user.id;

      // Get user details with node
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { node: true }
      });

      // Check if user is in REGISTERED status
      if (user.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Your account is not eligible for package purchase'
        });
      }

      // Get package details
      const pkg = await packageService.findById(packageId);
      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      // Validate node
      const node = user.node;
      if (!node) {
        return res.status(404).json({
          success: false,
          message: 'Network node not found'
        });
      }

      // Check if node is already active
      if (node.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Your network node is already active'
        });
      }

      // Validate first package purchase
      const existingPackages = await nodePackageService.findActivePackagesByNodeId(node.id);
      if (existingPackages.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already purchased a package'
        });
      }

      // Create package purchase in a transaction
      const nodePurchase = await prisma.$transaction(async (tx) => {
        // Create node package
        const purchase = await nodePackageService.create({
          nodeId: node.id,
          packageId,
          status: 'PENDING',
          paymentMethod,
          paymentPhone: phoneNumber
        }, tx);

        // Update user status
        await tx.user.update({
          where: { id: userId },
          data: { status: 'ACTIVE' }
        });

        // Activate node
        await tx.node.update({
          where: { id: node.id },
          data: { 
            status: 'ACTIVE',
            activatedAt: new Date()
          }
        });

        // Calculate and distribute commissions
        await calculateCommissions(user, pkg, tx);

        return purchase;
      });

      res.status(201).json({
        success: true,
        message: 'Package purchase successful. Your network node is now active.',
        data: {
          purchase: nodePurchase,
          package: pkg,
          nodeStatus: 'ACTIVE'
        }
      });

    } catch (error) {
      console.error('Purchase package error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing package purchase'
      });
    }
  }

  /**
   * Create a new package (Admin only)
   * @param {Request} req 
   * @param {Response} res 
   */
  async createPackage(req, res) {
    try {
      const { 
        name,
        description,
        price,
        level,
        features,
        benefits,
        maxNodes,
        duration,
        status
      } = req.body;

      const newPackage = await packageService.adminCreate({
        name,
        description,
        price: Number(price),
        level: Number(level),
        features,
        benefits,
        maxNodes: Number(maxNodes),
        duration: Number(duration),
        status
      });

      res.status(201).json({
        success: true,
        data: newPackage
      });
    } catch (error) {
      console.error('Create package error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating package'
      });
    }
  }

  /**
   * Update package details (Admin only)
   * @param {Request} req 
   * @param {Response} res 
   */
  async updatePackage(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Convert numeric fields
      if (updateData.price) updateData.price = Number(updateData.price);
      if (updateData.level) updateData.level = Number(updateData.level);
      if (updateData.maxNodes) updateData.maxNodes = Number(updateData.maxNodes);
      if (updateData.duration) updateData.duration = Number(updateData.duration);

      const updatedPackage = await packageService.adminUpdate(id, updateData);
      
      res.json({
        success: true,
        data: updatedPackage
      });
    } catch (error) {
      console.error('Update package error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating package'
      });
    }
  }

  /**
   * Toggle package status (Admin only)
   * @param {Request} req 
   * @param {Response} res 
   */
  async togglePackageStatus(req, res) {
    try {
      const { id } = req.params;
      const togglePackageStatus = await packageService.adminToggleStatus(id);
      
      res.json({
        success: true,
        data: togglePackageStatus
      });
    } catch (error) {
      console.error('Toggle package status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling package status'
      });
    }
  }

  /**
   * Get package statistics (Admin only)
   * @param {Request} req 
   * @param {Response} res 
   */
  async getPackageStats(req, res) {
    try {
      const stats = await packageService.adminGetStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get package stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving package statistics'
      });
    }
  }

  /**
   * Upgrade existing package
   * @param {Request} req 
   * @param {Response} res 
   */
  async upgradePackage(req, res) {
    try {
      const { currentPackageId, newPackageId, paymentMethod, phoneNumber } = req.body;
      const userId = req.user.id;

      // Get node details
      const node = await nodeService.findByUserId(userId);
      if (!node) {
        return res.status(404).json({
          success: false,
          message: 'Node not found for user'
        });
      }

      // Validate current package
      const currentPackage = await nodePackageService.findById(currentPackageId);
      if (!currentPackage || currentPackage.nodeId !== node.id) {
        return res.status(404).json({
          success: false,
          message: 'Current package not found'
        });
      }

      // Get new package details
      const newPackage = await packageService.findById(newPackageId);
      if (!newPackage) {
        return res.status(404).json({
          success: false,
          message: 'New package not found'
        });
      }

      // Validate upgrade (ensure new package is higher level)
      if (newPackage.level <= currentPackage.package.level) {
        return res.status(400).json({
          success: false,
          message: 'New package must be of a higher level'
        });
      }

      // Create upgrade record
      const upgrade = await nodePackageService.create({
        nodeId: node.id,
        packageId: newPackageId,
        status: 'PENDING',
        paymentMethod,
        paymentPhone: phoneNumber,
        isUpgrade: true,
        previousPackageId: currentPackageId
      });

      // Calculate upgrade commissions (difference in package prices)
      const priceDifference = newPackage.price - currentPackage.package.price;
      const commissions = await calculateCommissions(node.id, priceDifference);
      await Promise.all(commissions.map(commission => 
        commissionService.create({
          ...commission,
          packageId: newPackageId,
          status: 'PENDING',
          type: 'UPGRADE'
        })
      ));

      res.json({
        success: true,
        message: 'Package upgrade initiated',
        data: {
          upgrade,
          newPackage
        }
      });

    } catch (error) {
      console.error('Upgrade package error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing package upgrade'
      });
    }
  }

  /**
   * Get package upgrade history
   * @param {Request} req 
   * @param {Response} res 
   */
  async getUpgradeHistory(req, res) {
    try {
      const userId = req.user.id;
      const node = await nodeService.findByUserId(userId);
      
      if (!node) {
        return res.status(404).json({
          success: false,
          message: 'Node not found for user'
        });
      }

      const upgrades = await nodePackageService.findByNodeId(node.id, {
        isUpgrade: true,
        includePackages: true
      });

      res.json({
        success: true,
        data: upgrades
      });

    } catch (error) {
      console.error('Get upgrade history error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving upgrade history'
      });
    }
  }

  /**
   * Delete package (Admin only)
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
        message: 'Error deleting package'
      });
    }
  }
}

module.exports = new PackageController();
