const RelayModel = require('../models/relayModel');

const RelayController = {

    async getStatus(req, res) {
        try {
            const data = await RelayModel.getStatus();

            res.json({
                status: data.status
            });

        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    async turnOn(req, res) {
        try {
            await RelayModel.setStatus('ON');

            res.json({
                message: 'Relay ON'
            });

        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    async turnOff(req, res) {
        try {
            await RelayModel.setStatus('OFF');

            res.json({
                message: 'Relay OFF'
            });

        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

};

/**
 * AUTO FEEDER
 * Menyalakan relay sebentar untuk memberi pakan
 */
async function feedNow(req, res) {
    try {
        await RelayModel.setStatus('ON');

        // mati otomatis setelah 3 detik
        setTimeout(async () => {
            await RelayModel.setStatus('OFF');
        }, 3000);

        res.json({ message: 'Feeding triggered' });

    } catch (error) {
        res.status(500).json({ message: 'Feed error' });
    }
}

/**
 * AUTO DRAIN
 * Menguras air dengan relay (pompa/valve)
 */
async function drainNow(req, res) {
    try {
        await RelayModel.setStatus('ON');

        setTimeout(async () => {
            await RelayModel.setStatus('OFF');
        }, 5000);

        res.json({ message: 'Drain triggered' });

    } catch (error) {
        res.status(500).json({ message: 'Drain error' });
    }
}

// export juga
RelayController.feedNow = feedNow;
RelayController.drainNow = drainNow;

module.exports = RelayController;
