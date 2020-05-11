const ajax = require('../../utils/ajax.js');
const role = require('./config.js');
let http = require('../../common/request.js');
import Notify from '../../dist/notify/notify';
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    role,
    name: '',
    mobile: '',
    mobile1: '',
    headimg: '',
    nick_name: '',
    roleperson: '',
    dis_status: true,
    show: false,
    sendStatue: true,
    time: '发送验证码', //倒计时 
    currentTime: 61,
    next: false
  },
  updateMobile() {
    this.setData({
      show: true
    });
  },
  inputMobile(e) {
    e.target.dataset.id == 1 ? this.setData({
      mobile1: e.detail
    }) : this.setData({
      mobile_code: e.detail
    })
  },

  getCode: function(options) {
    var that = this;
    let mobile = that.data.mobile1;
    if (mobile.length!==11) {
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
  onClose() {
    this.setData({
      show: false
    });
  },
  onLoad: function(options) {
    this.setData({
      name: wx.getStorageSync("userInfo").name,
      mobile: wx.getStorageSync("userInfo").mobile,
      headimg: getApp().globalData.serverUrl + wx.getStorageSync("userInfo").pic_path,
      nick_name: wx.getStorageSync("userInfo").nickname,
      roleperson: wx.getStorageSync("userInfo").role
    })
  },
  onShareAppMessage: function() {

  },
  updateMobile() {
    this.setData({
      show: true
    });
  },

  bindPickerChange(e) {
    console.log(e)
    const role = this.data.role
    this.setData({
      roleperson: role[e.detail.value]
    })

    if (this.data.nick_name != '' || this.data.name != '' || this.data.mobile != '' || this.data.roleperson != '') {
      this.setData({
        dis_status: false
      })
    } else {
      this.setData({
        dis_status: true
      })
    }
  },
  changeinputvalue(e) {
    if (this.data.name != ''|| this.data.roleperson != '') {
      this.setData({
        dis_status: false
      })
    } else {
      this.setData({
        dis_status: true
      })
    }
    
    let pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？0-9]");
    if (pattern.test(e.detail.value)) {
      let name = this.data.name;
      Notify('禁止输入特殊字符');
      this.setData({
        name: name.slice(0, name.length)
      })
    } else {
      this.setData({
        name: e.detail.value
      })
    } 
  },
  changephone() {
    if (this.data.next) {
      let that = this;
      http.postReq("/community/user/", {
        cmd: 'modifyMyInfo',
        mobile: that.data.mobile1,
        mobile_code: that.data.mobile_code
      }, function(res) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 1500
        })
        that.setData({
          mobile: that.data.mobile1
        })
      })
    }else{
      this.setData({ show: true })
      Notify('请输入手机号');
    }
  },
  personUpdate(e) {
    ajax.request({
      cmd: 'modifyMyInfo',
      name: this.data.name,
      role: this.data.roleperson
    }).then(res => {
      wx.navigateBack({
        delta: 1
      })
    })
  },
  onShareAppMessage(){}
})