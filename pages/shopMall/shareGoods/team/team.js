const app = getApp(),
  http = require('../../../../common/request.js');
import Toast from '../../../../dist/toast/toast';
import Util from '../../../../utils/util';
Page({
  data: {
    isNeed: true,
    show: false,
    shareImg: false,
    ind: 1,
    imageurl: app.globalData.imageurl,
    url: app.globalData.serverUrl,
    postData: {
      cmd: 'queryAgentTeam',
      type: 1,
      page_no: 1,
      page_size: 10,
      keyword: '',
      order: 0,
    },
    directData: [],
    indirectData: [],
    teamData: [],
    time: '发送验证码',
    currentTime: 61,
    option1: [{
        text: '默认排序',
        value: 0
      },
      {
        text: '贡献收益升序',
        value: 1
      },
      {
        text: '贡献收益降序',
        value: 2
      },
      {
        text: '贡献单数升序',
        value: 3
      },
      {
        text: '贡献单数降序',
        value: 4
      },
      {
        text: '推广人数升序',
        value: 5
      },
      {
        text: '推广人数降序',
        value: 6
      },
    ],
  },
  conset() {
    this.setData({
      ind: 1,
      'postData.type': 1
    });
    this.initValue();
    this.getData();
  },
  onInput(e) {
    let {
      postData
    } = this.data;
    postData[e.currentTarget.dataset.i] = e.detail;
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
  showShare() {
    this.setData({
      shareImg: true
    });
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
  onClose() {
    this.setData({
      show: false,
      shareImg: false
    })
  },
  itemChange(e) {
    this.initValue();
    this.setData({
      'postData.order': e.detail,
    });
    this.getData();
  },
  tap:Util.throttle(function (e) {
    let i = e.currentTarget.dataset.i;
    this.initValue();
    this.setData({
      ind: i,
      'postData.type': i
    })
    this.getData();
  },1000),
  copy(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.n,
    })
  },
  getAgentMessages2() {
    let that = this;
    http.postReq("/community/agent/", {
      ope_id: wx.getStorageSync("userInfo").id,
      cmd: "getAgentMessages2"
    }, function(res) {
      that.setData({
        messageList: res.data
      })
    })
  },
  onLoad(e) {
    wx.hideShareMenu();
    let s, d;
    try {
      s = JSON.parse(e.s);
      d = JSON.parse(e.d);
    } catch (s) {
      s = JSON.parse(decodeURIComponent(e.s));
      d = JSON.parse(decodeURIComponent(e.d));
    }

    this.setData({
      s,
      d,
      len: (d.down_agents / d.team_need) * 88
    });
    this.getData();
    this.getAgentMessages2();
  },
  initValue() {
    this.setData({
      directData: [],
      indirectData: [],
      teamData: [],
      'postData.page_no': 1
    });
  },
  onSearch(e) {
    this.initValue();
    this.setData({
      'postData.keyword': !e.detail ? '' : e.detail,
    });
    this.getData();
  },
  getData() {
    let that = this,
      {
        ind
      } = this.data;
    http.postReq("/community/agent/", that.data.postData, (res) => {
      let [total, data] = [res.total, res.data.records];
      that.setData({
        total
      });
      // data.length ? '' : wx.showToast({
      //   title: '已加载完毕',
      //   icon: 'none'
      // })
      ind == 1 ? this.setData({
        directData: that.data.directData.concat(data)
      }) : ind == 2 ? this.setData({
        indirectData: that.data.indirectData.concat(data)
      }) : ind == 3 ? this.setData({
        teamData: that.data.teamData.concat(data)
      }) : '';
      wx.stopPullDownRefresh();
    })
  },
  modify() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: "modifyMyInfo",
      mobile: that.data.postData.mobile,
      mobile_code: that.data.postData.mobileCode
    }, function(res) {
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
      });
    } else {
      this.startAgentTeam();
    }
  },
  startAgentTeam() {
    let that = this;
    wx.request({
      url: app.globalData.serverUrl + 'community/agent/',
      method: 'post',
      data: {
        cmd: 'startAgentTeam',
        mobile: that.data.postData.mobile || wx.getStorageSync('userInfo').mobile,
        name: that.data.postData.name,
        ope_id: wx.getStorageSync('userInfo').id
      },
      success(res) {
        res.data.status == 1 ? (wx.navigateBack({
          delta: 1
        }), that.onClose()) : res.data.status == 2 ? that.success() : '';;
      }
    })
  },
  onReachBottom() {
    this.setData({
      'postData.page_no': this.data.postData.page_no + 1
    });
    this.getData();
  },
  onPullDownRefresh() {
    this.initValue();
    this.getData();
  },
  onShareAppMessage(e) {
    this.onClose();
    if (e.from == 'button') {
      return {
        path: `/pages/shopMall/shareGoods/shareGoods?from_id=${wx.getStorageSync('userInfo').id}`,
      }
    }
  },
})