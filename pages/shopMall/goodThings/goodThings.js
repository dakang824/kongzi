let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    newProucts:[],//好物推荐
    recommend:[],//新品推荐
    topAds:[],//广告轮播
    serverUrl:APP.globalData.serverUrl,//服务器地址
  },
  onLoad: function(options) {
    this.productPageInit();
  },
  productPageInit() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'productPageInit',
    }, function(res) {
      wx.stopPullDownRefresh();
      that.setData({
        newProucts:res.newProucts,
        recommend:res.recommend,
        topAds:res.topAds,
      })
    })
  },
 
  bindFocus(){
    wx.navigateTo({
      url:"/pages/shopMall/search/search"
    })
  },
  onPullDownRefresh: function() {
    let that = this;
    that.productPageInit();
  },
  onShareAppMessage() {}
})