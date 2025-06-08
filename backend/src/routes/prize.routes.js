const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prize.controller');

// Admin CRUD
router.post('/config', prizeController.createPrizeConfig);
router.put('/config/:id', prizeController.updatePrizeConfig);
router.get('/config', prizeController.getPrizeConfig);
router.get('/configs', prizeController.listPrizeConfigs); // NEW: list all
router.delete('/config/:id', prizeController.deletePrizeConfig);

// User claim
router.post('/claim', prizeController.claimPrize);

// Admin: get all claims for a window
router.get('/claims', prizeController.getPrizeClaims);

module.exports = router;
