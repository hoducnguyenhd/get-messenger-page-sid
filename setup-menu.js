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
              type: "postback",
              title: "💡 Điều khiển thiết bị",
              payload: "DIEU_KHIEN"
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
              title: "🌦️ Thông tin thời tiết",
              type: "web_url",
              url: process.env.TT_URL,
              webview_height_ratio: "full"
            },
            {
              title: "📱 Mở Home Assistant",
              type: "web_url",
              url: process.env.HA_URL,
              webview_height_ratio: "full"
            }
          ]
        }
      ],
      get_started: {
        payload: "GET_STARTED"
      }
    };

    const res = await axios.post(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      request_body
    );

    console.log('✅ Đã thiết lập persistent menu và nút Bắt đầu.');
  } catch (err) {
    console.error('❌ Lỗi setup menu:', err.response?.data || err.message);
  }
}

module.exports = setupMenu;
