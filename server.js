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
    // 👇 Render တွင် Body (JSON) Data များကို မှန်ကန်စွာ Forward ဖြစ်စေရန်
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXYING]: ${req.method} ${req.url}`);
        if (req.body && Object.keys(req.body).length > 0) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onError: (err, req, res) => {
        console.error('[PROXY ERROR]:', err);
        res.status(500).json({ error: 'Proxy Error', details: err.message });
    }
}));

app.listen(PORT, () => {
    console.log(`Myanmar Proxy Server is running on port ${PORT}`);
});
