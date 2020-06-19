let app = getApp(),
  http = require('../../../common/request.js');
Page({
  data: {
    image: '',
    show: false,
    super_code: '',
    start:null,
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  touchstart(e){
    this.setData({start:e.timeStamp})
  },
  touchend(e){
    let {start}=this.data;
    e.timeStamp-start>=3000?this.longPress():'';
  },
  onConfirm() {
    let {
      code
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: 'checkSuperCOde',
      super_code: code
    }, res => {
      this.setData({
        super_code: code
      })
    });
  },
  onChange(e) {
    this.setData({
      code: e.detail
    })
  },
  onLoad(e) {
    this.setData({
      id: e.card_id,
      e
    });
    http.postReq("/community/industry/", {
      cmd: 'getMyCardCourseComment',
      ...e
    }, res => {
      this.setData({
        cards: res.data
      });
    })
  },
  longPress() {
    let {
      cards
    } = this.data;
    if (cards.audit_status === "" || cards.audit_status == 2) {
      this.setData({
        show: true
      })
    }
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
    let {
      e,
      super_code,
      cards
    } = this.data;
    wx.uploadFile({
      url: app.globalData.serverUrl + "community/industry/",
      filePath: this.data.image,
      name: 'image',
      formData: {
        cmd: 'commitCardCourseComment',
        ope_id: wx.getStorageSync('userInfo').id,
        super_code,
        id:cards.id,
        ...e
      },
      success: res => {
        let d = JSON.parse(res.data);
        if (d.status == 5) {
          wx.showModal({
            title: '温馨提示',
            content: d.msg,
            showCancel: false,
            success(res) {}
          })
        } else {
          this.setData({
            'cards.audit_status': 0
          })
        }
      }
    })
  },
  onShareAppMessage() {

  }
})