const prisma = require('../lib/prisma');

async function expirePrizes() {
  const now = new Date();
  // Find all active prizes whose window has ended
  const activePrizes = await prisma.prizeConfig.findMany({ where: { isActive: true } });
  for (const prize of activePrizes) {
    // Compute window end
    const [hour, minute] = prize.startTimeUTC.split(':').map(Number);
    const windowStart = new Date(prize.createdAt);
    windowStart.setUTCHours(hour, minute, 0, 0);
    const windowEnd = new Date(windowStart.getTime() + prize.durationMinutes * 60000);
    if (now > windowEnd) {
      await prisma.prizeConfig.update({
        where: { id: prize.id },
        data: { isActive: false },
      });
      console.log(`[PrizeExpiryJob] Marked prize ${prize.id} as inactive (expired)`);
    }
  }
}

module.exports = expirePrizes;
