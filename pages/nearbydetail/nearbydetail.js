let ajax = require('../../utils/ajax.js');
let app = getApp(),http = require('../../common/request.js');
import Util from '../../utils/util.js';
Page({
  data: {
    imgUrl: app.globalData.serverUrl,
    inst_id: '',
    inst_info: '',
    branches: '',
    acts: '' /* 活动*/ ,
    introImages: '', // 课程介绍
    courseImages: '', //课程图片
    fixed: false,
    tabs: [true, false, false, false],
    init: 0, // 是否加载 0：未加载，1：已加载
  },
  tabsClick(e) {
    var ind = e.currentTarget.dataset.index;
    ind == 1 ? this.setData({
      tabs: [true, false, false, false]
    }) : ind == 2 ? this.setData({
      tabs: [false, true, false, false]
    }) : ind == 3 ? this.setData({
      tabs: [false, false, true, false]
    }) : ind == 4 ? this.setData({
      tabs: [false, false, false, true]
    }) : ''
  },
  getHeight(ele, fun) {
    var tabsHeight = '';
    wx.createSelectorQuery().select(ele).boundingClientRect(function(rect) {
      fun(rect)
    }).exec();
    return tabsHeight;
  },
  onLoad(options) {
    var that = this;
    that.setData(options);
    that.setData({
      inst_id: options.id,
    })
    that.getHeight('#tabs', r=> {
      that.getHeight('#footer', s=> {
        that.setData({
          scrollHeight: app.globalData.systemInfo.screenHeight - (app.globalData.Custom.height + app.globalData.Custom.top + r.height + s.height + 10)
        })
      })
      that.getData();
    })
  },
  onPageScroll(e) {
    this.setData({
      fixed: e.scrollTop > 250
    })
  },
  getData() {
    var that = this;
    http.postReq("/community/user/", {
      cmd: 'getInstDetailV2',
      inst_id: that.data.inst_id
    }, res=> {
      var arr = [],
        r = res.data;
      for (let item of r.union_acts) {
        item.time = Util.dateFormat(item.endDiff);
        item.start_time = item.start_time.slice(0, 10);
        item.end_time = item.end_time.slice(0, 10);
        item.title = decodeURIComponent(item.title);
      }
      for (let item of r.inst_acts) {
        item.time = Util.dateFormat(item.endDiff);
        item.start_time = item.start_time.slice(0, 10);
        item.end_time = item.end_time.slice(0, 10);
        item.title = decodeURIComponent(item.title);
      }
      that.setData({
        d: r,
        ope_id:wx.getStorageSync('userInfo').id
      })
    })
  },
  onPullDownRefresh() {
    this.getData();
    wx.stopPullDownRefresh();
  },
  onShareAppMessage(){},
  reserve(e) {
    let d = this.data.d.inst_info;
    wx.navigateTo({
      url: `../reserve/reserve?id=${d.id}&name=${d.name}&address=${d.address}&logo=${this.data.imgUrl + d.pic_path}&num=${e.currentTarget.dataset.num}`
    })
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.d.inst_info.mobile
    })
  },
  goback() {
    wx.navigateBack({
      delta: 1,
    })
  }
})