const axios = require('axios');
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function setupMenu() {
  const url = `https://graph.facebook.com/v17.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`;

  // Đặt nút "Bắt đầu"
  await axios.post(url, {
    get_started: {
      payload: "GET_STARTED"
    }
  });

  // Thiết lập menu cố định
  await axios.post(url, {
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: [
          {
            type: "postback",
            title: "📋 Xem thông tin thời tiết",
            payload: "WEATHER_INFO"
          },
          {
            type: "postback",
            title: "📋 Xem lịch vạn niên",
            payload: "LUNAR_CALENDAR"
          },
          {
            type: "postback",
            title: "📋 Điều khiển thiết bị",
            payload: "DEVICE_CONTROL"
          }
        ]
      }
    ]
  });

  console.log("✅ Đã thiết lập persistent menu và nút Bắt đầu.");
}

module.exports = setupMenu;
