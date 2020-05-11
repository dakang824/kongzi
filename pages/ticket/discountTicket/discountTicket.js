let app = getApp(),
  http = require('../../../common/request.js');
import Dialog from '../../../dist/dialog/dialog';
import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed:'',
    show: false,
    imgUrl: app.globalData.imageurl,
    radio: '2',
    num: '1',
    amount: 0,
    t: false,
    status: 0,
    money: 0,
    no: 0,
    balance: 0
  },
  stepperChange(e) {
    this.setData({
      num: e.detail,
      amount: this.data.money * e.detail
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone
    })
  },
  onLoad: function(options) {
    let that = this;
    this.setData(options)
    this.setData({
      balance: wx.getStorageSync('userInfo').balance,
      amount: options.money
    })
    http.postReq("/community/user/", {
      cmd: "getCardsDetail",
      item_id: options.id
    }, function(res) {
      that.setData({
        money: res.data[0].price,
        amount: res.data[0].price
      })
      that.setData(res.data[0])
    })
  },
  onClose() {
    this.setData({
      show: false
    })
  },
  buy() {
    this.setData({
      show: true
    })
  },
  onChange(event) {
    this.setData({
      radio: event.detail
    });
  },
  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset;
    this.setData({
      radio: name
    });
  },
  layer() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getOrderTicketTasks',
    }, function(res) {
      res.tasks[0].each_tickets != 0 ? Dialog.alert({
        title: '温馨提示',
        message: `恭喜您，获得${that.data.num * res.tasks[0].each_tickets}张抽奖券。赶快去抽奖吧！`,
        confirmButtonText: '我知道了',
      }).then(() => {
        wx.redirectTo({
          url: '/pages/user/cardTicket/cardTicket',
        })
      }) : wx.redirectTo({
        url: '/pages/user/cardTicket/cardTicket',
      });
    })
  },
  payMoney:Util.throttle(function (e) {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'unifiedStoreCardOrder',
      pay_type: that.data.radio,
      num: that.data.num,
      amount: that.data.amount,
      store_card_id: that.data.id,
      source: "",
      from_id: "",
    }, function (res) {
      if (that.data.radio == 1) {
        app.login(this, function () {
          that.onClose();
          that.layer()
        })
      } else {
        app.wxpay(res.payParams, function () {
          app.login(this, function () {
            that.onClose();
            that.layer()
          })
        })
      }
    })
  }),
  cancelTransferCard() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'cancelTransferCard',
      item_id: that.data.id,
    }, function(res) {
      that.setData({
        status: 0
      })
    })
  },
  onShareAppMessage: function(e) {
    if (e.from == 'button') {
      let that = this,
        d = wx.getStorageSync('userInfo');
      http.postReq("/community/user/", {
        cmd: "transferMyCard",
        id: that.data.id,
      }, function(res) {
        that.setData({
          'status': 2
        })
      })
      let name = encodeURIComponent(d.nickname);
      var shareObj = {
        title: d.nickname + '分享给你一张卡券,请注意查收',
        path: `/pages/user/cardTurn/cardTurn?name=${name}&pic_path=${d.pic_path}&id=${that.data.id}&no=${that.data.no}&valid_from=${that.data.valid_from}&valid_to=${that.data.valid_to}`,
        imageUrl: app.globalData.imageurl + 'sharepage.jpg',
      };
      return shareObj;
    }
  }
})