// 导入数据，可以ajax获取
let City = require('../../common/allcity.js');

Page({

  data: {
    city: City,
    config: {
      horizontal: true, // 第一个选项是否横排显示（一般第一个数据选项为 热门城市，常用城市之类 ，开启看需求）
      animation: true, // 过渡动画是否开启
      search: true, // 是否开启搜索
      searchHeight: 50, // 搜索条高度
      suctionTop: true // 是否开启标题吸顶
    }
  },
  onLoad() {
    // wx.showLoading({
    //   title: '加载数据中...',
    // })
    // // 模拟服务器请求异步加载数据
    // setTimeout(() => {
    //   this.setData({
    //     city: City
    //   })
    //   wx.hideLoading()
    // }, 2000)
  },
  binddetail(e) {
    let pages = getCurrentPages(), prevPage = pages[pages.length - 2],address=wx.getStorageSync('address');
    address.address_component.district=e.detail.name;
    wx.setStorageSync('address', address)
    prevPage.onLoad();
    wx.navigateBack({
      delta: 1
    })
  },
  onShareAppMessage() {}
})