let app = getApp(),
  http = require('../../../common/request.js');
import Dialog from '../../../dist/dialog/dialog';
import Util from '../../../utils/util.js';
Page({
  data: {
    showMask: false,
    url: app.globalData.serverUrl,
    d: false,
    sel: 'm',
    imgUrl: app.globalData.imageurl,
    currentDate: new Date().getTime(),
    show: false,
    roleShow: false,
    columns: [],
    mobile_code: '',
    time: '发送验证码', //倒计时 
    currentTime: 61,
    sendStatue: true,
    name:wx.getStorageSync("userInfo").nickname,
    showTel:false,
  },
  getCode: function(options) {
    var that = this;
    let mobile = that.data.mobile;
    if (mobile.length !== 11) {
      Notify('电话号码错误');
      return;
    }
    http.postReq("/community/user/", {
      cmd: 'sendSmsCode',
      mobile: mobile
    }, function(res) {
      that.setData({
        sendStatue: false,
        next: true,
      })
    })

    let currentTime = that.data.currentTime,
      interval = setInterval(function() {
        currentTime--;
        that.setData({
          time: currentTime + '秒'
        })
        if (currentTime <= 0) {
          clearInterval(interval)
          that.setData({
            time: '重新发送',
            currentTime: 61,
            sendStatue: true
          })
        }
      }, 1000)
  },
  closeShow() {
    this.setData({
      show: false
    });
  },
  selRole() {
    this.setData({
      roleShow: true
    });
  },
  formatDate(t) {
    let time = new Date(t);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var date = time.getDate();
    return year + "-" + (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date);
  },
  confirm(event) {
    let t = this.formatDate(event.detail);
    this.setData({
      birthday: t,
      show: false,
      updateAge: this.data.year - t.slice(0, 4)
    });
  },
  showDate() {
    this.setData({
      show: true
    })
  },
  showLayer() {
    this.setData({
      showMask: true,
      d: true
    })
  },
  onClose() {
    this.setData({
      showMask: false,
      updateAge: '',
      updateName: '',
      show: false,
      birthday: ''
    })
  },
  selSex(e) {
    this.setData({
      sel: e.currentTarget.dataset.i
    })
  },
  editChild(e) {
    let that = this,
      childrens = that.data.childrens,
      i = e.currentTarget.dataset.i,
      c = childrens[i];
    this.setData({
      showMask: true,
      d: false,
      updateName: c.name,
      updateAge: c.age,
      sel: c.gender,
      no: c.no,
      birthday: c.birthday.slice(0, 10)
    })
  },
  addChild() {
    let that = this;
    if (that.data.d) {
      let age = that.data.updateAge,
        name = that.data.updateName;
      if (!that.data.birthday || !name) {
        wx.showToast({
          title: '请完善信息',
          icon: 'none'
        })
        return;
      };
      http.postReq("/community/user/", {
        cmd: "addStudent",
        gender: that.data.sel,
        age: age,
        name: name,
        birthday: that.data.birthday
      }, function(res) {
        that.onClose();
        that.setData({
          updateName: '',
          updateAge: '',
          sel: ''
        })
        that.getMyStudents();
      })
    } else {
      http.postReq("/community/user/", {
        cmd: "modifyStudent",
        gender: that.data.sel,
        age: that.data.updateAge,
        name: that.data.updateName,
        stu_no: that.data.no,
        birthday: that.data.birthday
      }, function(res) {
        that.onClose();
        that.getMyStudents();
      })
    }
  },
  deletechild(e) {
    var that = this;
    Dialog.confirm({
      title: '温馨提示',
      message: '你确定要删除该孩子的信息吗'
    }).then(() => {
      http.postReq("/community/user/", {
        cmd: "deleteMyStudent",
        stu_no: e.currentTarget.dataset.id
      }, function(res) {
        that.getMyStudents();
      })
    }).catch(() => {

    });
  },
  onLoad: function(o) {
    let user = wx.getStorageSync('userInfo');
    this.setData({
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      avatarUrl: user.pic_path,
      year: new Date().getFullYear()
    })
    this.getMyStudents();
  },
  getMyStudents() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: "getMyStudents",
    }, function(res) {
      that.setData({
        childrens: res.data.reverse()
      })
    })
  },

  onInput(e) {
    let i = e.currentTarget.dataset.i;
    i == 1 ? this.setData({
      name: e.detail
    }) : i == 2 ? this.setData({
      mobile: e.detail
    }) : i == 3 ? this.setData({
      role: e.detail
    }) : i == 4 ? this.setData({
      updateName: e.detail.value
    }) : i == 5 ? this.setData({
      updateAge: e.detail.value
    }) : i == 6 ? this.setData({
      mobile_code: e.detail
    }) : '';
  },
  editTel(){
    let that=this;
    that.setData({
      showTel:true
    })
  },
  onReady: function() {

  },
  submit() {
    let that = this;
    if(that.data.showTel){//点击了修改手机号
      if(that.data.mobile==""){
        wx.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return;
      }
      if (that.data.mobile_code == '') {
        wx.showToast({
          title: '请填写验证码',
          icon: 'none'
        })
        return;
      }
    }
    http.postReq("/community/user/", {
      cmd: "modifyMyInfo",
      name: that.data.name,
      role: that.data.role,
      mobile: that.data.mobile,
      avatarUrl: that.data.avatarUrl,
      mobile_code: that.data.mobile_code
    }, function(res) {
      app.login(this, function() {
        wx.navigateBack({
          delta: 1
        })
      })
    })
  },
  onShow: function() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: "getParentRole",
    }, function(res) {
      let arr = [];
      for (let key of res.data) {
        arr.push(key.name)
      }
      that.setData({
        columns: arr
      })
    })
  },
  onConfirm(e) {
    this.setData({
      role: e.detail.value,
      roleShow: false
    })
  },
  onCloseRole() {
    this.setData({
      roleShow: false
    })
  },
  onHide: function() {

  },
  onUnload: function() {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      var prePage = pages[pages.length - 2];
      prePage.onLoad()
    }
  },
  onShareAppMessage() {}
})