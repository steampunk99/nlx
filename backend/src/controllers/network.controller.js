const { PrismaClient } = require('@prisma/client');
const nodeChildrenService = require('../services/nodeChildren.service');
const notificationService = require('../services/notification.service');
const crypto = require('crypto');

// Create Prisma client with error handling
let prisma;
try {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty'
  });
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  process.exit(1);
}

class NetworkController {
  constructor() {
    // Validate Prisma client models at instantiation
    this.validatePrismaModels();
  }

  validatePrismaModels() {
    const requiredModels = ['referralLink', 'user'];
    const missingModels = requiredModels.filter(model => 
      !prisma[model] || typeof prisma[model].findFirst !== 'function'
    );

    if (missingModels.length > 0) {
      console.error(`Prisma models not initialized: ${missingModels.join(', ')}`);
      console.error('Available Prisma Models:', Object.keys(prisma || {}));
      throw new Error(`Prisma models not initialized: ${missingModels.join(', ')}`);
    }
  }

  async getDirectReferrals(req, res) {
    try {
      const userId = req.user.id;
      console.log('Getting direct referrals for user:', userId);

      const referrals = await nodeChildrenService.getDirectReferrals({
        userId,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      });

      return res.status(200).json({
        success: true,
        data: referrals.data,
        pagination: referrals.pagination
      });
    } catch (error) {
      console.error('Get direct referrals error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get direct referrals',
        error: error.message
      });
    }
  }

  async getDirectChildren(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;

      const children = await nodeChildrenService.getGenealogyTree.getDirectChildren({userId})

      const response = {
        left: children.find(child => child.direction === 'L') || null,
        right: children.find(child => child.direction === 'R') || null
      };

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Get direct children error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch direct children',
        details: error.message
      });
    }
  }

  async getBinaryTree(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const maxLevel = parseInt(req.query.maxLevel) || 3;

      const binaryTreeUp = await nodeChildrenService.getUpline({
        userId,
        maxLevel
      });
      const binaryDown = await nodeChildrenService.getDownline({
        userId,
        maxLevel
      });

      res.json({
        success: true,
        data: binaryTreeUp,binaryDown
      });
    } catch (error) {
      console.error('Get binary tree error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch binary tree',
        details: error.message
      });
    }
  }

  async getGenealogy(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const maxLevel = parseInt(req.query.maxLevel) || 10;

      const genealogy = await nodeChildrenService.getGenealogy({
        userId,
        maxLevel
      });

      res.json({
        success: true,
        data: genealogy
      });
    } catch (error) {
      console.error('Get genealogy error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch genealogy',
        details: error.message
      });
    }
  }

  async getNetworkStats(req, res) {
    try {
      const userId = req.user.id;
      console.log('Getting network stats for user:', userId);

      const stats = await nodeChildrenService.getNetworkStats(userId);
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get network stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get network stats',
        error: error.message
      });
    }
  }

  async getTeamPerformance(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      const performance = await nodeChildrenService.getTeamPerformance({
        userId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      });

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Get team performance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch team performance',
        details: error.message
      });
    }
  }

  async getGenealogyTree(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const { depth = 3 } = req.query;

      const genealogy = await nodeChildrenService.getGenealogyTree({
        userId,
        depth: parseInt(depth)
      });

      res.json({
        success: true,
        data: genealogy
      });
    } catch (error) {
      console.error('Get genealogy tree error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch genealogy tree',
        details: error.message
      });
    }
  }

  async getBusinessVolume(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      const volume = await nodeChildrenService.getBusinessVolume({
        userId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      });

      res.json({
        success: true,
        data: volume
      });
    } catch (error) {
      console.error('Get business volume error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch business volume',
        details: error.message
      });
    }
  }

  async getRankQualification(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const qualification = await nodeChildrenService.getRankQualification({
        userId
      });

      res.json({
        success: true,
        data: qualification
      });
    } catch (error) {
      console.error('Get rank qualification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rank qualification',
        details: error.message
      });
    }
  }

  async getTeamStructure(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const { view = 'binary' } = req.query; // binary, unilevel, or matrix

      const structure = await nodeChildrenService.getTeamStructure({
        userId,
        view
      });

      res.json({
        success: true,
        data: structure
      });
    } catch (error) {
      console.error('Get team structure error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch team structure',
        details: error.message
      });
    }
  }

  async searchNetwork(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const { query, type = 'username' } = req.query;

      const results = await nodeChildrenService.searchNetwork({
        userId,
        query,
        type
      });

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Search network error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search network',
        details: error.message
      });
    }
  }

  async createReferralLink(req, res) {
    try {
      const userId = req.user.id;
      console.log('Creating referral link for user:', userId);

      // First ensure user has a node
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { node: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.node) {
        console.log('Creating node for user...');
        await prisma.node.create({
          data: {
            userId: user.id,
            position: 'LEFT',
            status: 'ACTIVE',
            level: 1
          }
        });
      }

      // Generate unique referral code
      const code = crypto.randomBytes(4).toString('hex');
      
      // Create referral link
      const referralLink = await prisma.referralLink.create({
        data: {
          userId,
          code,
          status: 'ACTIVE',
          link: `https://triplepride.com/register?ref=${code}`
        }
      });

      console.log('Created referral link:', referralLink);

      return res.status(201).json({
        success: true,
        data: referralLink
      });
    } catch (error) {
      console.error('Create referral link error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create referral link',
        error: error.message
      });
    }
  }

  async generateReferralLink(req, res) {
    try {
      console.log('------- REFERRAL LINK GENERATION START -------');
      console.log('Full Request Object:', {
        user: req.user,
        headers: req.headers,
        body: req.body
      });
      
      // Detailed Prisma client logging
      console.log('Prisma Client Status:', {
        prismaExists: !!prisma,
        referralLinkModelExists: !!prisma?.referralLink,
        availableModels: prisma ? Object.keys(prisma) : 'No Prisma Client'
      });

      // Validate Prisma client
      if (!prisma || !prisma.referralLink) {
        console.error('CRITICAL: Prisma client or referralLink model is undefined');
        return res.status(500).json({
          success: false,
          error: 'Prisma client initialization failed',
          details: {
            prismaExists: !!prisma,
            referralLinkModelExists: !!prisma?.referralLink
          }
        });
      }

      // Validate user authentication
      if (!req.user) {
        console.error('AUTHENTICATION ERROR: User not authenticated');
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userId = req.user.id;
      const username = req.user.username;

      console.log('User Details:', { userId, username });

      // Extensive logging for database operations
      try {
        console.log('Attempting to find existing referral link...');
        const existingReferralLink = await prisma.referralLink.findFirst({
          where: { userId }
        });
        console.log('Existing Referral Link Query Result:', existingReferralLink);

        let referralLink;
        if (existingReferralLink) {
          referralLink = existingReferralLink.link;
          console.log('Using existing referral link');
        } else {
          console.log('Generating new referral link...');
          // Generate a unique referral code
          const referralCode = crypto.randomBytes(16).toString('hex').substring(0, 8);
          const baseUrl = process.env.FRONTEND_URL || 'https://www.earndrip.com' || 'https://ample-youthfulness-production.up.railway.app';
          
          referralLink = `${baseUrl}/register?ref=${referralCode}`;

          console.log('Generated Referral Details:', { 
            referralCode, 
            baseUrl, 
            referralLink 
          });

          // Save referral link in database
          try {
            const newReferralLink = await prisma.referralLink.create({
              data: {
                userId,
                username,
                link: referralLink,
                code: referralCode
              }
            });
            console.log('New Referral Link Created:', newReferralLink);
          } catch (createError) {
            console.error('ERROR: Failed to create referral link', {
              error: createError.message,
              stack: createError.stack
            });
            throw createError;
          }
        }

        console.log('------- REFERRAL LINK GENERATION SUCCESS -------');
        res.json({
          success: true,
          data: {
            referralLink,
            message: 'Referral link generated successfully'
          }
        });
      } catch (dbError) {
        console.error('DATABASE QUERY ERROR:', {
          message: dbError.message,
          code: dbError.code,
          stack: dbError.stack
        });
        throw dbError;
      }
    } catch (error) {
      console.error('------- REFERRAL LINK GENERATION FAILED -------');
      console.error('Comprehensive Error Details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        prismaModels: prisma ? Object.keys(prisma) : 'No Prisma Client'
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate referral link',
        details: error.message
      });
    }
  }

  async trackReferralClick(req, res) {
    try {
      const { code } = req.params;
      console.log('Tracking click for referral code:', code);

      const referralLink = await prisma.referralLink.findUnique({
        where: { code }
      });

      if (!referralLink) {
        return res.status(404).json({
          success: false,
          message: 'Invalid referral code'
        });
      }

      // Increment the clicks count
      await prisma.referralLink.update({
        where: { id: referralLink.id },
        data: { clicks: { increment: 1 } }
      });

      res.json({
        success: true,
        data: {
          link: referralLink.link
        }
      });
    } catch (error) {
      console.error('Track referral click error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track referral click',
        error: error.message
      });
    }
  }

  async fixRelationships(req, res) {
    try {
      console.log('Fixing node relationships...');
      await nodeChildrenService.fixNodeRelationships();
      
      return res.status(200).json({
        success: true,
        message: 'Node relationships fixed successfully'
      });
    } catch (error) {
      console.error('Fix relationships error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fix relationships',
        error: error.message
      });
    }
  }

  async fixAllRelationships(req, res) {
    try {
      console.log('Fixing all node relationships...');
      await nodeChildrenService.fixAllNodeRelationships();
      
      return res.status(200).json({
        success: true,
        message: 'All node relationships fixed successfully'
      });
    } catch (error) {
      console.error('Fix all relationships error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fix relationships',
        error: error.message
      });
    }
  }

  async getNetworkLevels(req, res) {
    try {
      console.log('Getting network levels for user:', req.user.id);
      const levels = await nodeChildrenService.getNetworkLevels(req.user.id);
      
      return res.status(200).json({
        success: true,
        data: levels
      });
    } catch (error) {
      console.error('Get network levels error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get network levels',
        error: error.message
      });
    }
  }
}

module.exports = new NetworkController();
