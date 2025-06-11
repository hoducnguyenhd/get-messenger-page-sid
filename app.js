// Load các biến môi trường từ file .env
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const setupMenu = require('./setup-menu'); // Import hàm thiết lập menu

const app = express();
app.use(bodyParser.json());

// Đọc biến môi trường từ .env
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const HA_WEBHOOK_URL = process.env.HA_WEBHOOK_URL;

// Route kiểm tra kết nối Webhook với Facebook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified');
      res.status(200).send(challenge);
    } else {
      console.warn('❌ Token không hợp lệ');
      res.sendStatus(403);
    }
  }
});

// Route nhận dữ liệu từ Facebook Messenger
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      const event = entry.messaging[0];
      const sender_psid = event.sender.id;
      const message_text = event.message?.text || '[Không phải tin nhắn văn bản]';

      console.log('📩 PSID:', sender_psid);
      console.log('📝 Tin nhắn:', message_text);

      // Gửi toàn bộ payload về Home Assistant
      axios.post(HA_WEBHOOK_URL, body)
        .then(response => {
          console.log('✅ Đã gửi đến Home Assistant:', response.status);
        })
        .catch(error => {
          console.error('❌ Lỗi gửi HA:', error.message);
        });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Tự động gọi setup menu khi khởi động
setupMenu().catch(err => {
  console.error("❌ Lỗi setup menu:", err.message);
});

// Khởi chạy server
const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));
