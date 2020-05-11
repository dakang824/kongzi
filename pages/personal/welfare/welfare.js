Page({
  data: {
    postData:{
      checked:false,
    },
    success:0,
    ...getApp().globalData
  },
  jump(){
    wx.redirectTo({
      url: '/pages/personal/welfare/from/from',
    })
  },
  onLoad(e){
    this.setData(e)
  },
  onShareAppMessage() {

  }
})