let APP = getApp();
let http = require('../../../common/request.js');
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    serverUrl: APP.globalData.serverUrl, //服务器地址
    imgStr: "data/communityImage/", //图片固定格式
    id: null,
    options: null,
    result: 0, //是否领取
    cancelStatus: true, //已取消
    showMask: false
  },
  onLoad: function(options) {
    let that = this;
    options.get_time = options.get_time.slice(0, 10).replace(/-/g, ".");
    options.valid_time = options.valid_time.slice(0, 10).replace(/-/g, ".");
    this.setData({
      options: options
    })
    that.getMyTickets();
  },
  onShow: function() {
    this.onLoad();
  },
  //查询抽奖券转赠状态
  getMyTickets() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "getAwardTicketTransferStatus",
      id: that.data.options.id,
    }, res=> {
      wx.stopPullDownRefresh()
      if (res.data.length == 0) {
        that.setData({
          cancelStatus: true,
        })
      } else {
        that.setData({
          result: res.data[0].result,
          cancelStatus: false,
        });
      }
    })
  },
  //领取转赠
  getTicket(e) {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "getTransferAwardTickets",
      item_id: that.data.options.id,
      isNewUser: APP.globalData.isNewUser,
      valid: (APP.globalData.isNewUser && wx.getStorageSync('province') == '上海市') ? 1 : 0
    }, res=> {
      that.data.result = 1;
      that.setData({
        result: that.data.result,
        showMask: true
      })
    })
  },
  //是否过期 3天以内为过期
  isValid(nowTime) {
    let timestamp = new Date().getTime();
    let date = new Date(nowTime.slice(0, 19)).getTime() - timestamp;
    let days = Math.floor(date / (24 * 3600 * 1000));
    if (days < 3 && days > 0) {
      return true
    } else {
      return false
    }
  },
  closeMask() {
    this.setData({
      showMask: false
    })
  },
  onPullDownRefresh: function() {
    this.getMyTickets();
  },
  onShareAppMessage() {}
})