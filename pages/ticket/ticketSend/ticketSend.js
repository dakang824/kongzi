let app = getApp(),
  http = require('../../../common/request.js');
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    url: app.globalData.serverUrl,
  },
  onLoad: function (options) {
    this.setData(options);
    let p = wx.getStorageSync('position'),
      that = this;
    http.postReq("/community/coupon/", {
      cmd: "getFunTickettransferStatus",
      item_id: options.id,
      latitude: p.latitude,
      longitude: p.longitude,
    }, function (res) {
      let r=res.data[0];
      that.setData({
        d: r,
        isTransfer: r.isTransfer,
        result: r.result,
        s: 'result' in r
      })
    })
  },
  goGet(){
    let that=this;
    http.postReq("/community/coupon/", {
      cmd: "getTransferFunTicket",
      item_id: that.data.id
    }, function (res) {
      that.setData({
        result:1
      })
      Dialog.alert({
        title: '温馨提示',
        message: '领取成功'
      }).then(() => {
        wx.switchTab({
          url: '/pages/new/index/index',
        })
      });
    })
  },
  onShareAppMessage() {}
})