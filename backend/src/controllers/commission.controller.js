const commissionService = require('../services/commission.service');

class CommissionController {
    // Get all commissions (admin only)
    async getAllCommissions(req, res) {
        try {
            const { 
                page, 
                limit, 
                userId, 
                type, 
                status, 
                startDate, 
                endDate 
            } = req.query;

            const result = await commissionService.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                userId: userId ? parseInt(userId) : undefined,
                type,
                status,
                startDate,
                endDate
            });

            res.json({
                success: true,
                data: result.commissions,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get all commissions error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch commissions'
            });
        }
    }

    // Get commission by ID
    async getCommissionById(req, res) {
        try {
            const { id } = req.params;
            const commission = await commissionService.findById(parseInt(id));

            res.json({
                success: true,
                data: commission
            });
        } catch (error) {
            console.error('Get commission by ID error:', error);
            if (error.message === 'Commission not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Commission not found'
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to fetch commission'
            });
        }
    }

    // Create new commission
    async createCommission(req, res) {
        try {
            const commissionData = {
                ...req.body,
                userId: parseInt(req.body.userId),
                sourceUserId: req.body.sourceUserId ? parseInt(req.body.sourceUserId) : null,
                packageId: req.body.packageId ? parseInt(req.body.packageId) : null
            };

            const commission = await commissionService.create(commissionData);

            res.status(201).json({
                success: true,
                data: commission
            });
        } catch (error) {
            console.error('Create commission error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create commission'
            });
        }
    }

    // Update commission
    async updateCommission(req, res) {
        try {
            const { id } = req.params;
            const commissionData = req.body;

            const commission = await commissionService.update(parseInt(id), commissionData);

            res.json({
                success: true,
                data: commission
            });
        } catch (error) {
            console.error('Update commission error:', error);
            if (error.message === 'Commission not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Commission not found'
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to update commission'
            });
        }
    }

    // Delete commission (admin only)
    async deleteCommission(req, res) {
        try {
            const { id } = req.params;
            await commissionService.delete(parseInt(id));

            res.json({
                success: true,
                message: 'Commission deleted successfully'
            });
        } catch (error) {
            console.error('Delete commission error:', error);
            if (error.message === 'Commission not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Commission not found'
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to delete commission'
            });
        }
    }

    // Get user commission statistics
    async getUserCommissionStats(req, res) {
        try {
            const userId = parseInt(req.params.userId || req.user.id);
            const stats = await commissionService.getUserCommissionStats(userId);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get user commission stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch commission statistics'
            });
        }
    }

    // Process commission queue (admin only)
    async processCommissionQueue(req, res) {
        try {
            const processedCount = await commissionService.processCommissionQueue();

            res.json({
                success: true,
                message: `Processed ${processedCount} commissions`,
                data: { processedCount }
            });
        } catch (error) {
            console.error('Process commission queue error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process commission queue'
            });
        }
    }

    // Calculate direct commission
    async calculateDirectCommission(req, res) {
        try {
            const { packagePrice, level } = req.body;

            if (!packagePrice || !level) {
                return res.status(400).json({
                    success: false,
                    error: 'Package price and level are required'
                });
            }

            const commission = await commissionService.calculateDirectCommission(
                parseFloat(packagePrice),
                parseInt(level)
            );

            res.json({
                success: true,
                data: { commission }
            });
        } catch (error) {
            console.error('Calculate direct commission error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to calculate direct commission'
            });
        }
    }

    // Calculate matching bonus
    async calculateMatchingBonus(req, res) {
        try {
            const { teamVolume, userLevel } = req.body;

            if (!teamVolume || !userLevel) {
                return res.status(400).json({
                    success: false,
                    error: 'Team volume and user level are required'
                });
            }

            const bonus = await commissionService.calculateMatchingBonus(
                parseFloat(teamVolume),
                parseInt(userLevel)
            );

            res.json({
                success: true,
                data: { bonus }
            });
        } catch (error) {
            console.error('Calculate matching bonus error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to calculate matching bonus'
            });
        }
    }
}

module.exports = new CommissionController();
