require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const setupMenu = require('./setup-menu');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const HA_WEBHOOK_URL = process.env.HA_WEBHOOK_URL;

// ✅ Thiết lập persistent menu nếu không phải development
if (process.env.NODE_ENV !== 'development') {
  setupMenu();
}

// ✅ Gửi Quick Reply để xác nhận lại user
async function sendQuickReply(sender_psid) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: sender_psid },
        messaging_type: "RESPONSE",
        message: {
          text: "📩 Vui lòng bấm vào lựa chọn bên dưới để xác nhận bạn vẫn đang hoạt động:",
          quick_replies: [
            {
              content_type: "text",
              title: "Tôi ở đây ✅",
              payload: "CONFIRM_USER"
            }
          ]
        }
      }
    );
    console.log('✅ Đã gửi quick reply để xác nhận lại user');
  } catch (err) {
    console.error('❌ Lỗi khi gửi quick reply:', err.response?.data || err.message);
  }
}

// ✅ Xử lý xác minh webhook
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

// ✅ Xử lý sự kiện từ Messenger
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const sender_psid = event.sender.id;
        const message = event.message || null;
        const postback = event.postback || null;

        let text = null;
        let payload = null;
        let action_type = null;

        if (message) {
          text = message.text || null;

          if (message.quick_reply) {
            payload = message.quick_reply.payload;
            action_type = 'quick_reply';
          }
        } else if (postback) {
          payload = postback.payload;
          action_type = 'button';
        }

        // Không có tin nhắn hoặc payload thì bỏ qua
        if (!text && !payload) {
          console.log(`⚠️ Bỏ qua event không chứa nội dung hoặc payload từ ${sender_psid}`);
          continue;
        }

        console.log('📩 PSID:', sender_psid);
        console.log('📝 Text:', text);
        console.log('📦 Payload:', payload);
        console.log('🔘 Action Type:', action_type);

        // Gửi về Home Assistant Webhook
        try {
          await axios.post(HA_WEBHOOK_URL, {
            sender_id: sender_psid,
            text,
            payload,
            action_type,
          });
          console.log('✅ Đã gửi dữ liệu đến Home Assistant');
        } catch (err) {
          console.error('❌ Lỗi gửi dữ liệu đến HA:', err.message);
        }

        // Nếu chỉ là tin nhắn văn bản mà không có quick_reply, gửi lại quick reply để xác nhận user
        if (text && !payload) {
          await sendQuickReply(sender_psid);
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
