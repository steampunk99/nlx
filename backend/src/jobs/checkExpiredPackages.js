const nodePackageService = require('../services/nodePackage.service');
const logger = require('../utils/logger');

async function checkExpiredPackages() {
    try {
        logger.info('Starting package expiration check job');
        const expiredPackages = await nodePackageService.checkExpiredPackages();
        logger.info(`Processed ${expiredPackages.length} expired packages`);
    } catch (error) {
        logger.error('Error in package expiration check job:', error);
    }
}

module.exports = checkExpiredPackages;
