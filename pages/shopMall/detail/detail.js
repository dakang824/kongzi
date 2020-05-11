let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
import Util from '../../../utils/util';
Page({
  data: {
    isNeed: true,
    id: "",
    dataList: null,
    serverUrl: APP.globalData.serverUrl, //服务器地址
    imgStr: "data/communityImage/", //图片固定格式
    showMask: false,
    choose_jd: true,
    content: "",
    authorization: false,
    getMobile: false,
    imgUrl: APP.globalData.imageurl,
    mobile: wx.getStorageSync("userInfo").mobile,
    secondCode: 60,
    code: null, //短信验证码,
    tipTxt: "申请获得您的手机号",
  },
  onLoad: function(options) {
    this.setData({
      id: options.id,
      nickname: wx.getStorageSync('userInfo').nickname,
      mobileshow: wx.getStorageSync('userInfo').mobile,
    })
    this.getProductDetail();
    this.getAgentMessages2();
  },
  preventTouchMove() {},

  getProductDetail() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'getProductDetail',
      prod_id: that.data.id,
    }, res=> {
      wx.stopPullDownRefresh();
      if (res.data.end_time == "") {
        res.data.showTime = false;
      } else {
        res.data.showTime = that.isValid(res.data.end_time);
        res.data.seconds = that.timestamp(res.data.end_time);
      }
      that.setData({
        dataList: res.data,
        agent: res.agent
      })
    })
  },
  getAgentMessages2() {
    let that = this;
    http.postReq("/community/agent/", {
      cmd: "getAgentMessages2"
    }, function(res) {
      that.setData({
        messageList: res.data
      })
    })
  },
  onChange(e) {
    let t = e.detail,
      days = t.days < 10 ? '0' + t.days : t.days,
      hours = t.hours < 10 ? '0' + t.hours : t.hours,
      minutes = t.minutes < 10 ? '0' + t.minutes : t.minutes,
      seconds = t.seconds < 10 ? '0' + t.seconds : t.seconds;
    this.setData({
      timeData: {
        days,
        hours,
        minutes,
        seconds,
      }
    });
  },
  goBuy() {
    let stock = (this.data.dataList.stock - this.data.dataList.buy_count) < 0 ? "0" : this.data.dataList.stock - this.data.dataList.buy_count;
    if (this.data.dataList.status == 2 || stock == 0) {
      wx.showToast({
        title: "该商品已售罄",
        icon: "none"
      })
      return
    } else {
      wx.navigateTo({
        url: "/pages/shopMall/sureOrder/sureOrder?id=" + this.data.id + "&price=" + this.data.dataList.price + "&name=" + this.data.dataList.name + "&list_pic=" + this.data.dataList.list_pic + "&postage=" + this.data.dataList.postage + "&limit=" + this.data.dataList.limit + "&balance=" + this.data.dataList.balance
      })
    }
  },
  commitProductAdjust() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'commitProductAdjust',
      ope_id: wx.getStorageSync("userInfo").id,
      prod_id: that.data.id, //商品id
      jd_price: that.data.jd_price, //京东价格
      tm_price: that.data.tm_price, //天猫价格
      content: that.data.content,
    }, function(res) {
      that.setData({
        showMask: false
      })
    })
  },
  goLuckyDetail() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'getAwardDrawFromGoods',
      prod_id: that.data.id,
      type: 15, //type:""//2:玩乐  3：代金券美食  15:好物
    }, function(res) {
      wx.navigateTo({
        url: "/pages/new/luckyDetail/luckyDetail?award_id=" + res.data.award_id + "&draw_id=" + res.data.draw_id
      })
    })
  },
  cutPrice() {
    this.commitProductAdjust();
  },
  adjustment() {
    // this.setData({
    //   showMask:true,
    //   jd_price:this.data.dataList.jd_price
    // })
    let that = this;
    if (wx.getStorageSync("userInfo").nickname == "") { //说明未授权
      this.setData({
        authorization: true
      })
    } else { //已授权再判断有没有手机号
      if (wx.getStorageSync("userInfo").mobile == "" || wx.getStorageSync("userInfo").mobile == "null") { //说明没有手机号
        this.setData({
          getMobile: true,
          mobile: "",
        })
      } else {
        this.setData({
          getMobile: false,
          isMobile: false,
          showMask: true,
          jd_price: this.data.dataList.jd_price
        })

      }
    }

  },
  onChange1(e) {
    this.setData({
      timeData: e.detail
    });
  },
  cancel() {
    this.setData({
      showMask: false
    })
  },
  closeAuthorization() {
    this.setData({
      authorization: false,
      getMobile: false,
    })
  },
  inputContent(e) {
    console.log(e.detail.value);
    this.setData({
      content: e.detail.value
    })
  },
  platform(e) {
    let type = e.currentTarget.dataset.type;
    if (type == 1) { //京东
      this.setData({
        choose_jd: true,
        jd_price: this.data.dataList.jd_price,
        tm_price: ""
      })
    } else {
      this.setData({
        choose_jd: false,
        tm_price: this.data.dataList.tm_price,
        jd_price: ""
      })
    }
  },
  //发送手机号
  sureMobile() {
    let that = this;
    if (wx.getStorageSync('userInfo').nickname === '' && that.data.nickName === '') {
      wx.showToast({
        title: "请授权微信昵称",
        icon: 'none'
      })
      return;
    }
    if (!this.data.mobileshow) {
      if (that.data.Mobile == "" || that.data.Mobile == undefined) {
        wx.showToast({
          title: "请允许获取您的手机号",
          icon: 'none'
        })
        return
      }
      if (that.data.isMobile) {
        if (that.data.code == "" || that.data.code == undefined) {
          wx.showToast({
            title: "请输入短信验证码",
            icon: 'none'
          })
          return
        }
      }
      http.postReq("/community/user/", {
        cmd: 'modifyMyInfo',
        mobile: that.data.Mobile,
        mobile_code: that.data.code
      }, function(res) {
        APP.login('', function() {
          that.setData({
            getMobile: false,
            authorization: false
          })
          let userInfo = wx.getStorageSync('userInfo');
          if (userInfo.nickname && userInfo.mobile) {
            // that.withdraw();
          }
        });
      })
    } else {
      that.setData({
        getMobile: false,
        authorization: false
      })
    }
  },
  //授权个人信息
  getInfo() {
    let that = this;
    wx.getUserInfo({
      success: function(res) {
        http.postReq("/community/user/", {
          cmd: 'modifyMyInfo',
          ope_id: wx.getStorageSync("userInfo").id,
          nickname: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
          gender: res.userInfo.gender
        }, function(r) {
          that.setData({
            nickName: res.userInfo.nickName
          })
          APP.login();
        })
      },
    })
  },
  //授权拿手机号
  getPhoneNumber(e) {
    let that = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      that.setData({
        isMobile: true,
        tipTxt: '授权失败，请手动输入手机号码'
      })
      return;
    }
    wx.checkSession({
      success: function(res) {
        wx.login({
          success: function(res) {
            wx.request({
              url: APP.globalData.serverUrl + "community/user/",
              data: {
                cmd: "getPhoneNumber",
                code: res.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                ope_id: wx.getStorageSync("userInfo").id
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              method: "POST",
              success(res) {
                if (res.data.status == 1) {
                  that.setData({
                    Mobile: res.data.phoneNumber,
                    mobile: res.data.phoneNumber,
                    isMobile: false,
                    successGetMobile: true
                  })
                  APP.login();
                } else {
                  that.setData({
                    isMobile: true,
                    tipTxt: '授权失败，请手动输入手机号码'
                  })
                }
              },
              fail(res) {
                console.log("失败了");

              }
            })
          },
          fail: function(res) {
            // console.log("点击了拒绝2");
          }
        })
      },
      fail: function(res) {
        // console.log("点击了拒绝1");
      }
    })
  },
  //获取手机验证码
  getCode() {
    let that = this;
    if (!that.data.Mobile) {
      wx.showToast({
        title: "请输入手机号",
        icon: "none"
      })
      return
    }
    http.postReq("/community/user/", {
      cmd: "sendSmsCode",
      mobile: that.data.Mobile,
    }, function(res) {
      wx.showToast({
        title: "获取验证码成功",
        icon: "none",
      })
      let timer = setInterval(() => {
        if (that.data.secondCode == 0) {
          that.setData({
            secondCode: 60
          })
          clearInterval(timer);
        } else {
          that.setData({
            secondCode: that.data.secondCode - 1
          })
        }
      }, 1000)
    })
  },
  inputCode(e) {
    this.setData({
      code: e.detail
    })
    console.log(e.detail);
    console.log(this.data.code);
  },
  inputMobile(e) {
    this.setData({
      Mobile: e.detail
    })
  },
  //倒计时--是否在3天之内，在就显示
  isValid(nowTime) {
    let timestamp = new Date().getTime();
    let date = new Date(nowTime.slice(0, 19)).getTime() - timestamp;
    let days = Math.floor(date / (24 * 3600 * 1000));
    console.log(days);
    if (days < 3) {
      return true
    } else {
      return false
    }
  },
  //日期转时间戳--得到多少秒
  timestamp(time) {
    let timestamp = new Date().getTime();
    let date = new Date(time.slice(0.19).replace(/-/g, '/')).getTime() - timestamp;
    return date
  },
  onPullDownRefresh: function() {
    let that = this;
    that.getProductDetail();
  },
  onReachBottom: function() {

  },
  onShareAppMessage() {
    let {
      dataList,
      serverUrl
    } = this.data, {
      name,
      top_pic
    } = dataList;
    return Util.sharePage(name, serverUrl + top_pic)
  }
})