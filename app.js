// Load các biến môi trường từ file .env
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Đọc biến môi trường từ .env
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const HA_WEBHOOK_URL = process.env.HA_WEBHOOK_URL;

// Hàm gửi tin nhắn về Messenger
function sendMessage(sender_psid, text) {
  const messageData = {
    recipient: { id: sender_psid },
    message: { text: text }
  };

  axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
    .then(() => console.log(`📤 Đã gửi đến ${sender_psid}: ${text}`))
    .catch(err => console.error('❌ Lỗi gửi tin nhắn:', err.response?.data || err.message));
}

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

      if (event.message && event.message.text) {
        const message_text = event.message.text;
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

      } else if (event.postback) {
        const payload = event.postback.payload;
        console.log('📥 Postback từ PSID:', sender_psid);
        console.log('📌 Payload:', payload);

        switch (payload) {
          case 'XEM_THOI_TIET':
            sendMessage(sender_psid, '🌤 Thời tiết hôm nay là nắng đẹp, 30°C.');
            break;
          case 'XEM_LICH_VAN_NIEN':
            sendMessage(sender_psid, '📅 Hôm nay là mùng 15 tháng 5 âm lịch.');
            break;
          case 'DIEU_KHIEN_THIET_BI':
            sendMessage(sender_psid, '💡 Bạn muốn bật/tắt thiết bị nào?');
            break;
          default:
            sendMessage(sender_psid, '❓ Không hiểu yêu cầu của bạn.');
        }
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Khởi chạy server
const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));

const setupMenu = require('./setup-menu');
setupMenu().catch(err => console.error("❌ Lỗi setup menu:", err.message));

