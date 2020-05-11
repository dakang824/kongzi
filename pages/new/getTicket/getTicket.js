let APP = getApp();
let http = require('../../../common/request.js');
import Toast from '../../../dist/toast/toast';
import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed: true,
    type: null,
    name: null,
    intropath: null,
    imgStr: "data/communityImage/", //图片固定格式
    serverUrl: APP.globalData.serverUrl, //服务器地址
  },
  onLoad: function(options) {
    this.setData({
      type: options.type,
      name: options.name,
      intropath: options.intro_path
    })
    options.type == 9 ? this.getPoster() : '';
  },
  getPoster() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getSharedTaskFriendsterPoster',
    }, function(res) {
      that.setData({
        shareImg: res.path
      })
    })
  },
  saveImg() {
    let that = this;
    Util.saveImg(this.data.serverUrl + this.data.shareImg, function () {
      that.setData({
        show: false
      });
    });
  },
  shareFriend() {
    this.setData({
      show: true
    })
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  //去个人中心
  goMy() {
    wx.switchTab({
      url: "/pages/user/user"
    })
  },
  onShareAppMessage: function(res) {
    let that = this,
      userInfo = wx.getStorageSync("userInfo");
    if (res.from === 'button') {
      let name = decodeURIComponent(userInfo.nickname);
      return {
        title:'推荐一个好玩的抽奖平台给你，中奖了别忘了我哦！',
        path: `/pages/new/sharePage/sharePage?from_id=${userInfo.id}&task_type=9`,
        imageUrl: APP.globalData.imageurl + 'share_img1.png',
      }
    }else{
      return {
        path: `/pages/new/getTicket/getTicket?from_id=${userInfo.id}`,
      }
    }
  }
})