import Toast from '../../../dist/toast/toast';
let http = require('../../../common/request.js'),
  app = getApp();
import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed:true,
    show: false,
    rootUrl: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
    booknum: true,
    t1: '分',
    t2: '享',
    t3: '朋',
    t4: '友',
    t5: '圈',
    t6:'返',
    t7:'利'
  },
  
  onLoad: function(options) {
    let that = this,tx=this.data.t6+this.data.t7,
      txt = this.data.t1 + this.data.t2 + this.data.t3 + this.data.t4 + this.data.t5,
      data = JSON.parse(options.data)
    this.setData({
      txt: txt,
      tx:tx,
      data: options.data,
      d: data,
      booknum: (data.booknum ? false : true)
    });

    http.postReq("/community/user/", {
      cmd: data.type != 4 || data.isInstOrders ? 'getActFriendsterPosterV2' : 'getActFriendsterPoster',
      union_id: data.inst_id,
      act_no: data.act_no,
    }, function(res) {
      that.setData({
        shareImg: res.path
      })
    })
  },
  saveImg() {
    let that = this;
    Util.saveImg(this.data.rootUrl + this.data.shareImg, function () {
      that.setData({
        show: false
      });
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  shareFriend() {
    this.setData({
      show: true
    })
  },
  onShareAppMessage: function(e) {
    let data = this.data.d,
      that = this;
    let path = (data.type == 4 || data.isInstOrders == 0) ? `/pages/bargain/bargain?act_no=${data.act_no}&inst_id=${data.inst_id}&fromid=${wx.getStorageSync('userInfo').open_id}&share=true&source=23&from_id=${wx.getStorageSync('userInfo').open_id}` : `/pages/bargain/active/bargain?act_no=${data.act_no}&inst_id=${data.inst_id}&fromid=${wx.getStorageSync('userInfo').open_id}&share=true&source=23&from_id=${wx.getStorageSync('userInfo').open_id}`
    var shareObj = {
      title: '分享返利',
      imageUrl: data.pic_path,
      path: path,
      success: function(res) {
       
      },
      fail: function() {
        
      }
    };
    return shareObj;
  }
})