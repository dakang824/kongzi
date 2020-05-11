let app = getApp(),
  http = require('../../../common/request.js');
import Toast from '../../../dist/toast/toast';
import Dialog from '../../../dist/dialog/dialog';
import Util from '../../../utils/util.js';
Page({
  data: {
    serverUrl: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
    showMask: false,
    show: false,
    isNeed: true,
  },
  onClose() {
    this.setData({
      show: false
    })
  },
  errorImg(e) {
    let data = this.data.data,
      i = e.target.dataset.i;
    data[i].pic_path = '';
    this.setData({
      data: data
    });
  },
  onLoad: function(options) {
    let that = this;
    this.setData(options);
    this.getPost(function(){})
  },
  getPost(fn){
    let that=this;
    wx.showLoading({
      title: '请稍等...',
    })
    http.postReq("/community/user/", {
      cmd: 'getCashApplyTaskPoster',
      cash_id: that.data.cash_id,
      amount: that.data.money
    }, function (res) {
      that.setData({
        path: res.path,
      });
      wx.hideLoading();
      fn();
    })
  },
  onShow() {
    this.getData();
  },
  getData() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'getMyCashApplyNewUsers',
      cash_id: that.data.cash_id,
    }, function(res) {
      that.setData(res);
      if (res.apply_info.status == 1) {
        Dialog.alert({
          title:'温馨提示',
          message: '恭喜您已完成任务,请耐心等待审核...',
          showConfirmButton:'我知道了'
        }).then(() => {
          
        });
      }
    })
  },
  isAvailable(e) {
    let d = e.currentTarget.dataset.i;
    if (!d.valid) {
      wx.showToast({
        title: d.comment,
        icon: 'none',
      })
    }
  },
  saveImg() {
    let that = this;
    Util.saveImg(this.data.serverUrl + this.data.path, function () {
      that.setData({
        show: false
      });
    });
  },
  shareFriend() {
    let that = this;
    this.data.path ? this.setData({
      show: true
    }) : this.getPost(function () {
      that.data.path ? that.setData({
        show: true
      }) : wx.showToast({
        title: '生成海报失败,请稍后再试',
        icon: 'none'
      })
    });
  },
  onChange(e) {
    this.setData({
      timeData: e.detail
    });
  },
  getPrize() {
    wx.navigateTo({
      url: `/pages/new/getPrize/getPrize?nua_id=${this.data.newUserTask_info.nua_id}`,
    })
  },
  closeMask() {
    this.setData({
      showMask: false,
    })
  },
  onPullDownRefresh: function() {
    this.getData();
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function(e) {
    let that = this,
      d = wx.getStorageSync('userInfo');
    if (e.from = 'button') {
      return {
        title: '找到一个好玩的平台,助我一力。',
        path: `/pages/new/pullNewUser/directGet/directGet?from_id=${d.id}&cash_id=${that.data.cash_id}&money=${that.data.money}`,
        imageUrl: app.globalData.imageurl + 'share_img2.png',
      };
    }
  }
})