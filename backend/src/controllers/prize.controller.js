const prizeService = require('../services/prize.service');

class PrizeController {
  async claimPrize(req, res) {
    console.log('[PrizeController] POST /prizes/claim - user:', req.user ? req.user.id : 'anon', 'body:', req.body);
    try {
      if (!req.user) {
        console.warn('[PrizeController] No user in request');
        throw new Error('Authentication required');
      }
      const result = await prizeService.claimPrize({ userId: req.user.id });
      console.log('[PrizeController] Prize claim result:', result);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error('[PrizeController] Error in claimPrize:', error.message, error.stack);
      res.status(400).json({ success: false, message: error.message });
    }
  }
  async listPrizeConfigs(req, res) {
    try {
      const configs = await prizeService.getAllPrizeConfigs();
      res.json({ success: true, data: configs });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
  async createPrizeConfig(req, res) {
    console.log('[PrizeController] POST /prizes/config body:', req.body);
    try {
      const data = req.body;
      // Validation
      const requiredFields = ['title', 'amount', 'startTimeUTC', 'durationMinutes', 'maxWinners', 'isActive'];
      const missing = requiredFields.filter(f => data[f] === undefined || data[f] === null || data[f] === '');
      if (missing.length > 0) {
        console.warn('[PrizeController] Missing required fields:', missing);
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
      }
      const config = await prizeService.createPrizeConfig(data);
      console.log('[PrizeController] Prize config created:', config);
      res.status(201).json({ success: true, data: config });
    } catch (error) {
      console.error('[PrizeController] Error creating prize config:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updatePrizeConfig(req, res) {
    try {
      const { id } = req.params;
      const config = await prizeService.updatePrizeConfig(Number(id), req.body);
      res.json({ success: true, data: config });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPrizeConfig(req, res) {
    try {
      console.log('[PrizeController] GET /prizes/config - looking for active prize config (isActive: true)');
      const config = await prizeService.getPrizeConfig();
      console.log('[PrizeController] Active prize config returned:', config);
      res.json({ success: true, data: config });
    } catch (error) {
      console.error('[PrizeController] Error in getPrizeConfig:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deletePrizeConfig(req, res) {
    try {
      const { id } = req.params;
      await prizeService.deletePrizeConfig(Number(id));
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }



  async getPrizeClaims(req, res) {
    try {
      const { prizeWindowId } = req.query;
      if (!prizeWindowId) {
        return res.status(400).json({ success: false, message: 'prizeWindowId is required' });
      }
      const claims = await prizeService.getPrizeClaims(prizeWindowId);
      res.json({ success: true, data: claims });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PrizeController();
