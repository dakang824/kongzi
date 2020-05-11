let app = getApp(),
  http = require('../../../../common/request.js');
Page({
  data: {
    isNewUser: false,
    notNewUser: false,
    once: true,
    serverUrl: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
    authoaddress: false
  },
  onLoad(options) {
    let that = this;
    this.setData(options);
    app.login('', function() {
      that.setData({
        newUser: app.globalData.isNewUser
      })
      this.data.award_id ? '' : wx.setNavigationBarTitle({
        title: '拉新提现',
      })
    })

    this.data.award_id ? http.postReq("/community/award/", {
      cmd: "getAwardInfoForSharePage",
      award_id: options.award_id
    }, function(res) {
      that.setData(res.data);
    }) : '';
  },
  onClose() {
    this.setData({
      isNewUser: false,
      notNewUser: false,
    })
  },
  help(e) {
    let that = this,
      province = wx.getStorageSync('province'),
      valid = (that.data.newUser && province == '上海市') ? 1 : 0,
      comment = that.data.newUser ? (province == '上海市' ? '' : '用户地址不是上海') : '不是新用户';

    http.postReq("/community/user/", {
      cmd: "uploadFormid",
      form_id: e.detail.formId
    }, function(res) {})
    if (this.data.award_id) {
      http.postReq("/community/award/", {
        cmd: "joinAwardNewUserTaskV20",
        award_id: that.data.award_id,
        from_id: that.data.from_id,
        valid: valid,
        comment: comment
      }, function() {
        that.data.newUser ? that.setData({
          isNewUser: true,
          newUser: false
        }) : that.setData({
          notNewUser: true,
          newUser: false
        })
        app.globalData.isNewUser = false;
      })
    } else {
      http.postReq("/community/user/", {
        cmd: "joinCashApplyTaskV20",
        cash_id: that.data.cash_id,
        from_id: that.data.from_id,
        valid: valid,
        comment: comment
      }, function() {
        that.data.newUser ? that.setData({
          isNewUser: true,
          newUser: false
        }) : that.setData({
          notNewUser: true,
          newUser: false
        })
        app.globalData.isNewUser = false;
      })
    }
  },
  onShow() {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.setData({
          authoaddress: false
        })
        app.getAddress(function() {})
      },
      fail(res) {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userLocation']) {
              that.setData({
                authoaddress: true
              })
            } else {
              that.setData({
                authoaddress: false
              })
            }
          },
          fail(res) {
            console.log('调用失败')
          }
        })
      }
    })
    this.setData({
      newUser: app.globalData.isNewUser
    })
  },
  getPrize() {
    wx.reLaunch({
      url: '/pages/new/waitPrizes/waitPrizes',
    })
  },
  getDirect() {
    wx.reLaunch({
      url: `/pages/new/luckyDetail/luckyDetail?award_id=${award_id}&draw_id=${draw_id}`,
    })
  },
  onShareAppMessage(){}
})