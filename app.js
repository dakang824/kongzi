import Toast from 'dist/toast/toast';
import Util from '/utils/util.js';
import tabBarTpl from '/utils/template.js';
App({
  onLaunch(res) {
    ('from_id' in res.query||'pbcode' in res.query||'card_code' in res.query) ? this.globalData.query = res.query: '';
    wx.removeStorage({
      key: 'userInfo',
      success: res => {
        new Promise((resolve, reject) => {
          this.getAddress(() => {})
        }).then(() => {
          this.login('', () => {})
        })
      },
    })
    this.globalData.platform = wx.getSystemInfoSync().platform == 'ios';
    //获取系统信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.systemInfo = e;
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight + 5;
      },
    })
    Util.qcshare()
  },
  getAddress(f) {
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        let [lat,
          lon
        ] = [res.latitude, res.longitude];
        wx.setStorageSync('position', {
          'latitude': lat,
          'longitude': lon
        })
        Util.saveAddress(res, f);
      },
      fail() {
        Util.saveAddress({}, f);
      }
    })
  },
  wxpay(...args) {
    wx.requestPayment({
      ...args[0],
      success: res => {
        wx.showToast({
          title: '支付成功',
        })
        args[1](res);
      },
      fail: res => {
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        })
        args[2] ? args[2](res) : '';
      },
      complete: res => {
        args[3] ? args[3](res) : '';
      }
    })
  },
  login(th, fn) {
    let that = this,
      {
        query
      } = this.globalData;
    wx.login({
      success: res => {
        let d = {
          cmd: 'login',
          code: res.code,
          ...wx.getStorageSync('position')
        };
        'from_id' in query?d.from_id = query.from_id ? query.from_id : 0:'';
        'pbcode' in query?d.pbcode = query.pbcode ? query.pbcode : 0:'';
        'card_code' in query?d.card_code = query.card_code ? query.card_code : 0:'';
        wx.request({
          url: that.globalData.serverUrl + 'community/user/',
          data: d,
          method: 'post',
          success: res => {
            'loginMsg' in wx.env ? '' : wx.env.loginMsg = res.data;
            res.data.status == 0 ? wx.showToast({
              title: '登录失败',
              icon: 'none'
            }) : '';
            if (res.data.data) {
              let data = res.data.data;
              if (res.data.isNewUser) {
                that.globalData.isNewUser = true,
                  that.globalData.ticket_count = res.data.ticket_count,
                  that.globalData.my_count = res.data.my_count
              }
              data.nickname = decodeURIComponent(data.nickname);
              res.data.status == 1 ? (that.globalData.userInfo = res.data.data, wx.setStorageSync('userInfo', res.data.data)) : Toast.fail(res.data.msg);
            }
            fn ? fn(res) : '';
          },
          fail: function (res) {
            Toast.fail(res.data.msg);
          }
        })
      }
    })
  },
  globalData: {
    pb_code:{},
    tabBar: tabBarTpl,
    setting: {},
    userInfo: null, //后台返回的用户信息
    systemInfo: '', //手机设备信息
    serverUrl: "https://weixin.kongzikeji.com/",
    imageurl: "https://weixin.kongzikeji.com/data/instManageImg/",
    // serverUrl: "http://106.14.124.162:8088/",
    // imageurl: "http://106.14.124.162:8088/data/instManageImg/",
    servPhone: '400 859 0900',
    isNewUser: false, //这三个变量只针对新用户，只用一次
    ticket_count: 0,
    my_count: 0,
    disableTab: true, //是否允许点击app底部按钮,
    query: {}, //用户分享带的参数
  }
})