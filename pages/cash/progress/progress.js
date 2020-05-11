let http = require('../../../common/request.js'),app= getApp();;
Page({
  data: {

  },
  onShow: function () {
    let that=this;
    http.postReq("/community/user/", {
      cmd: 'getMyCashApplyRecords',
    }, function (res) {
      that.setData({d:res.data})
    })
  },
  goinfo(e){
    let d=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/new/CashNewUser/CashNewUser?cash_id=${d.id}&money=${d.amount/100}`,
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  onShareAppMessage() {}
})