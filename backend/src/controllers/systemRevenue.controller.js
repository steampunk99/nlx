const systemRevenueService = require('../services/systemRevenue.service');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class SystemRevenueController {
    /**
     * Get all system revenue records with pagination and filters
     */
    getAllRevenue = catchAsync(async (req, res) => {
        const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;

        const result = await systemRevenueService.findAll({
            page: parseInt(page),
            limit: parseInt(limit),
            type,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });

        res.status(200).json({
            success: true,
            data: result
        });
    });

    /**
     * Get system revenue statistics
     */
    getRevenueStats = catchAsync(async (req, res) => {
        const { startDate, endDate } = req.query;

        const stats = await systemRevenueService.getStats(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        res.status(200).json({
            success: true,
            data: stats
        });
    });

    /**
     * Get system revenue by ID
     */
    getRevenueById = catchAsync(async (req, res) => {
        const { id } = req.params;

        const revenue = await systemRevenueService.findById(parseInt(id));
        if (!revenue) {
            throw new AppError('System revenue record not found', 404);
        }

        res.status(200).json({
            success: true,
            data: revenue
        });
    });

    /**
     * Update system revenue status
     */
    updateRevenueStatus = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            throw new AppError('Status is required', 400);
        }

        const revenue = await systemRevenueService.update(parseInt(id), {
            status,
            updatedAt: new Date()
        });

        res.status(200).json({
            success: true,
            data: revenue
        });
    });

    /**
     * Delete system revenue record
     */
    deleteRevenue = catchAsync(async (req, res) => {
        const { id } = req.params;

        await systemRevenueService.delete(parseInt(id));

        res.status(200).json({
            success: true,
            message: 'System revenue record deleted successfully'
        });
    });

    /**
     * Get revenue report for a specific period
     */
    getRevenueReport = catchAsync(async (req, res) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new AppError('Start date and end date are required', 400);
        }

        const stats = await systemRevenueService.getStats(
            new Date(startDate),
            new Date(endDate)
        );

        // Additional report data
        const report = {
            period: {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            },
            summary: {
                totalRevenue: stats.totalAmount,
                totalTransactions: stats.totalCount,
                averageRevenue: stats.averageAmount
            },
            breakdown: {
                byType: stats.byType
            },
            generatedAt: new Date()
        };

        res.status(200).json({
            success: true,
            data: report
        });
    });
}

module.exports = new SystemRevenueController(); 