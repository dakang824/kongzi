let http = require('../../common/request.js'),
  app = getApp();
import Dialog from '../../dist/dialog/dialog';
Page({
  data: {
    isGet: false,
    imgUrl: app.globalData.imageurl,
    authoaddress: false,
    isNewUser: app.globalData.isNewUser,
    ticket_count: app.globalData.ticket_count,
    my_count: app.globalData.my_count,
    show_msg: "",
    isNewUser: false,
    imgStr: "data/communityImage/", //图片固定格式
    serverUrl: app.globalData.serverUrl, //服务器地址
  },
  onLoad(options) {
    this.setData(options);
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.setData({
          authoaddress: false
        })
        wx.setStorageSync('position', res);
        wx.setStorageSync('latitude', res.latitude);
        wx.setStorageSync('longitude', res.longitude);
        that.getTicket();
      },
      fail(res) {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userLocation']) {
              that.setData({
                authoaddress: true
              })
            }
          },
          fail(res) {
            console.log('调用失败')
          }
        })
      }
    })
  },
  getTicket() {
    let that = this;
    app.login("", res => {
      wx.request({
        url: app.globalData.serverUrl + "community/award/",
        data: {
          cmd: 'doQrcodeTicketTaskV20',
          qr_id: that.data.qr_id,
          ...wx.getStorageSync('position'),
          ope_id: wx.getStorageSync("userInfo").id,
          isNewUser: app.globalData.isNewUser,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        method: "POST",
        success(res) {
          'payback' in res ? Dialog.alert({
            title: '温馨提示',
            message: res.payback,
            confirmButtonText: '我知道了'
          }).then(() => {}) : that.setData({
            isNewUser: true,
            show_msg: res.data.show_msg
          })
        }
      })
    });
  },
  //关闭弹框
  closeNewUser() {
    this.setData({
      isNewUser: false,
    })
  },
  onShareAppMessage() {}
})