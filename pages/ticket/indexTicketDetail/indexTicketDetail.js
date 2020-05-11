let http = require('../../../common/request.js'),
  APP = getApp(),
  config = require('../../../config.js');
import Dialog from '../../../dist/dialog/dialog';
import Util from '../../../utils/util.js';
Page({
  data: {
    options: null,
    dataList: null,
    serverUrl: APP.globalData.serverUrl, //服务器地址
    showMask: false,
    num: 1,
    totalPrice: null,
    radio: '2'
  },
  onLoad: function(options) {
    this.setData({
      options: options,
      balance: wx.getStorageSync('userInfo').balance / 100
    })
    this.getData();
  },
  collet() {
    let that = this,
      collect = this.data.dataList.ticket_info.is_collect;
    http.postReq("/community/ticket/", {
      cmd: "collectParkTickets",
      pticket_id: that.data.options.id
    }, function(res) {
      if (that.data.dataList.ticket_info.is_collect == 1) {
        that.data.dataList.ticket_info.collect_count--;
        that.data.dataList.ticket_info.is_collect = 0;
        that.setData({
          dataList: that.data.dataList

        })
      } else {
        that.data.dataList.ticket_info.collect_count++;
        that.data.dataList.ticket_info.is_collect = 1;
        that.setData({
          dataList: that.data.dataList

        })
      }
      that.setData({
        'dataList.ticket_info.is_collect': !collect,
        dataList: that.data.dataList

      })
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
  getData() {
    let that = this;
    http.postReq("/community/ticket/", {
      cmd: "getParkTicketDetail",
      ticket_id: that.options.id,
      park_id: that.options.park_id,
      ...wx.getStorageSync("position")
    }, function(res) {
      for (let i = 0, len = res.tickets.length; i < len; i++) {
        res.tickets[i].new_maxdis = (res.tickets[i].maxdis / 1000).toFixed(1);
        res.tickets[i].new_mindis = (res.tickets[i].mindis / 1000).toFixed(1);
      }
      that.setData({
        dataList: res,
        totalPrice: res.ticket_info.price
      })
    })
  },
  partDetail() {
    wx.navigateTo({
      url: "../parkIndex/parkIndex?id=" + this.data.options.id + "&park_id=" + this.data.options.park_id
    })
  },
  buy() {
    this.setData({
      showMask: true,
    });
  },
  cancelBuy() {
    this.setData({
      showMask: false
    })
  },
  layer() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getOrderTicketTasks',
    }, function(res) {
      res.tasks[1].each_tickets != 0 ? Dialog.alert({
        title: '温馨提示',
        message: `购买成功\n恭喜您，获得${res.tasks[1].each_tickets}张抽奖券。赶快去抽奖吧！`,
        confirmButtonText: '我知道了',
      }).then(() => {
        wx.navigateBack({
          delta: 1
        })
      }) : Dialog.alert({
        title: '温馨提示',
        message: '购买成功'
      }).then(() => {
        wx.navigateBack({
          delta: 1
        })
      });
    })
  },
  pay:Util.throttle(function (e) {
    let that = this,
      radio = that.data.radio;
    if (radio == 1 && that.data.balance < that.data.totalPrice) {
      wx.showToast({
        title: "余额不足请选择其他支付方式",
        icon: "none"
      })
      return;
    }
    http.postReq("/community/ticket/", {
      cmd: "unifiedParkTicketOrders",
      ticket_id: that.options.id,
      park_id: that.options.park_id,
      num: that.data.num, //购买数量
      pay_type: radio, //1:余额支付  2：微信支付
      soure: "0",
      from_id: "0", //source和from_id 暂时不用传递 或者传递为0
    }, function (res) {
      if (radio == 2) {
        APP.wxpay(res.payParams, function () {
          APP.login(this, function () {
            that.layer();
          })
        });
      } else {
        APP.login(this, function () {
          that.layer();
        })
      }
      that.setData({
        showMask: false,
      })
    })
  }),
  reduce() {
    if (this.data.num == 1) {
      wx.showToast({
        title: "购买数量最小值为1",
        icon: "none"
      })
      return
    } else {
      this.data.num--;
      this.data.totalPrice = (this.data.num * this.data.dataList.ticket_info.price).toFixed(2);
      this.setData({
        num: this.data.num,
        totalPrice: this.data.totalPrice,
      })
    }
  },
  add() {
    this.data.num++;
    this.data.totalPrice = (this.data.num * this.data.dataList.ticket_info.price).toFixed(2);
    this.setData({
      num: this.data.num,
      totalPrice: this.data.totalPrice,
    })
  },
  onShareAppMessage() {}
})