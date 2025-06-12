require('dotenv').config();
const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function setupMenu() {
  try {
    const request_body = {
      persistent_menu: [
        {
          locale: "default",
          composer_input_disabled: false,
          call_to_actions: [
      {
        title: "🔌 Điều khiển thiết bị",
        type: "nested",
        call_to_actions: [
          {
            type: "postback",
            title: "💡 Bật đèn",
            payload: "BAT_DEN"
          },
          {
            type: "postback",
            title: "🔌 Tắt đèn",
            payload: "TAT_DEN"
          }
        ]
      },
            {
              type: "postback",
              title: "🔌 Chức năng tuỳ chỉnh",
              payload: "OPTION"
            },
            {
              title: "📅 Xem lịch vạn niên",
              type: "web_url",
              url: "https://www.xemlicham.com",
              webview_height_ratio: "full"
            },
            {
              type: "postback",
              title: "🌦️ Thời tiết hiện tại",
              payload: "THOI_TIET"
            },
            {
              title: "📱 Mở Home Assistant",
              type: "web_url",
              url: process.env.HA_URL,
              webview_height_ratio: "full"
            }
          ]
        }
      ]
    };

    const res = await axios.post(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      request_body
    );

    console.log('✅ Đã thiết lập persistent menu.');
  } catch (err) {
    console.error('❌ Lỗi setup menu:', err.response?.data || err.message);
  }
}

module.exports = setupMenu;
