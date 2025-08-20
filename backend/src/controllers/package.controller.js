const packageService = require('../services/package.service');
const nodePackageService = require('../services/nodePackage.service');
const userService = require('../services/user.service');
const nodeService = require('../services/node.service');
const commissionService = require('../services/commission.service');
const { validatePackagePurchase, validatePackageCreate } = require('../middleware/package.validate');
const { calculateCommissions } = require('../utils/commission.utils');
const prisma = require('../config/prisma');
const nodePaymentService = require('../services/nodePayment.service');
const cloudinaryService = require('../services/cloudinary.service');

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

// 

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

      const nodePackage = await nodePackageService.findByNodeId(node.id);
      
      // Add expiration status and time remaining
      if (nodePackage) {
        const now = new Date();
        const isExpired = nodePackage.expiresAt && nodePackage.expiresAt < now;
        const timeRemaining = nodePackage.expiresAt ? 
          Math.max(0, Math.ceil((nodePackage.expiresAt - now) / (1000 * 60 * 60 * 24))) : 0;

        return res.json({
          success: true,
          data: {
            ...nodePackage,
            isExpired,
            daysRemaining: timeRemaining
          }
        });
      }

      return res.json({
        success: true,
        data: null
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
        status,
        imageUrl: imageUrlFromBody
      } = req.body;

      // Handle image upload if file is provided
      let imageUrl = imageUrlFromBody || null;
      try {
        if (req.files && req.files.image && req.files.image.tempFilePath) {
          const upload = await cloudinaryService.uploadFile(req.files.image.tempFilePath, { folder: 'packages' });
          imageUrl = upload.url;
        }
      } catch (e) {
        console.error('Package image upload failed:', e);
        // Not fatal; continue without image if upload fails
      }

      const newPackage = await packageService.adminCreate({
        name,
        description,
        price: Number(price),
        level: Number(level),
        features,
        benefits,
        maxNodes: Number(maxNodes),
        duration: Number(duration),
        status,
        imageUrl
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

      // Handle image upload if present
      try {
        if (req.files && req.files.image && req.files.image.tempFilePath) {
          const upload = await cloudinaryService.uploadFile(req.files.image.tempFilePath, { folder: 'packages' });
          updateData.imageUrl = upload.url;
        }
      } catch (e) {
        console.error('Package image upload failed:', e);
        // continue without changing image if upload fails
      }

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
