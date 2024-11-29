const prisma = require('../config/prisma');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const analyticsService = require('../services/analytics.service');
const nodeService = require('../services/node.service');
const financeService = require('../services/finance.service');

/**
 * Report Controller for MLM Analytics and Reporting
 */
class ReportController {
    /**
     * Get network performance metrics
     */
    getNetworkMetrics = catchAsync(async (req, res) => {
        const { nodeId } = req.user;
        const { period = '30d', depth = 3 } = req.query;

        const metrics = await analyticsService.getNetworkMetrics(nodeId, period, depth);
        
        res.status(200).json({
            status: 'success',
            data: metrics
        });
    });

    /**
     * Get commission analytics
     */
    getCommissionAnalytics = catchAsync(async (req, res) => {
        const { nodeId } = req.user;
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const analytics = await analyticsService.getCommissionAnalytics(
            nodeId, 
            startDate, 
            endDate, 
            groupBy
        );

        res.status(200).json({
            status: 'success',
            data: analytics
        });
    });

    /**
     * Get team performance report
     */
    getTeamPerformance = catchAsync(async (req, res) => {
        const { nodeId } = req.user;
        const { period = '30d', metrics = ['sales', 'recruits', 'commissions'] } = req.query;

        const performance = await analyticsService.getTeamPerformance(
            nodeId,
            period,
            metrics
        );

        res.status(200).json({
            status: 'success',
            data: performance
        });
    });

    /**
     * Get rank progression analysis
     */
    getRankAnalytics = catchAsync(async (req, res) => {
        const { nodeId } = req.user;
        const { period = '90d' } = req.query;

        const rankAnalytics = await analyticsService.getRankProgressionAnalytics(
            nodeId,
            period
        );

        res.status(200).json({
            status: 'success',
            data: rankAnalytics
        });
    });

    /**
     * Get genealogy report
     */
    getGenealogyReport = catchAsync(async (req, res) => {
        const { nodeId } = req.user;
        const { depth = 3, includeMetrics = true } = req.query;

        const genealogy = await nodeService.getDetailedGenealogy(
            nodeId,
            depth,
            includeMetrics
        );

        res.status(200).json({
            status: 'success',
            data: genealogy
        });
    });

    /**
     * Get financial performance report
     */
    getFinancialReport = catchAsync(async (req, res) => {
        const { nodeId } = req.user;
        const { startDate, endDate, metrics = ['revenue', 'commissions', 'withdrawals'] } = req.query;

        const financials = await financeService.getFinancialReport(
            nodeId,
            startDate,
            endDate,
            metrics
        );

        res.status(200).json({
            status: 'success',
            data: financials
        });
    });

    /**
     * Get activity report
     */
    getActivityReport = catchAsync(async (req, res) => {
        const { nodeId } = req.user;
        const { startDate, endDate, type } = req.query;

        const activities = await analyticsService.getActivityReport(
            nodeId,
            startDate,
            endDate,
            type
        );

        res.status(200).json({
            status: 'success',
            data: activities
        });
    });

    /**
     * Export report data
     */
    exportReport = catchAsync(async (req, res) => {
        const { nodeId } = req.user;
        const { type, format = 'csv', filters = {} } = req.body;

        const reportData = await analyticsService.generateExportableReport(
            nodeId,
            type,
            format,
            filters
        );

        res.status(200).json({
            status: 'success',
            data: reportData
        });
    });

    /**
     * Get admin dashboard metrics
     */
    getAdminDashboard = catchAsync(async (req, res) => {
        if (!req.user.isAdmin) {
            throw new AppError('Not authorized to access admin dashboard', 403);
        }

        const { period = '30d' } = req.query;

        const dashboard = await analyticsService.getAdminDashboardMetrics(period);

        res.status(200).json({
            status: 'success',
            data: dashboard
        });
    });
}

module.exports = new ReportController();
