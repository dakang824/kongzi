let http = require('../../../common/request.js'),
  app = getApp();
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    url: app.globalData.serverUrl,
    list: [],
    modify: false
  },
  onLoad(options) {
    options.d = JSON.parse(options.d);
    this.setData(options);
    let arr = [];
    arr.push(options.d);
    this.setData({
      list: arr
    })
    this.getData();
  },
  onInput(e) {
    let i = e.currentTarget.dataset.i;
    i == 1 ? this.setData({
      'res.name': e.detail
    }) : i == 2 ? this.setData({
      'res.contact': e.detail
    }) : i == 3 ? this.setData({
      'res.age': e.detail
    }) : '';
  },
  getData() {
    let that = this;
    http.postReq("/community/order/", {
      cmd: 'getOrdertransferStatus',
      order_id: that.data.id
    }, function(res) {
      that.setData({
        res: res.order_info,
        result: res.data[0].result,
        ope_id:wx.getStorageSync('userInfo').id
      })
    })
  },
  goGet() {
    let d = this.data.d;
    if (d.type == 5) {
      this.setData({
        modify: true
      });
      return;
    }
    this.sendData();
  },
  sendData() {
    let that = this;
    let d = this.data.d, url = {
      cmd: 'getTransferOrder',
      id: that.data.id,
    };
    if (d.type == 5) {
      let res = this.data.res;
      url.name = res.name;
      url.age = res.age;
      url.contact = res.contact;
    }
    http.postReq("/community/order/", url, res=> {
      this.getData();
      this.setData({
        result: true
      })
      let { type,prod_type, prod_id, prod_no}=this.data.d;
      type == 3 && prod_type && prod_id && prod_no ? Dialog.alert({
        title: '温馨提示',
        message: '已成功领取，页面将直接跳转到相关商品。使用方法：点击【直接购买】->【下一步】->【提交】->【确认0元付款】。'
      }).then(() => {
        wx.redirectTo({
          url: `/pages/bargain/bargain?act_no=${prod_no}&inst_id=${prod_id}&ope_id=${wx.getStorageSync('userInfo').id}&from_id=0&source=31`,
        })
      }): '';
    })
  },
  onShareAppMessage(){}
})