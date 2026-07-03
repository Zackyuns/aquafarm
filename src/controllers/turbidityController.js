const TurbidityModel = require('../models/turbidityModel');

const TurbidityController = {

    async receiveData(req, res) {
        try {
            const { turbidity } = req.body;

            if (turbidity === undefined) {
                return res.status(400).json({
                    message: 'Data turbidity wajib ada'
                });
            }

            await TurbidityModel.createLog(turbidity);

            res.status(201).json({
                message: 'Turbidity berhasil disimpan',
                data: turbidity
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async getData(req, res) {
        try {
            const limit = req.query.limit || 10;

            const data = await TurbidityModel.getRecent(limit);

            res.json({
                message: 'Berhasil ambil data turbidity',
                data
            });

        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    async getLatest(req, res) {
        try {
            const data = await TurbidityModel.getLatest();

            res.json({
                message: 'Data terbaru',
                data
            });

        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

};

module.exports = TurbidityController;
