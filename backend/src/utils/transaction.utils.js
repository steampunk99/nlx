/**
 * Generates a unique transaction ID with format TRA[timestamp][6-digit-random]
 * @returns {string} The generated transaction ID
 */
function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TRA${timestamp}${random}`;
}

module.exports = {
    generateTransactionId
};
