let app = getApp(),
  http = require('../../../common/request.js');
Page({
  data: {
    serverUrl: app.globalData.serverUrl,
  },
  onLoad: function(options) {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getMyNewUserTaskAwards',
    }, function(res) {
      that.setData({
        list: res.data,
      });
    })
  },
  onShareAppMessage(){}
})