let app = getApp(),
  http = require('../../../common/request.js');
Page({
  data: {
    url: app.globalData.serverUrl,
    isNeed:true
  },
  onLoad: function(options) {
    this.setData(options);
    let p = wx.getStorageSync('position'),
      that = this;
    http.postReq("/community/ticket/", {
      cmd: "queryMyParkTicketDetail",
      id: options.id,
      latitude: p.latitude,
      longitude: p.longitude,
    }, function(res) {
      that.setData({
        d: res.data,
        branches: res.branches,
        isTransfer: res.isTransfer,
        result: res.transfer_info.result
      })
    })
  },
  cancelIncrease() {
    let that = this;
    http.postReq("/community/ticket/", {
      cmd: "cancelTransferParkTickets",
      item_id: that.data.id,
    }, function (res) {
      that.setData({
        isTransfer: false,
        'd.status': 0
      })
    })
  },
  
  onShareAppMessage: function() {
    let that=this,d=wx.getStorageSync('userInfo');
    http.postReq("/community/ticket/", {
      cmd: "transferMyParkTickets",
      id: that.data.id,
    }, function (res) {
      that.setData({
        isTransfer: true,
        'd.status': 2
      })
    })
    let name = encodeURIComponent(d.nickname);
    var shareObj = {
      title: d.nickname+ '分享给你一张' + that.data.name+'门票,请注意查收',
      path: `/pages/ticket/ticketSend/ticketSend?name=${name}&pic_path=${d.pic_path}&id=${that.data.id}`,
      // imageUrl: that.data.url + that.data.d.list_pic,
      imageUrl: app.globalData.imageurl + 'sharepage.jpg',
    };
    return shareObj;
  }
})