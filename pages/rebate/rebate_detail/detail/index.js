let app=getApp();
Page({
  data: {
    imgUrl: app.globalData.serverUrl,
  },
  onLoad: function(e) {
    let data=wx.getStorageSync('onceData');
    data.nickname = decodeURIComponent(data.nickname);
    for (let item of data.others) {
      item.nickname = decodeURIComponent(item.nickname);
      item.create_time = item.create_time.slice(0, 10);
    }
    this.setData({ data: data });
    wx.removeStorageSync('onceData')
  },
  onShareAppMessage() {}
})