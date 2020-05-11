let app = getApp(),http = require('../../../common/request.js');
Page({
  data: {
    card_code:'',
    imageurl:app.globalData.imageurl
  },
  call(){
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  submit(){
    let {card_code}=this.data;
    http.postReq("/community/industry/", {
      cmd: "useCodeToCard",
      card_code
    }, res => {
      wx.showToast({
        title: '兑换成功',
        duration:2000
      })
      setTimeout(()=>{
        wx.redirectTo({
          url: `/pages/selCourseCard/submitFrom/submitFrom?card_code=${card_code}`,
        })
      },2000)
    })
  },
  OnInput(e){
    this.setData({card_code:e.detail})
  },
  onShareAppMessage() {

  }
})