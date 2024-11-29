/**
 * Date utility functions for analytics and reporting
 */

/**
 * Calculate date range based on period string
 * @param {string} period - Period in format '30d', '12w', '6m', '1y'
 * @returns {Object} Object with startDate and endDate
 */
function calculateDateRange(period) {
    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);
    
    const value = parseInt(period);
    const unit = period.slice(-1).toLowerCase();
    
    switch (unit) {
        case 'd': // days
            startDate.setDate(startDate.getDate() - value);
            break;
        case 'w': // weeks
            startDate.setDate(startDate.getDate() - (value * 7));
            break;
        case 'm': // months
            startDate.setMonth(startDate.getMonth() - value);
            break;
        case 'y': // years
            startDate.setFullYear(startDate.getFullYear() - value);
            break;
        default:
            throw new Error('Invalid period format. Use format like "30d", "12w", "6m", "1y"');
    }
    
    // Set time to start/end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
}

/**
 * Format date for display
 * @param {Date} date 
 * @param {string} format - 'short', 'long', or 'iso'
 * @returns {string}
 */
function formatDate(date, format = 'short') {
    if (!date) return '';
    
    const d = new Date(date);
    
    switch (format) {
        case 'short':
            return d.toLocaleDateString();
        case 'long':
            return d.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case 'iso':
            return d.toISOString();
        default:
            return d.toLocaleDateString();
    }
}

/**
 * Group dates by period
 * @param {Date[]} dates 
 * @param {string} groupBy - 'day', 'week', 'month', 'year'
 * @returns {Object} Grouped dates
 */
function groupDatesByPeriod(dates, groupBy = 'day') {
    return dates.reduce((groups, date) => {
        const d = new Date(date);
        let key;
        
        switch (groupBy) {
            case 'day':
                key = d.toISOString().split('T')[0];
                break;
            case 'week':
                // Get Monday of the week
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(d.setDate(diff));
                key = monday.toISOString().split('T')[0];
                break;
            case 'month':
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                break;
            case 'year':
                key = d.getFullYear().toString();
                break;
            default:
                key = d.toISOString().split('T')[0];
        }
        
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(date);
        return groups;
    }, {});
}

/**
 * Check if date is within range
 * @param {Date} date 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {boolean}
 */
function isDateInRange(date, startDate, endDate) {
    const d = new Date(date);
    return d >= new Date(startDate) && d <= new Date(endDate);
}

/**
 * Get date periods for comparison
 * @param {string} period - Current period string (e.g., '30d')
 * @returns {Object} Current and previous period date ranges
 */
function getComparisonPeriods(period) {
    const { startDate: currentStart, endDate: currentEnd } = calculateDateRange(period);
    
    // Calculate previous period
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    
    const previousStart = new Date(previousEnd);
    const value = parseInt(period);
    const unit = period.slice(-1).toLowerCase();
    
    switch (unit) {
        case 'd':
            previousStart.setDate(previousStart.getDate() - value);
            break;
        case 'w':
            previousStart.setDate(previousStart.getDate() - (value * 7));
            break;
        case 'm':
            previousStart.setMonth(previousStart.getMonth() - value);
            break;
        case 'y':
            previousStart.setFullYear(previousStart.getFullYear() - value);
            break;
    }
    
    return {
        current: { startDate: currentStart, endDate: currentEnd },
        previous: { startDate: previousStart, endDate: previousEnd }
    };
}

module.exports = {
    calculateDateRange,
    formatDate,
    groupDatesByPeriod,
    isDateInRange,
    getComparisonPeriods
};
