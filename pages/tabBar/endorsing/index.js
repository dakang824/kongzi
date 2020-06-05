import Util from '../../../utils/util.js';
let { tabBar } = getApp().globalData;
Page({
  data: {
    tabBar,
  },
  onLoad(options) {
    Util.editTabbar();
  },
  onPullDownRefresh: function () {

  },
  onShareAppMessage() {

  }
})