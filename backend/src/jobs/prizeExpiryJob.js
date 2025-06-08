const prisma = require('../lib/prisma');
const { addMinutes, isAfter } = require('date-fns');

async function expirePrizes() {
  try {
    const now = new Date();
    console.log(`[PrizeExpiryJob] Checking for expired prizes at ${now.toISOString()}`);

    // Find all active prizes with a duration set
    const activePrizes = await prisma.prizeConfig.findMany({ 
      where: { 
        isActive: true,
        durationMinutes: {gte:0},
       
      } 
    });

    console.log(`[PrizeExpiryJob] Found ${activePrizes.length} active prizes to check`);

    let expiredCount = 0;
    
    for (const prize of activePrizes) {
      try {
        // Calculate expiration time based on prize creation time + duration
        const expirationTime = addMinutes(new Date(prize.createdAt), prize.durationMinutes);

        if (isAfter(now, expirationTime)) {
          console.log(`[PrizeExpiryJob] Prize ${prize.id} expired at ${expirationTime.toISOString()}`);

          await prisma.prizeConfig.update({
            where: { id: prize.id },
            data: { 
              isActive: false,
              updatedAt: new Date()
            },
          });

          console.log(`[PrizeExpiryJob] Successfully deactivated prize ${prize.id}`);
          expiredCount++;
        }
      } catch (prizeError) {
        console.error(`[PrizeExpiryJob] Error processing prize ${prize.id}:`, prizeError);
        // Continue with other prizes even if one fails
      }
    }

    console.log(`[PrizeExpiryJob] Completed. Deactivated ${expiredCount} prizes.`);
    return { success: true, expiredCount };
  } catch (error) {
    console.error('[PrizeExpiryJob] Fatal error:', error);
    throw error;
  }
}

/**
 * Checks if a prize has expired based on its creation time and duration
 * @param {Object} prize - The prize object from the database
 * @returns {boolean} - True if the prize has expired
 */
function isPrizeExpired(prize) {
  if (!prize.durationMinutes) return false;
  const expirationTime = addMinutes(new Date(prize.createdAt), prize.durationMinutes);
  return isAfter(new Date(), expirationTime);
}

module.exports = {
  expirePrizes,
  isPrizeExpired
};
