const axios = require("axios");
require("dotenv").config();

async function setupMenu() {
  const token = process.env.PAGE_ACCESS_TOKEN;

  const url = `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${token}`;

  const payload = {
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
  };

  try {
    const response = await axios.post(url, payload);
    console.log("✅ Đã thiết lập menu:", response.data);
  } catch (error) {
    console.error("❌ Lỗi setup menu:", error.message);
    console.error("📄 Chi tiết:", error.response?.data);
  }
}

module.exports = setupMenu;
