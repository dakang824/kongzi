import Toast from '../../../dist/toast/toast';
let http = require('../../../common/request.js'),
  app = getApp();

Page({
  data: {
    rootUrl: app.globalData.serverUrl,
    disabled: true,
    ind: 0,
    school: '',
    show: false,
    timeShow: false,
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    maxDate: new Date(2019, 10, 1).getTime(),
    currentDate: new Date().getTime(),
    order: '',
  },
  popTime(e) {
    this.setData({
      ind: e.target.dataset.id
    })
    this.setData({
      timeShow: true
    })
  },
  confirm(e) {
    let ind = this.data.ind,
      order = this.data.order;
    order.books[ind].time = this.getTime(e.detail)
    this.setData({
      order: order
    });
    this.setData({
      timeShow: false
    });
    this.ver();
  },
  getTime(second) {
    var date = new Date(second),
      time = date.getFullYear() + '-';
    if ((date.getMonth() + 1) <= 9) {
      time += "0" + (date.getMonth() + 1) + '-';
    } else {
      time += date.getMonth() + 1 + '-';
    }
    if (date.getDate() <= 9) {
      time += "0" + date.getDate() + " ";
    } else {
      time += date.getDate() + " ";
    }
    if (date.getHours() <= 9) {
      time += "0" + date.getHours() + ':';
    } else {
      time += date.getHours() + ':';
    }
    if (date.getMinutes() <= 9) {
      time += "0" + date.getMinutes();
    } else {
      time += date.getMinutes();
    }
    return time;
  },
  onClose() {
    this.setData({
      show: false,
      timeShow: false
    });
  },
  layerClose() {
    this.setData({
      show: false
    });
    wx.navigateBack({
      delta: 1,
    })
  },
  goback() {
    wx.navigateBack({
      delta: 1
    })
  },
  // 验证
  ver() {
    let books = this.data.order.books,
      all = true;
    for (let item of books) {
      if (!item.time || !item.comment) {
        all = false;
        break;
      }
    }
    this.setData({
      disabled: !all
    });
  },
  gomeet() {
    wx.redirectTo({
      url: '/pages/reservestatus/reservestatus',
    })
  },
  textarea(e) {
    let ind = e.target.dataset.id,
      order = this.data.order;
    order.books[ind].comment = e.detail.value;
    this.setData({
      order: order
    })
    this.ver();
  },
  onLoad(e) {
    var that = this,
      data = JSON.parse(e.data);
    this.setData({
      data: data,
    });

    http.postReq("/community/user/", {
      cmd: 'getPreBookAfterOrderPageInfo',
      trade_no: data.trade_no
    }, function(res) {
      let data = {
        cmd: 'preBookAfterOrder',
        books: [],
        open_id: res.data[0].open_id,
        stu_age: res.data[0].age,
        stu_name: res.data[0].name,
        stu_gender: res.data[0].stu_gender,
        contact: res.data[0].contact,
      }
      for (let item of res.data) {
        data.books.push({
          inst_id: item.inst_id,
          order_no: item.no,
          branch_no: item.branch_no,
          branch_name: item.branch_name,
          time: '',
          comment: ''
        })
      }

      that.setData({
        order: data
      })
    })
  },
  onClickIcon(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      disabled: true
    });
    id == 1 ? this.setData({
      'order.stu_name': ''
    }) : id == 2 ? this.setData({
      'order.stu_age': ''
    }) : id == 3 ? this.setData({
      'order.smobile': ''
    }) : '';
  },
  input(e) {
    let id = e.currentTarget.dataset.id;
    id == 1 ? this.setData({
      'order.stu_name': e.detail
    }) : id == 2 ? this.setData({
      'order.stu_age': e.detail
    }) : id == 3 ? this.setData({
      'order.mobile': e.detail
    }) : '';
    let order = this.data.order;
    ((order.stu_name != '' && order.stu_age != '') && order.mobile != '') ? this.setData({
      disabled: false
    }): this.setData({
      disabled: true
    });
  },
  bindPickerChange(e) {
    let index = e.detail.value;
    this.setData({
      ind: index,
      'order.branch_no': this.data.school[index].no
    })
  },
  sign() {
    let that = this;
    http.postReq("/community/user/", that.data.order, function(res) {
      that.setData({
        show: true
      })
    })
  },
  onShareAppMessage() {}
})