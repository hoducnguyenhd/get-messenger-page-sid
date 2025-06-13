require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const HA_WEBHOOK_URL = process.env.HA_WEBHOOK_URL;

// ✅ Thiết lập Persistent Menu khi khởi động ứng dụng
const setupMenu = require('./setup-menu');
setupMenu()
  .then(() => {
    console.log('📌 setupMenu() hoàn tất khi khởi động ứng dụng.');
  })
  .catch((err) => {
    console.error('❗ Lỗi khi chạy setupMenu() trong app.js:', err.message);
  });

// ✅ Xác minh webhook từ Facebook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Xử lý tin nhắn và postback từ người dùng
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const sender_psid = event.sender.id;
        const message_text = event.message?.text || null;

        // Phân biệt postback vs quick_reply
        let payload = null;
        let action_type = null;

        if (event.postback?.payload) {
          payload = event.postback.payload;
          action_type = "button";
        } else if (event.message?.quick_reply?.payload) {
          payload = event.message.quick_reply.payload;
          action_type = "quick_reply";
        }

        // Bỏ qua các tin không chứa thông tin cần thiết
        if (!message_text && !payload) {
          console.log(`⚠️ Bỏ qua event không quan trọng từ ${sender_psid}`);
          continue;
        }

        console.log('📩 PSID:', sender_psid);
        console.log('📝 Text:', message_text);
        console.log('📦 Payload:', payload);
        console.log('🔘 Action Type:', action_type);

        try {
          await axios.post(HA_WEBHOOK_URL, {
            sender_id: sender_psid,
            text: message_text,
            payload: payload,
            action_type: action_type,
          });
          console.log('✅ Đã gửi đến Home Assistant');
        } catch (err) {
          console.error('❌ Lỗi gửi HA:', err.message);
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// ✅ Khởi động server
const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));
