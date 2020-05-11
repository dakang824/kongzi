let app = getApp(),
  http = require('../../../common/request.js');
Page({
  data: {
    image: ''
  },
  call(){
    wx.makePhoneCall({
      phoneNumber: this.data.cards.shop_mobile,
    })
  },
  onLoad(e) {
    this.setData({id:e.id});
    http.postReq("/community/industry/", {
      cmd:'getMyCardComment',
      card_id: e.id
    }, res => {
      this.setData({
        cards: res.data
      });
    })
  },

  clearImg() {
    this.setData({
      image: ''
    })
  },
  lookImg() {
    let {
      image
    } = this.data;
    wx.previewImage({
      urls: [image],
    })
  },
  uploadImg() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: ((res) => {
        this.setData({
          image: res.tempFilePaths[0]
        })
      })
    })
  },
  submit() {
    let {id}=this.data;
    wx.uploadFile({
      url: app.globalData.serverUrl + "community/industry/",
      filePath: this.data.image,
      name: 'image',
      formData: {
        cmd: 'commitCardComment',
        ope_id: wx.getStorageSync('userInfo').id,
        card_id: id
      },
      success:res=>{
        this.setData({'cards.review_status':1})
      }
    })
  },
  onShareAppMessage() {

  }
})