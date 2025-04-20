const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const { createQRIS, checkStatus } = require('./qris');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static('/tmp'));

app.get('/api/qris/:amount/:codeqr', async (req, res) => {
    const { amount, codeqr } = req.params;
    if (!amount && !codeqr) return res.status(400).json({ error: 'Parameter amount dan qrcode dibutuhkan' });

    try {
        const feeServer = Math.floor(Math.random() * 200);
        const total = parseInt(amount) + feeServer;
        const qris = await createQRIS(total, codeqr);

        const filename = `qris-${qris.transactionId}.png`;
        fs.writeFileSync('/tmp/' + filename, qris.qrImage);


        res.json({
            amount: amount,
            feeServer,
            total,
            trxId: qris.transactionId,
            expired: qris.expirationTime,
            qrUrl: `${req.protocol}://${req.get('host')}/${filename}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Gagal Membuat Qris', detail: error.message });
    }
});

app.get('/api/status/:merchant/:token', async (req, res) => {
    const { merchant, token } = req.params;

    try {
        const status = await checkStatus(merchant, token);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Gagal Mengecek Status', detail: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server Running');
});
