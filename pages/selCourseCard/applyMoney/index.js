let app = getApp(),
  http = require('../../../common/request.js');
Page({
  data: {
    image: ''
  },
  call(){
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  onLoad(e) {
    this.setData({id:e.card_id,e});
    http.postReq("/community/industry/", {
      cmd:'getMyCardCourseComment',
      ...e
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
    let {e}=this.data;
    wx.uploadFile({
      url: app.globalData.serverUrl + "community/industry/",
      filePath: this.data.image,
      name: 'image',
      formData: {
        cmd: 'commitCardCourseComment',
        ope_id: wx.getStorageSync('userInfo').id,
        ...e
      },
      success:res=>{
        let d=JSON.parse(res.data);
        if(d.status==5){
          wx.showModal({
            title: '温馨提示',
            content: d.msg,
            showCancel:false,
            success (res) {
              
            }
          })
        }else{
          this.setData({'cards.audit_status':0})
        }
      }
    })
  },
  onShareAppMessage() {

  }
})