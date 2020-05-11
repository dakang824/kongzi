let APP = getApp(), http = require('../../../common/request.js');
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
  onLoad(options) {
    let { prod_type, prod_id, prod_no } = options
    this.setData({
      options,
      'options.prod_type': Number(prod_type),
      'options.prod_id': Number(prod_id),
      'options.prod_no': Number(prod_no),
    })
    this.getMyTickets();
  },
  //查询券转赠状态
  getMyTickets() {
    let that = this;
    http.postReq("/community/coupon/", {
      cmd: "getCoupontransferStatus",
      item_id: that.data.options.id,
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
          opeid: wx.getStorageSync('userInfo').id
        });
      }
    })
  },
  //领取转赠
  getTicket(e) {
    http.postReq("/community/coupon/", {
      cmd: "getTransferCoupon",
      item_id: this.data.options.id,
      // isNewUser: APP.globalData.isNewUser,
      // valid: (APP.globalData.isNewUser && wx.getStorageSync('province') == '上海市') ? 1 : 0
    }, res=> {
      let { prod_type, prod_id, prod_no } = this.data.options;
      this.setData({
        result: 1,
      })
      prod_type && prod_id && prod_no ? Dialog.alert({
        title: '温馨提示',
        zIndex:'99999999',
        message: '已成功领取，页面将直接跳转到相关商品。使用方法：点击【立即购买】->【下一步】->【提交】->【确认0元付款】。'
      }).then(() => {
        wx.redirectTo({
          url: `/pages/bargain/bargain?act_no=${prod_no}&inst_id=${prod_id}&ope_id=${wx.getStorageSync('userInfo').id}&from_id=0&source=31`,
        })
      }):'';
    })
  },
 
  onPullDownRefresh() {
    this.getMyTickets();
  },
  onShareAppMessage() {}
})