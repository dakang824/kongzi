let app = getApp(),
  http = require('../../../common/request.js');
Page({
  data: {
    amount: [10, 20, 50, 100, 200, 500],
    money: 50,
    tickets: 0,
    imgUrl: app.globalData.imageurl,
    showMask:false,
  },
  onLoad(options) {
    this.setData({
      balance: wx.getStorageSync('userInfo').balance
    })
  },
  onClose() {
    this.setData({
      tickets: 0
    })
  },
  inputMoney(e) {
    this.setData({ money: e.detail.value})
  },
  closeMask(){
    this.setData({
      showMask:false
    })
  },
  recharge(){
    this.setData({
      showMask:true
    })
  },
  sureRecharge() {
    let that = this;
    this.setData({ showMask: false});
    http.postReq("/community/user/", {
      cmd: 'parentAccRecharge',
      amount: that.data.money,
    }, res=> {
      app.wxpay(res.payParams, ()=>{
        app.login('', ()=>{
          that.setData({
            balance: wx.getStorageSync('userInfo').balance,
            tickets: res.tickets,
          })
        })
      }, ()=>{})
    })
  },
  selMoney(e) {
    this.setData({
      money: e.currentTarget.dataset.i == this.data.money ? 0 : e.currentTarget.dataset.i
    })
  },
  onShareAppMessage() {}
})