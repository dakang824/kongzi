let app = getApp(),
  http = require('../../../common/request.js'),
  time, i = 0;
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    url: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
    show: false
  },
  errorImg(e) {
    let list = this.data.list,
      i = e.currentTarget.dataset.i;
    list[i].pic_path = '';
    this.setData({
      list: list
    })
  },
  subsidy(e) {
    let t = e.currentTarget.dataset.i;
    wx.navigateTo({
      url: `/pages/new/subsidy/subsidy?order_no=${t.order_no}&inst_id=${t.inst_id}&subsidy=${t.subsidy_rate}`,
    })
  },
  onClose() {
    this.setData({
      show: false
    });
    i = 0;
    clearInterval(time);
  },
  getData() {
    let that = this;
    if (i ==120) {
      this.onClose();
      Dialog.alert({
        title: '温馨提示',
        message: '请求超时,请重新打开二维码。',
        confirmButtonText: '我知道了'
      }).then(() => {
        
      });
    } else {
      wx.request({
        url: app.globalData.serverUrl + 'community/user/',
        data: {
          cmd: "queryMyOrderPayBack",
          trade_no: that.data.trade_no,
          ope_id: wx.getStorageSync('userInfo').id,
          inst_id: that.data.inst_id,
          order_no: that.data.order_no
        },
        method: 'post',
        success(res){
          if (res.data.status == 5) {
            clearInterval(time);
            i == 0;
            let list = that.data.list;
            list[that.data.ind].pay_back = 0;
            that.setData({
              show: false,
              'list': list
            });
            Dialog.alert({
              title: '温馨提示',
              message: res.data.msg,
              confirmButtonText: '我知道了'
            }).then(() => {

            });
          }
        }
      })
    }
  },
  showCode(e) {
    let d = e.currentTarget.dataset.i,
      that = this;
    this.setData({
      show: true,
      qr_path: d.qr_path,
      trade_no: d.trade_no,
      ind: e.currentTarget.dataset.ind,
      inst_id: d.inst_id,
      order_no: d.order_no
    });
    clearInterval(time);
    i == 0;
    time = setInterval(()=>{
      that.getData();
      i++;
    }, 1000)
  },
  onLoad(options) {
    let that = this;
    http.postReq("/community/order/", {
      cmd: "getMyCourses",
      ...wx.getStorageSync('position')
    }, (res)=>{
      for (let item of res.data) {
        item.t = (new Date(item.create_time.replace(new RegExp("-", "gm"), "/"))).getTime();
        item.distance = (item.distance / 1000).toFixed(1);
      }
      res.data.sort(that.compare('t')).reverse();
      that.setData({
        list: res.data
      });
    })
  },
  compare(property) {
    return function(a, b) {
      return a[property] - b[property];
    }
  },
  call(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.i
    })
  },
  onShareAppMessage() {}
})