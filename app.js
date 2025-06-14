require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const HA_WEBHOOK_URL = process.env.HA_WEBHOOK_URL;

// ✅ Kiểm tra biến môi trường
if (!PAGE_ACCESS_TOKEN || !VERIFY_TOKEN || !HA_WEBHOOK_URL) {
  console.error('❌ Thiếu biến môi trường bắt buộc (PAGE_ACCESS_TOKEN, VERIFY_TOKEN, HA_WEBHOOK_URL)');
  process.exit(1);
}

// ✅ Thiết lập menu khi khởi động
const setupMenu = require('./setup-menu');
setupMenu()
  .then(() => {
    console.log('✅ Đã thiết lập persistent menu và nút Bắt đầu.');
  })
  .catch((err) => {
    console.error('❌ Lỗi khi thiết lập menu:', err.message);
  });

// ✅ Facebook webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook đã được xác minh.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Xử lý sự kiện từ Facebook Messenger
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    res.status(200).send('EVENT_RECEIVED');

    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const sender_psid = event.sender?.id || 'unknown';

        // Mặc định
        let text = event.message?.text || null;
        let payload = null;
        let action_type = null;
        let emoji = '';

        if (event.postback?.payload) {
          payload = event.postback.payload;
          action_type = 'button';
          emoji = '🕹️';
        } else if (event.message?.quick_reply?.payload) {
          payload = event.message.quick_reply.payload;
          action_type = 'quick_reply';
          emoji = '⚙️';
        } else if (event.message?.text) {
          emoji = '📨';
        } else if (event.read) {
          emoji = '👁️';
          action_type = 'read';
        } else if (event.delivery) {
          emoji = '📬';
          action_type = 'delivery';
        } else if (event.reaction) {
          emoji = '❤️';
          action_type = 'reaction';
        } else {
          emoji = '📎';
          action_type = 'other';
        }

        console.log(`\n[${new Date().toISOString()}]`);
        console.log(`${emoji} PSID: ${sender_psid}`);
        if (text) console.log(`📝 Text: ${text}`);
        if (payload) console.log(`📦 Payload: ${payload}`);
        if (action_type) console.log(`🔘 Action Type: ${action_type}`);

        try {
          const response = await axios.post(HA_WEBHOOK_URL, {
            sender_id: sender_psid,
            text,
            payload,
            action_type,
            raw_event: event,
          });

          console.log('✅ Đã gửi tới Home Assistant. Phản hồi:', response.data);
        } catch (err) {
          console.error('❌ Lỗi gửi dữ liệu đến Home Assistant:', err.response?.data || err.message);
        }
      }
    }
  } else {
    res.sendStatus(404);
  }
});

// ✅ Khởi động server
const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
