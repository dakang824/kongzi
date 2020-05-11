let APP = getApp(),
  http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    serverUrl: APP.globalData.serverUrl, //服务器地址
    imgStr: "data/communityImage/", //图片固定格式
    imgUrl: APP.globalData.imageurl,
    isNewUser: APP.globalData.isNewUser,
    ticket_count: APP.globalData.ticket_count,
    my_count: APP.globalData.my_count,
    newUser: false
  },
  onLoad(options) {
    let that = this,
      o = options;
    this.setData(options);
    new Promise((resolve, reject) => {
      wx.getStorageSync('position') === '' ? APP.getAddress(() => {
        resolve()
      }) : resolve();
    }).then(() => {
      wx.login({
        success: res => {
          let {
            from_id
          } = that.data;
          wx.request({
            url: APP.globalData.serverUrl + 'community/user/',
            data: {
              cmd: 'login',
              code: res.code,
              ...wx.getStorageSync('position'),
              ...o,
              from_id
            },
            method: 'post',
            success(res) {
              let data = res.data.data;
              that.setData({
                login: res.data
              })
              if (res.data.status == 5) {
                APP.globalData.disableTab = false;
                return;
              }
              if (res.data.isNewUser) {
                APP.globalData.isNewUser = true,
                  APP.globalData.ticket_count = res.data.ticket_count,
                  APP.globalData.my_count = res.data.my_count

                that.setData({
                  newUser: true,
                  ticket_count: APP.globalData.ticket_count,
                  my_count: APP.globalData.my_count,
                })
              } else {
                that.setData({
                  ticket_count: res.data.ticket_count,
                  my_count: res.data.my_count,
                })
              }
              data.nickname = decodeURIComponent(data.nickname);
              res.data.status == 1 ? (APP.globalData.userInfo = res.data.data, wx.setStorageSync('userInfo', res.data.data)) : Toast.fail(res.data.msg);
              // that.next();
            },
            fail(res) {
              Toast.fail(res.data.msg);
            }
          })
        }
      })
    })
  },
  closeNewUser() {
    this.setData({
      isNewUser: false,
    })
  },

  goDraw() {
    let that = this,
      province = wx.getStorageSync('province'),
      valid = (APP.globalData.isNewUser && province == '上海市') ? 1 : 0;
    http.postReq("/community/user/", {
      cmd: 'newUserTaskGiveTicket',
      from_id: that.data.from_id,
      valid: valid
    }, res => {
      if (valid) {
        that.setData({
          isNewUser: true
        })
        APP.globalData.isNewUser = false;
      } else {
        wx.navigateTo({
          url: "/pages/new/waitPrizes/waitPrizes"
        })
      }
    })
  },
  onShareAppMessage() {}
})