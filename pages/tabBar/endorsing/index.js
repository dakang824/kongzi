const app = getApp(),{ tabBar } = getApp().globalData,
  http = require('../../../common/request.js');
  import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed: true,
    tabBar,
    imageurl: app.globalData.imageurl,
    url: app.globalData.serverUrl,
    shareImg: false,
    d: null
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
            that.onShow();
          });
        })
      },
    })
  },
  showCode() {
    this.setData({
      shareImg: true
    })
  },
  onClose() {
    this.setData({
      shareImg: false
    })
  },
  jump(e) {
    let {
      i,
      url
    } = e.currentTarget.dataset;
    let [d, s] = [encodeURIComponent(JSON.stringify(this.data.data)), encodeURIComponent(JSON.stringify(this.data.setting))];
    wx.navigateTo({
      url: `${url}?d=${d}&s=${s}`,
    })
  },
  onLoad() {
    Util.editTabbar();
    let that = this;
    wx.hideShareMenu()
    http.postReq("/community/user/", {
      cmd: 'getHomeRecommend1',
    }, res => {
      that.setData({
        recom1: res.recom1,
        ope_id: wx.getStorageSync('userInfo').id,
      })
    })
  },
  onShow() {
    let that = this;
    http.postReq("/community/agent/", {
      cmd: 'getAgentAccount',
    }, res => {
      let {
        data,
        setting,
        recom_name,
      } = res
      that.setData({
        data,
        setting,
        user: wx.getStorageSync('userInfo'),
        recom_name
      })
      that.getAgentMessages2();
      wx.stopPullDownRefresh();
    })
  },
  getAgentMessages2() {
    let that = this;
    http.postReq("/community/agent/", {
      cmd: "getAgentMessages2"
    }, res=> {
      that.setData({
        messageList: res.data
      })
    })
  },    
  onShareAppMessage(e) {
    this.onClose();
    if (e.from == 'button') {
      let { nickname,id}=app.globalData.userInfo;
      return {
        title: `${nickname}邀请您为代言人。`,
        path: `/pages/shopMall/shareGoods/shareGoods?from_id=${id}`,
        imageUrl: this.data.url + this.data.setting.share_pic
      }
    }
  },
  onPullDownRefresh() {
    this.onShow();
  },
})