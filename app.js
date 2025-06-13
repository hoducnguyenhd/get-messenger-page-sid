app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const sender_psid = event.sender.id;

        // Lấy text từ tin nhắn
        const message_text = event.message?.text || null;

        // Ưu tiên lấy payload từ postback hoặc quick_reply nếu có
        const quick_reply_payload = event.message?.quick_reply?.payload || null;
        const postback_payload = event.postback?.payload || null;
        const payload = postback_payload || quick_reply_payload || null;

        // action_type là title của postback button (nếu có)
        const action_type = event.postback?.title || null;

        // Bỏ qua nếu không có text hoặc payload
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
