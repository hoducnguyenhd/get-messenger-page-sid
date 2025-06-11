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
