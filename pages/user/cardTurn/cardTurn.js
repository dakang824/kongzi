let app = getApp(),
  http = require('../../../common/request.js');
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    url: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
  },
  call(){
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  onLoad: function(options) {
    console.log(options);
    let that=this;
    this.setData(options);
    http.postReq("/community/user/", {
      cmd: "getStoreCardsDetail",
      item_id: that.data.id
    }, function (res) {
      that.setData({
        d: res.data[0]
      })
    })
  },
  getCard(){
    let that = this;
    http.postReq("/community/user/", {
      cmd: "getTransferCard",
      item_id: that.data.id
    }, function (res) {
      that.setData({
        'd.transfer_result': true
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