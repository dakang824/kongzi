let http = require('../../../common/request.js'),
  app = getApp();
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    rootUrl: app.globalData.serverUrl,
    imageurl: app.globalData.imageurl,
    show: false
  },
  getData() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: "getMyPrizes",
    }, function(res) {
      that.setData({
        list: res.data
      });
    })
  },
  onLoad: function(options) {
    this.getData();
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  goLuck(e) {
    let d = this.data.list[e.currentTarget.dataset.i];
    this.setData({
      show: true,
      t: d
    });
  },
  onPullDownRefresh: function() {
    this.getData();
    wx.stopPullDownRefresh();
  },
  
  onShareAppMessage() {}
})