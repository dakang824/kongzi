const app = getApp(),
  http = require('../../../common/request.js');
var time = null;
import Util from '../../../utils/util.js';
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    isNeed: true,
    show: false,
    imageurl: app.globalData.imageurl,
    url: app.globalData.serverUrl,
    shareImg: false,
    showAutho: false,
    isShare: false,
    options: {}
  },
  showAutho() {
    this.setData({
      showAutho: true
    })
  },
  getInfo() {
    let that = this;
    wx.getUserInfo({
      success(res) {
        http.postReq("/community/user/", {
          cmd: 'modifyMyInfo',
          nickname: res.userInfo.nickName,
          ...res.userInfo
        }, res => {
          app.login('', () => {
            that.onLoad(that.data.options);
          });
        })
      },
    })
  },
  onClose() {
    this.setData({
      show: false,
      shareImg: false
    })
  },

  showShareLayer() {
    this.setData({
      shareImg: true
    })
  },
  onInput(e) {
    let i = e.currentTarget.dataset.i;
    i == 1 ? this.setData({
      name: e.detail
    }) : i == 2 ? this.setData({
      mobile: e.detail
    }) : i == 3 ? this.setData({
      address: e.detail
    }) : '';
  },
  onSubmit() {
    let {
      name,
      mobile,
      address
    } = this.data;
    Util.subscribeMessage({
      tmplIds: ['bblbHuIHOy0RMwJvAAzqXBEJnmm0e8RSbb9_wL4cYfo'],
      success() {
        http.postReq("/community/agent/", {
          cmd: 'confirmAgentGift',
          name,
          mobile,
          address
        }, res => {
          wx.redirectTo({
            url: '/pages/shopMall/shareGoods/main/main',
          })
        })
      }
    })
  },
  success() {
    let that = this;
    http.postReq("/community/agent/", {
      cmd: 'getAgentGift',
    }, res => {
      that.setData({
        show: true,
        ...res.data[0]
      })
    })
  },
  swiperChange(e) {
    let {
      msg,
      current
    } = this.data;
    current += 1
    msg.length == current ? this.getAgentMessages() : this.setData({
      current
    })
  },
  getAgentMessages() {
    let that = this;
    http.postReq("/community/agent/", {
      cmd: 'getAgentMessages',
    }, res => {
      that.setData({
        msg: res.data,
        current: 0
      });
      res.data.length == 1 || !res.data.length ? time = setTimeout(() => {
        that.getAgentMessages();
      }, 3000) : '';
    }, true)
  },
  onLoad(options) {
    this.setData({
      isShare: Object.keys(options).length && options.hasOwnProperty('from_id'),
      options
    });
    let that = this;
    wx.hideShareMenu()
    new Promise((resolve, reject) => {
      http.postReq("/community/agent/", {
        cmd: 'getAgentAccount',
        from_id: options.from_id
      }, res => {
        res.status == 9 ? Dialog.alert({
          title: '温馨提示',
          message: res.msg,
          confirmButtonText: "我知道了",
          zIndex: 99999999,
        }).then(() => {
          wx.switchTab({
            url: '/pages/new/index/index',
          })
        }) : res.data.status == 0 ? wx.showModal({
          title: '温馨提示',
          content: '您的代言账户已被禁用，请联系客服解决。',
          cancelText: '退出',
          confirmText: '联系客服',
          success(res) {
            res.confirm ? wx.makePhoneCall({
              phoneNumber: app.globalData.servPhone
            }) : wx.navigateBack({
              delta: 1
            })
          }
        }) : res.data.status == 3 ? wx.redirectTo({
          url: '/pages/shopMall/shareGoods/main/main',
        }) : wx.setNavigationBarTitle({
          title: '自购省钱、分享赚钱',
        });
        that.setData({
          d: res.data,
          setting: res.setting,
          user: wx.getStorageSync('userInfo'),
          len: (res.data.spoke_count / res.data.spoke_need) * 95,
          recom_name: res.recom_name
        })
        resolve();
        wx.stopPullDownRefresh();
      })
    }).then(() => {
      http.postReq("/community/user/", {
        cmd: 'getHomeRecommend1',
      }, res => {
        that.setData({
          recom1: res.recom1,
          ope_id: wx.getStorageSync('userInfo').id,
        })
        this.getAgentMessages();
      })
    })
  },
  onShareAppMessage(e) {
    this.onClose();
    if (e.from == 'button') {
      return {
        path: `/pages/shopMall/shareGoods/shareGoods?from_id=${wx.getStorageSync('userInfo').id}`,
        imageUrl: this.data.url + this.data.setting.share_pic
      }
    }
  },
  onPullDownRefresh() {
    this.onLoad(this.data.options);
  },
  onUnload() {
    clearTimeout(time);
  }
})