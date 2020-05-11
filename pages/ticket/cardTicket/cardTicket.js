let app = getApp(),http = require('../../../common/request.js');
Page({
  data: {
    url: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
  },
  onLoad: function (options) {
    let that=this;
    http.postReq("/community/user/", {
      cmd: 'queryStoreCards',
    }, function (res) {
      that.setData({ list: res.data});
    })
  },
  onShareAppMessage() {}
})