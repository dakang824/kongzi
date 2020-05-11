let app = getApp(),
  http = require('../../../common/request.js');

Page({
  data: {
    showDel: true,
    show: false,
    minDate: new Date().getTime(),
    currentDate: new Date().getTime(),
    imgUrl: app.globalData.imageurl,
    postData: {
      cmd: 'applyPlatSubsidy',
      inst_id: "",
      order_no: "",
      sign_amount: "",
      sign_time: "",
      img: []
    }
  },
  againSumit(){
    let { postData } = this.data, arr = [], len = app.globalData.serverUrl.length;
    for (let key of postData.img) {
      arr.push(key.url.substr(len));
    }
    postData.images = arr.join(',');
    delete postData.img;
    postData.cmd = 'modifyPlatSubsidyApply';
    http.postReq("/community/order/", postData, res=>{
      this.onExamine();
    })
  },
  onSubmit() {
    let that = this,
      arr = [],
      postData = this.data.postData,
      len = app.globalData.serverUrl.length,
      s = this.data.status;
    if (!(postData.sign_amount && postData.sign_time && postData.img.length)){
      wx.showToast({
        title: '请补充信息',
      })
      return;
    }
    for (let key of postData.img) {
      arr.push(key.url.substr(len));
    }
    postData.images = arr.join(',');
    delete postData.img;
    if (that.data.isupdate == 0) {
      http.postReq("/community/order/", postData, function(res) {
        wx.showToast({
          title: '创建成功',
          duration: 2000
        })
        that.getData();
      })
    } else if (s == 0) {
      postData.cmd = 'modifyPlatSubsidyApply';
      http.postReq("/community/order/", postData, function(res) {
        wx.showToast({
          title: '修改成功',
          duration: 2000
        })
        that.getData();
      })
    }
    // status==0未提交 status==1待审核 status==2审核通过 status==3审核失败
  },
  onExamine() {
    http.postReq("/community/order/", {
      cmd: 'commitMyPlatSubsidy',
      sub_id: this.data.postData.sub_id
    }, res=> {
      wx.showToast({
        title: '提交成功',
        duration: 2000
      })
      this.getData();
    })
  },
  onInputValue(e) {
    this.setData({
      'postData.sign_amount': e.detail
    })
  },
  timeConfirm(e) {
    this.setData({
      'postData.sign_time': this.formatDate(e.detail)
    })
    this.timeSwitch();
  },
  formatDate(t) {
    let time = new Date(t);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var date = time.getDate();
    return year + "-" + (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date);
  },
  timeSwitch() {
    this.setData({
      show: !this.data.show
    })
  },
  beforeRead(event) {
    wx.showLoading({
      title: '上传中...',
      mask: true
    })
    const {
      file,
      callback = () => {}
    } = event.detail;
    callback(true);
  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    let img = this.data.postData.img,
      that = this,
      f = {};
    f.size = file.size;

    wx.uploadFile({
      url: app.globalData.serverUrl + "inst2/acts/",
      filePath: file.path,
      name: 'file',
      formData: {
        cmd: 'uploadActImage'
      },
      success: function(res) {
        wx.hideLoading();
        f.url = app.globalData.serverUrl + JSON.parse(res.data).pic_path;
        img.push(f);
        that.setData({
          'postData.img': img
        })
      }
    })
  },
  delUploadImg(e) {
    this.data.postData.img.splice(e.detail.index, 1);
    this.setData({
      'postData.img': this.data.postData.img
    })
  },
  onLoad: function(options) {
    let that = this;
    this.setData({
      'postData.order_no': options.order_no,
      'postData.inst_id': options.inst_id,
      options
    })
    this.getData();
  },
  getData(){
    let that=this;
    http.postReq("/community/order/", {
      cmd: "getMyPlatSubsidy",
      inst_id: that.data.postData.inst_id,
      order_no: that.data.postData.order_no
    }, function (res) {
      for (let key of res.images) {
        key.url = app.globalData.serverUrl + key.pic_path;
      }
      let len = Object.keys(res.subsidy_info).length;
      len ? that.setData({
        'postData.img': res.images,
        'postData.sign_amount': res.subsidy_info.sign_amount,
        isupdate: len,
        'postData.sub_id': res.subsidy_info.id,
        status: res.subsidy_info.status,
        'postData.sign_time': res.subsidy_info.sign_time ? res.subsidy_info.sign_time.slice(0, 10) : '',
      }) : that.setData({ isupdate: len });
    })
  },
  onShareAppMessage() {}
})