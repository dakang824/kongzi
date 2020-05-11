let http = require('../../../common/request.js'),
  APP = getApp();
Page({
  data: {
    dataList: null,
    serverUrl: APP.globalData.serverUrl,
  },
  onLoad: function(options) {
    let that = this;
    options.park_id?http.postReq("/community/ticket/", {
      cmd: "getParkDetail",
      ticket_id: options.id,
      park_id: options.park_id,
    }, function(res) {
      that.setData({
        dataList: res
      })
    }):wx.showModal({
      title: '警告',
      content: '关键参数缺失,请联系开发人员维修。',
    })
  },
  callUp() {
    wx.makePhoneCall({
      phoneNumber: APP.globalData.servPhone,
    })
  },
  onShareAppMessage() {}
})