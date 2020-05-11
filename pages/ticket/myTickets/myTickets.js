let app = getApp(),
  http = require('../../../common/request.js');
Page({
  data: {
    isNeed:true,
    list: [],
    list1: [],
    list2: [],
    list3: [],
    list4: [],
    list5: [],
    url: app.globalData.serverUrl,
    qrCode: '',
    show: false
  },
  cancelSend(e){
    let that = this;
    http.postReq("/community/coupon/", {
      cmd: "cancelTransferFunTicket",
      item_id: e.target.dataset.id,
    }, function (res) {
      that.getData();
    })
  },
  onLoad: function(options) {
    this.getData();
  },
  onClose() {
    this.setData({
      show: false
    })
  },
  showQRCode(e) {
    this.setData({
      show: true,
      qrCode: e.currentTarget.dataset.qr
    })
  },
  getData() {
    let that = this;
    http.postReq("/community/coupon/", {
      cmd: "getMyFunFicketForAccountPage",
      status: ""
    }, function(res) {
      var list1 = [],
        list2 = [],
        list3 = [],
        list4 = [],
        list5 = [];
      for (let key of res.data) {
        key.status == 0 ? list1.push(key) :
          key.status == 1 ? list2.push(key) :
          key.status == 2 ? list3.push(key) :
          key.status == 3 ? list4.push(key) :
          key.status == 4 ? list5.push(key) : '';
      }
      that.setData({
        list: res.data,
        list1,
        list2,
        list3,
        list4,
        list5
      });
      wx.stopPullDownRefresh();
    })
  },
  onPullDownRefresh: function() {
    this.getData();
  },
  onShareAppMessage: function(e) {
    let that = this, d = wx.getStorageSync('userInfo');
    if (e.from=='button'){
      http.postReq("/community/coupon/", {
        cmd: "transferMyFunTicket",
        id: e.target.dataset.id,
      }, function (res) {
        that.getData();
      })
      return {
        title: d.nickname + '分享给你一张' + e.target.dataset.name + '门票,请注意查收',
        path: `/pages/ticket/ticketSend/ticketSend?name=${encodeURIComponent(d.nickname)}&pic_path=${d.pic_path}&id=${e.target.dataset.id}&tickName=${e.target.dataset.name}&tickpath=${e.target.dataset.toppic}&from_id=${d.id}`,
        imageUrl: app.globalData.imageurl + 'sharepage.jpg',
      };
    }else{
      return {
        path: `/pages/ticket/myTickets/myTickets?&from_id=${d.id}`,
      };
    }
  }
})