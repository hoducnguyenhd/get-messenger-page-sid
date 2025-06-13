require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express(); // 🟢 Quan trọng: khởi tạo express app
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const HA_WEBHOOK_URL = process.env.HA_WEBHOOK_URL;

// Webhook verification endpoint
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

// Webhook message handler
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const sender_psid = event.sender.id;

        const message_text = event.message?.text || null;
        const quick_reply_payload = event.message?.quick_reply?.payload || null;
        const postback_payload = event.postback?.payload || null;
        const payload = postback_payload || quick_reply_payload || null;
        const action_type = event.postback?.title || null;

        if (!message_text && !payload) {
          console.log(`⚠️ Bỏ qua event không cần thiết từ ${sender_psid}`);
          continue;
        }

        console.log('📩 PSID:', sender_psid);
        console.log('📝 Tin nhắn:', message_text);
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

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));
