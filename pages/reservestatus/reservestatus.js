let app = getApp(),
  http = require('../../common/request.js');
Page({
  data: {
    allreserve: '',
    booked: [],
    completed: [],
    expired: [],
    canceled: [],
    codeshow: '',
    remark: '',
    weekArray: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    qr_path: '',
    rootUrl: app.globalData.serverUrl
  },
  call(e) {
    let mobile = e.currentTarget.dataset.mobile;
    wx.makePhoneCall({
      phoneNumber: mobile ? mobile : app.globalData.servPhone,
    })
  },
  errorImg(e) {
    let list = this.data.allreserve,
      i = e.currentTarget.dataset.i;
    list[i].pic_path = '';
    this.setData({
      allreserve: list
    })
  },
  onLoad(options) {
    var that = this, url = this.data.rootUrl;
    http.postReq("/community/user/", {
      cmd: 'queryMyPrebook',
    }, res=> {
      let data = res.data;
      data.map((item, index)=>{
        item.pic_path = url + item.pic_path;
        item.qr_path = url + item.qr_path;
        var now = new Date(item.time.split(' ')[0]);
        item.week = that.data.weekArray[now.getDay()];
        item.time = item.time.split(' ')[0].split('-').join('.') + ' ' + item.time.split(' ')[1].slice(0, 5)
      })

      that.setData({
        allreserve: data,
        booked: that.isHava(data, 1),
        finished: that.isHava(data, 2),
        overdue: that.isHava(data, 3),
        cancal: that.isHava(data, 4),
      })
    })
  },
  onPullDownRefresh() {
    this.onLoad();
    wx.stopPullDownRefresh();
  },
  //判断是否有数据
  isHava(data, num) {
    let ishave = false;
    for (let item of data) {
      if (item.status == num) {
        ishave = true;
        break;
      }
    }
    return ishave;
  },
  onChange() {
    this.onLoad();
  },
  onShareAppMessage() {},
  showcode(e) {
    this.setData({
      codeshow: !this.data.codeshow,
      qr_path: e.currentTarget.dataset.qr_path
    })
  },

  close() {
    this.setData({
      codeshow: !this.data.codeshow
    })
  },

  cancelreserve(e) {
    var that = this, { inst_id, no } = e.currentTarget.dataset;
    wx.showModal({
      content: '你确定要取消预约吗',
      confirmColor: 'rgba(51,51,51,1)',
      success(res) {
        if (res.confirm) {
          http.postReq("/community/user/", {
            cmd: 'cancelprebook',
            inst_id,
            book_no:no
          }, res => {
            that.onLoad()
          })
        }
      }
    })
  },
  masktap() {
    //防止点击穿透
    this.setData({
      codeshow: !this.data.codeshow
    })
  }
})