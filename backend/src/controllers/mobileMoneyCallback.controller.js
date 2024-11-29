const nodePaymentService = require('../services/nodePayment.service');

class MobileMoneyCallbackController {
    /**
     * Handle MTN callback
     */
    async handleMtnCallback(req, res) {
        try {
            const result = await nodePaymentService.processMobileMoneyCallback(req.body, 'mtn');
            
            if (!result.success) {
                console.error('MTN callback processing failed:', result.error);
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Error processing MTN callback:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Handle Airtel callback
     */
    async handleAirtelCallback(req, res) {
        try {
            const result = await nodePaymentService.processMobileMoneyCallback(req.body, 'airtel');
            
            if (!result.success) {
                console.error('Airtel callback processing failed:', result.error);
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Error processing Airtel callback:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Query payment status
     */
    async queryPaymentStatus(req, res) {
        try {
            const { paymentId } = req.params;
            const result = await nodePaymentService.queryPaymentStatus(paymentId);
            
            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Error querying payment status:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = new MobileMoneyCallbackController();
