let APP = getApp(),
  http = require('../../../common/request.js');
Page({
  data: {
    dataList: null,
    serverUrl: APP.globalData.serverUrl, //服务器地址
    showChoose: false,
    status: 1, //1:未开奖   2：已开奖
    dataList: null,
    active: 0,
    weekArray: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  },
  onLoad: function(options) {
    if (options.active == undefined) {
      this.setData({
        active: 0,
        status: 1
      })
    } else {
      this.setData({
        active: options.active,
        status: 2
      })
    }
  },
  onShow: function() {
    this.getData();
  },
  goDetail(e) {
    let d = e.currentTarget.dataset.i;
    wx.navigateTo({
      url: `/pages/new/luckyDetail/luckyDetail?award_id=${d.award_id}&draw_id=${d.draw_id}`,
    })
  },
  goLuckyDetail(e) {
    let options = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/new/luckyDetail/luckyDetail?award_id=' + options.awardid + "&draw_id=" + options.drawid,
    })
  },
  onChange(e) {
    this.setData({
      status: e.detail.index + 1,
    })
    this.getData();
  },
  getPrize(e) {
    let that = this,
      options = e.currentTarget.dataset.i;
    http.postReq("/community/award/", {
      cmd: 'getMyAwardPrize',
      award_id: options.award_id,
      draw_id: options.draw_id,
    }, function(res) {
      wx.showToast({
        title: "已领取",
        icon: "none"
      })
      that.getData();
    })
  },
  jumpAddress(e) {
    let that = this,
      options = e.currentTarget.dataset.i;
    wx.navigateTo({
      url: `/pages/new/getPrize/getPrize?award_id=${options.award_id}&draw_id=${options.draw_id}&is_get=${options.is_get}`
    })
  },
  getData() {
    let that = this,
      status = that.data.status;
    http.postReq("/community/award/", {
      cmd: 'getMyAwardDraw',
      status: status,
    }, function(res) {
      wx.stopPullDownRefresh()
      for (let key of res.data) {
        key.new_draw_time = key.draw_time.slice(0, 16).replace(/-/g, ".");
        key.week = that.data.weekArray[new Date(key.draw_time.split(" ")[0]).getDay()];
      }
      status == 1 ? that.setData({
        data: res.data
      }) : status == 2 ? that.setData({
        data1: res.data
      }) : status == 3 ? that.setData({
        data2: res.data
      }) : '';
    })
  },
  onPullDownRefresh: function() {
    this.getData();
  },
  onShareAppMessage() {}
})