let ajax = require('../../utils/ajax.js'),app = getApp();
import Toast from '../../dist/toast/toast';
Page({
  data: {
    errPhone: true,
    minDate: new Date().getTime(),
    maxDate: new Date(2024, 12, 31).getTime(),
    currentDate: new Date().getTime(),
    inst_id: '',
    inst_name: '',
    inst_address: '',
    inst_logo: '',
    //上面是上级页面传过来的
    schoolshow: '',
    schoolchange: '请选择到访校区',
    branches: '',
    branch_no: '',
    Height: '',
    rotate_deg: 0,
    timechange: '',
    timeshow: '',
    successshow: '',
    months: '',
    days: '',
    hours: '',
    month: '',
    day: '',
    hour: '',
    children: '',
    child: '',
    time: '',
    mobile: '',
    dis_status: true,
    oTime: '', //延时器
    value: '',

    ishidden: 'none',
    reserve_go: '',
    reserve_order: '',

    //下面是订单预约
    pic_path: '',
    title: '',
    amount: '',
    order_no: '',
    open_id: ''
  },
  confirm(e) {
    this.setData({
      timechange: this.getTime(e.detail),
      timeshow: false
    });
    this.ver();
  },
  onClose() {
    this.setData({
      timeshow: false,
      successshow: false,
    })
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
  onLoad: function (options) {
    this.setData({
      mobile: wx.getStorageSync("userInfo").mobile
    })
    if (options.num == 1) {
      ajax.request({
        cmd: 'prebookPageInft',
        inst_id: options.id,
      }).then(res => {
        this.setData({
          branches: res.data.data.branches,
          Height: 110 * res.data.data.branches.length,
          inst_id: options.id,
          inst_name: options.name,
          inst_address: options.address,
          inst_logo: options.logo,
          reserve_go: true
        })
      })
    } else {
      const obj = JSON.parse(options.str)
      this.setData({
        reserve_order: true,
        pic_path: obj.pic_path,
        title: obj.title,
        amount: obj.amount,
        inst_name: obj.inst_name,
        child_name: obj.name,
        child_age: obj.age,
        child_gender: obj.gender,
        mobile: obj.contact,
        order_no: obj.no,
        inst_id: obj.inst_id,
        branch_no: obj.branch_no,
        open_id: obj.open_id,
        data: obj
      })
    }
  },
  input(e) {
    this.setData({
      t: e.detail.value
    })
    this.ver();
  },
  delStudent(e) {
    var that = this;
    wx.showModal({
      content: '你确定要删除该孩子的信息吗',
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          ajax.request({
            cmd: 'deleteMyStudent',
            stu_no: that.data.children[0].no
          }).then(res => {
            that.setData({
              children: []
            });
            that.ver();
          })
        }
      }
    })
  },
  getPhoneNumber(e) {
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      Toast('授权手机号失败,请手动填写。');
      this.setData({ errPhone: false })
      return;
    }
    var that = this;
    wx.checkSession({
      success: function (res) {
        that.getPhone(e);
      },
      fail: function (res) {
        wx.login({
          success: function (code) {
            that.getPhone(e, code.code);
          }
        })
      }
    })
  },
  getPhone(e, code) {
    let that = this;
    wx.request({
      url: app.globalData.serverUrl + 'community/user/',
      method: 'post',
      data: {
        cmd: 'getPhoneNumber',
        code: code,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        ope_id: wx.getStorageSync('userInfo').id
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            mobile: res.data.phoneNumber
          })
          app.login(that);
        } else {
          Toast('授权手机号失败,请手动填写。');
          that.setData({ errPhone: false })
        }
      }
    })
  },
  onShow: function () {
    if (this.data.mobile != '') {

    } else {
      this.setData({
        ishidden: 'block'
      })
    }
    ajax.request({
      cmd: 'getMyStudents',
    }).then(res => {
      res.data.data.map(function (item, index) {
        if (item.gender.toUpperCase() == 'M') {
          item['gender'] = '男'
        } else {
          item['gender'] = '女'
        }
      })
      this.setData({
        children: res.data.data
      })
      this.ver();
      if (!this.data.child_no) {
        this.setData({
          child: this.data.children[0],
          child_no: this.data.children[0].no
        })
      }
    })
  },
  onShareAppMessage() {},
  changeschool(e) {
    this.setData({
      schoolshow: !this.data.schoolshow,
      rotate_deg: this.data.rotate_deg + 180
    })
    this.ver();
  },
  chooseschool(e) {
    this.setData({
      schoolchange: e.currentTarget.dataset.name,
      schoolshow: !this.data.schoolshow,
      rotate_deg: this.data.rotate_deg + 180,
      branch_no: e.currentTarget.dataset.branch_no
    })
    if (this.data.branch_no != '' && this.data.time != '' && this.data.stu_age != '' && this.data.stu_gender != '' && this.data.stu_name != '' && this.data.mobile != '') {
      this.setData({
        dis_status: false
      })
    }
    this.ver();
  },
  changetime() {
    this.setData({
      timeshow: true
    })
  },

  close() {
    this.setData({
      successshow: false
    })
    wx.navigateBack({
      delta: 1,
    })
  },
  gosetup(e) {
    const title = e.currentTarget.dataset.title
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../setup/setup?title=${title}&id=${id}`
    })
  },
  ver() {
    this.data.mobile && this.data.branch_no && this.data.timechange && this.data.child !== '' ? this.setData({
      dis_status: false
    }) : this.setData({
      dis_status: true
    });
  },
  inputPhone(e) {
    this.setData({ mobile: e.detail.value });
  },
  // 到访预约
  reservesubmit(e) {
    if (!(/^1[34578]\d{9}$/.test(this.data.mobile))) {
      wx.showToast({
        title: '您输入的手机号有误',
        icon: 'none'
      })
    } else {
      ajax.request({
        cmd: 'prebook',
        mobile: this.data.mobile,
        inst_id: this.data.inst_id,
        branch_no: this.data.branch_no,
        time: this.data.timechange,
        stu_age: this.data.child.age,
        stu_name: this.data.child.name,
        stu_gender: this.data.child.gender,
        comment: e.detail.value.remark
      }).then(res => {
        if (res.data.status == 1) {
          var oTime = setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 15000)
          this.setData({
            successshow: true,
            oTime,
          })
        }
      })
    }

  },
  //付款之后的预约
  orderreservesubmit(e) {
    ajax.request({
      cmd: 'preBookOnOrder',
      inst_id: this.data.inst_id,
      open_id: this.data.open_id,
      order_no: this.data.order_no,
      stu_age: this.data.child_age,
      stu_name: this.data.child_name,
      stu_gender: this.data.child_gender,
      mobile: this.data.mobile,
      branch_no: this.data.branch_no,
      time: this.data.timechange,
      comment: this.data.t
    }).then(res => {
      console.log(res)
      if (res.data.status == 1) {
        var oTime = setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 15000)
        this.setData({
          successshow: true,
          oTime,
        })
      }
    })
  },

  backhome() {
    clearTimeout(this.data.oTime)
    wx.navigateBack({
      delta: 1,
    })
  },

  intoreserve() {
    clearTimeout(this.data.oTime)
    wx.redirectTo({
      url: '../reservestatus/reservestatus',
    })
  },

  choosechild(e) {
    console.log(e);
    this.setData({
      child: e.currentTarget.dataset.child,
      child_no: e.currentTarget.dataset.child.no
    })
    this.ver();
  },

  backorder() {
    let pages = getCurrentPages();
    let prevpage = pages[pages.length - 2];
    prevpage.onLoad()
    clearTimeout(this.data.oTime)
    wx.navigateBack({
      delta: 1
    })
  }
})