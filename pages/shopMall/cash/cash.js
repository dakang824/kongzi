const app = getApp(),
  http = require('../../../common/request.js');
import Util from '../../../utils/util.js';
Page({
  data: {
    type: 3,
    amount: ''
  },
  allApply() {
    this.setData({
      amount: this.data.d.available
    });
  },
  cashOut:Util.throttle(function (e) {
    let {
      type,
      amount
    } = this.data;
    wx.request({
      url: app.globalData.serverUrl + 'community/agent/',
      method: 'post',
      data: {
        cmd: 'getAgentCashout',
        amount,
        type,
        ope_id: wx.getStorageSync('userInfo').id
      },
      success(res) {
        wx.stopPullDownRefresh();
        res.data.status == 1 ? (wx.showToast({
          title: '提现成功',
          duration: 2000
        }), setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)) : wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  }),
  onLoad(e) {
    wx.hideShareMenu();
    let s, d;
    try {
      s = JSON.parse(e.s);
      d = JSON.parse(e.d);
    } catch (s) {
      s = JSON.parse(decodeURIComponent(e.s));
      d = JSON.parse(decodeURIComponent(e.d));
    }
    
    this.setData({
      s,
      d
    })
  },
  onInput(e) {
    this.setData({
      amount: e.detail.value > this.data.d.available ? this.data.d.available : e.detail.value
    })
  },
  onSelType(e) {
    this.setData({
      type: e.currentTarget.dataset.i
    })
  },
  onPullDownRefresh() {
  },
  onShareAppMessage() {}
})