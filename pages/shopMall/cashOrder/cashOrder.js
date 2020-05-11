const APP = getApp(),
  http = require('../../../common/request.js');
import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed: true,
    postData: {
      cmd: "getAgentOrders",
      status: '',
      page_no: 1,
      page_size: 10,
    },
    all: [],
    noPay: [],
    payOver: [],
    serverUrl: APP.globalData.serverUrl,
    shareImg: false
  },
  
  errorImg(e) {
    let i = e.currentTarget.dataset.i, status = this.data.postData.status;
    if(status===0){
      let noPay = this.data.noPay;
      list[i].pic_path = '';
      this.setData({
        noPay
      });
    } else if (status === 1){
      let payOver = this.data.payOver;
      payOver[i].pic_path = '';
      this.setData({
        payOver
      });
    } else{
      let all = this.data.all;
      all[i].pic_path = '';
      this.setData({
        all
      });
    }
  },
  showShare() {
    this.setData({
      shareImg: true
    })
  },
  onClose() {
    this.setData({
      shareImg: false
    })
  },
  initValue() {
    this.setData({
      'postData.page_no': 1,
      all: [],
      noPay: [],
      payOver: []
    })
  },
  onChange(e) {
    let i = e.detail.index;
    this.initValue();
    this.setData({
      'postData.status': i == 1 ? 0 : i == 2 ? 1 : '',
    })
    this.getData();
  },
  onLoad(e) {
    wx.hideShareMenu();
    let s, d, toTime = Util.getNowTime(), fromTime = Util.getNowTime(-30);
    try {
      s = JSON.parse(e.s);
      d = JSON.parse(e.d);
    } catch (s) {
      s = JSON.parse(decodeURIComponent(e.s));
      d = JSON.parse(decodeURIComponent(e.d));
    }
    this.setData({
      s,
      d,
      fromTime, toTime, nowTime: toTime, 'postData.from': fromTime, 'postData.to': toTime
    });
    this.getData();
  },
  timeChange(e) {
    this.initValue();
    let id = e.currentTarget.dataset.id;
    if (id == 1) {
      this.setData({
        'postData.from': e.detail.value,
        fromTime: e.detail.value,
      });
    } else if (id == 2) {
      if (this.compareDate(e.detail.value, this.data.fromTime)) {
        this.setData({
          'postData.to': e.detail.value,
          toTime: e.detail.value
        });
      }else{
        return;
      }
    } 
    this.getData();
  },
  compareDate(d1, d2) {
    let is = false;
    if (((new Date(d1.replace(/-/g, "\/"))) > (new Date(d2.replace(/-/g, "\/"))))) {
      is = true;
    } else {
      wx.showToast({
        title: '日期范围错误!',
        icon:'none'
      });
    }
    return is;
  },
  getData() {
    let that = this,
      status = that.data.postData.status;
    http.postReq("/community/agent/", that.data.postData, (res) => {
      // res.data.records.length ? '' : wx.showToast({
      //   title: '已加载完毕',
      //   icon: 'none'
      // })
      status === 0 ? this.setData({
        noPay: that.data.noPay.concat(res.data.records)
      }) : status === 1 ? this.setData({
        payOver: that.data.payOver.concat(res.data.records)
      }) : that.setData({
        all: that.data.all.concat(res.data.records)
      })
      wx.stopPullDownRefresh();
    })
  },
  onReachBottom() {
    this.setData({
      'postData.page_no': this.data.postData.page_no + 1
    });
    this.getData();
  },
  onPullDownRefresh() {
    this.initValue();
    this.getData();
  },
  onShareAppMessage() {
    this.onClose();
    return {
      path: `/pages/shopMall/cashOrder/cashOrder?from_id=${wx.getStorageSync('userInfo').id}`
    }
  }
})