const request = require('request');
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

function setupMenu() {
  return new Promise((resolve, reject) => {
    const request_body = {
      persistent_menu: [
        {
          locale: "default",
          composer_input_disabled: false,
          call_to_actions: [
            {
              type: "postback",
              title: "🔌 Điều khiển thiết bị",
              payload: "DIEU_KHIEN"
            },
            {
              type: "postback",
              title: "📅 Xem lịch vạn niên",
              payload: "XEM_LICH"
            },
            {
              type: "postback",
              title: "🌦️ Thời tiết hiện tại",
              payload: "THOI_TIET"
            },
            {
              title: "📱 Mở Home Assistant",
              type: "nested",
              call_to_actions: [
                {
                  title: "Mở Web HA",
                  type: "web_url",
                  url: "https://434gp.duckdns.org:8123",
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

    request({
      uri: `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      method: 'POST',
      json: request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('✅ Đã thiết lập persistent menu và nút Bắt đầu.');
        resolve();
      } else {
        reject(body || err);
      }
    });
  });
}

module.exports = setupMenu;
