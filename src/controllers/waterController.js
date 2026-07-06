const WaterModel = require('../models/waterModel');

const WaterController = {

    async receiveData(req, res) {

        try {

            const { value } = req.body;

            await WaterModel.createLog(value);

            res.json({
                success: true,
                message: "Water level berhasil disimpan",
                data: value
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                success: false,
                message: "Gagal menyimpan data water level"
            });

        }

    },

    async getData(req, res) {

        try {

            const data = await WaterModel.getRecent();

            res.json(data);

        } catch (err) {

            console.error(err);

            res.status(500).json({
                success: false
            });

        }

    },

    async getLatest(req, res) {

        try {

            const data = await WaterModel.getLatest();

            res.json(data);

        } catch (err) {

            console.error(err);

            res.status(500).json({
                success: false
            });

        }

    }

};

module.exports = WaterController;