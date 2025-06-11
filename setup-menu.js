require('dotenv').config();
const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const menuData = {
  persistent_menu: [
    {
      locale: "default",
      composer_input_disabled: false,
      call_to_actions: [
        {
          type: "postback",
          title: "📋 Xem thời tiết",
          payload: "XEM_THOI_TIET"
        },
        {
          type: "postback",
          title: "📋 Lịch vạn niên",
          payload: "XEM_LICH_VAN_NIEN"
        },
        {
          type: "postback",
          title: "📋 Điều khiển thiết bị",
          payload: "DIEU_KHIEN_THIET_BI"
        }
      ]
    }
  ]
};

axios.post(`https://graph.facebook.com/v18.0/me/messenger_profile?access_token=$
