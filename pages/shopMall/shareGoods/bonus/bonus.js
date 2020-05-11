const app = getApp(),
  http = require('../../../../common/request.js');
import Toast from '../../../../dist/toast/toast';
Page({
  data: {
    imageurl: app.globalData.imageurl,
    serverUrl: app.globalData.serverUrl, 
    show: false,
    isNeed:true,
    postData: {
      name: '',
      mobile: '',
      mobileCode: ''
    },
    time: '发送验证码',
    currentTime: 61,
    showMask: false,
    shareImg: false,

  },
  getphonenumber(e) {
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      Toast('授权手机号失败,请手动填写。');
      this.setData({
        errPhone: true
      })
      return;
    }
    let that = this;

    //验证Session是否过期
    new Promise((resolve, reject) => {
      wx.checkSession({
        success(res) {
          resolve(e);
        },
        fail(res) {
          wx.login({
            success(code) {
              resolve(e, code.code);
            }
          })
        }
      })
    }).then((e, code) => {
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
        success(res) {
          if (res.data.status == 1) {
            that.setData({
              'postData.mobile': res.data.phoneNumber
            })
            app.login();
          } else {
            Toast('授权手机号失败,请手动填写。');
            that.setData({
              errPhone: true
            })
          }
        }
      })
    })
  },
  getCode() {
    var that = this;
    let mobile = that.data.postData.mobile;
    if (mobile.length !== 11) {
      Toast('电话号码错误');
      return;
    }
    http.postReq("/community/user/", {
      cmd: 'sendSmsCode',
      mobile: mobile
    }, res=> {
      that.setData({
        sendStatue: false,
        next: true,
      })
    })

    let currentTime = that.data.currentTime,
      interval = setInterval(()=>{
        currentTime--;
        that.setData({
          time: currentTime + '秒'
        })
        if (currentTime <= 0) {
          clearInterval(interval)
          that.setData({
            time: '发送验证码',
            currentTime: 61,
            sendStatue: true
          })
        }
      }, 1000)
  },

  success() {
    this.setData({
      show: true
    })
  },
  onInput(e) {
    let {
      postData
    } = this.data;
    postData[e.currentTarget.dataset.i] = e.detail;
  },
  onClose() {
    this.setData({
      show: false,
      shareImg: false
    })
  },
  modify() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: "modifyMyInfo",
      mobile: that.data.postData.mobile,
      mobile_code: that.data.postData.mobileCode
    }, res => {
      app.login(this, () => {
        that.startAgentTeam();
      })
    })
  },
  openMoneyWay() {
    if (this.data.errPhone) {
      let code = this.data.postData.mobileCode;
      code.length == 4 ? this.modify() : wx.showToast({
        title: '请输入验证码',
        duration: 2000,
        icon: 'none'
      });
    } else {
      this.startAgentTeam();
    }
  },
  startAgentTeam() {
    let that = this;
    // if (that.data.postData.name === '') {
    //   wx.showToast({
    //     title: '请输入您的姓名',
    //     duration: 2000,
    //     icon:'none'
    //   })
    //   return;
    // }
    // if(that.data.postData.mobile===''){
    //   wx.showToast({
    //     title: '请输入您的手机号',
    //     duration: 2000,
    //   })
    //   return;
    // }
    wx.request({
      url: `${app.globalData.serverUrl}community/agent/`,
      method: 'post',
      data: {
        cmd: 'startAgentTeam',
        mobile: that.data.postData.mobile,
        name: that.data.postData.name,
        ope_id: wx.getStorageSync('userInfo').id
      },
      success(res) {
        res.data.status == 1 ? (wx.showToast({
          title: '开启成功',
          duration: 2000,
        }), setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 2000), that.onClose()) : res.data.status == 2 ? that.success() : '';;
      }
    })
  },
  closeMask() {
    this.setData({
      showMask: false
    })
  },
  openMask() {
    this.setData({
      showMask: true
    })
  },
  getAgentMessages2() {
    let that = this;
    http.postReq("/community/agent/", {
      ope_id: wx.getStorageSync("userInfo").id,
      cmd: "getAgentMessages2"
    }, res=> {
      that.setData({
        messageList: res.data
      })
    })
  },
  onLoad(e) {
    wx.hideShareMenu()
    let setting, data, {
      mobile,
      name
    } = wx.getStorageSync('userInfo');
    try {
      setting = JSON.parse(e.s);
      data = JSON.parse(e.d);
    } catch (s) {
      setting = JSON.parse(decodeURIComponent(e.s));
      data = JSON.parse(decodeURIComponent(e.d));
    }

    this.setData({
      setting,
      data,
      user: wx.getStorageSync('userInfo'),
      len: Number((data.down_agents / data.team_need) * 88),
      'postData.mobile': mobile,
      'postData.name': name
    });
    this.getAgentMessages2();
  },
  showLayerImg() {
    this.setData({
      shareImg: true
    })
  },
  onShareAppMessage(e) {
    this.onClose();
    if (e.from == 'button') {
      return {
        path: `/pages/shopMall/shareGoods/shareGoods?from_id=${wx.getStorageSync('userInfo').id}`,
        imageUrl: this.data.serverUrl + this.data.setting.share_pic
      }
    }
  }
})