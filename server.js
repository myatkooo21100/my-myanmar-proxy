const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

// တကယ့် e-ID API Gateway ၏ မူလ Domain ကြီး
const TARGET_API_URL = 'https://api.eid.gov.mm';

// CORS Error မတက်အောင် ခွင့်ပြုပေးခြင်း
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Request များကို e-ID Server ဆီသို့ Proxy လွှဲပေးခြင်း
app.use('/', createProxyMiddleware({
    target: TARGET_API_URL,
    changeOrigin: true,
    secure: false,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXY REQUEST]: ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('[PROXY ERROR]:', err);
        res.status(500).send('Proxy Error');
    }
}));

app.listen(PORT, () => {
    console.log(`Myanmar Proxy Server is running on port ${PORT}`);
});
