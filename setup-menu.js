// setup-menu.js
require('dotenv').config();
const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function setupMenu() {
  const url = `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`;

  const payload = {
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: [
          {
            title: "🎛 Điều khiển thiết bị",
            type: "nested",
            call_to_actions: [
              {
                title: "Bật đèn",
                type: "postback",
                payload: "BAT_DEN"
              },
              {
                title: "Tắt đèn",
                type: "postback",
                payload: "TAT_DEN"
              },
              {
                title: "Mở Quạt",
                type: "postback",
                payload: "BAT_QUAT"
              }
            ]
          },
          {
            title: "📅 Xem lịch",
            type: "postback",
            payload: "XEM_LICH"
          },
          {
            title: "🌤 Thời tiết",
            type: "postback",
            payload: "XEM_THOI_TIET"
          },
          {
            title: "📱 Mở Home Assistant",
            type: "nested",
            call_to_actions: [
              {
                title: "Mở App HA",
                type: "web_url",
                url: "homeassistant://navigate/lovelace/default_view",
                webview_height_ratio: "full"
              },
              {
                title: "Mở Web HA",
                type: "web_url",
                url: "https://434gp.ddnsfree.com:8123", 
                webview_height_ratio: "full"
              }
            ]
          }
        ]
      }
    ],
    get_started: {
      payload: "GET_STARTED"
    }
  };

  try {
    const response = await axios.post(url, payload);
    console.log("✅ Đã thiết lập persistent menu và nút Bắt đầu.");
  } catch (error) {
    console.error("❌ Lỗi setup menu:", error.response?.data || error.message);
  }
}

module.exports = setupMenu;
