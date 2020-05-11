let http = require('../../../common/request.js'), app = getApp();
Page({
  data: {
    list: [],
    imgUrl: app.globalData.serverUrl,
  },
  onLoad: function (e) {
    this.setData({headTit:e})
    let that=this;
    http.postReq("/community/user/", {
      cmd: 'getSharedProfitDetailV2',
      ope_id: wx.getStorageSync('userInfo').id,
      inst_id: e.inst_id,
      act_no: e.act_no
    }, function (res) {
      for(let item of res.data){
        item.nickname = decodeURIComponent(item.nickname);
        item.create_time = item.create_time.slice(0,10);
      }
      that.setData({ list: res.data })
    })
  },
  jump(e){
    let data = e.currentTarget.dataset.item;
    wx.setStorageSync('onceData', data)
    wx.navigateTo({
      url: '/pages/rebate/rebate_detail/detail/index',
    })
  },
  onShareAppMessage() {}
})