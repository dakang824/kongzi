let APP = getApp(),
  http = require('../../../common/request.js'),
  util = require('../../../utils/util.js');
import Dialog from '../../../dist/dialog/dialog';
import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed: true,
    checked: false,
    members: 6,
    ranks: 8,
    probability: false,
    up: false,
    shareImgbox: false,
    join: false,
    result: false,
    options: null,
    serverUrl: APP.globalData.serverUrl, //服务器地址
    imgStr: "data/communityImage/", //图片固定格式
    dataList: null,
    showMask: false, //遮罩层
    radio: false,
    myUserTicketsList: [], //我可用的优惠券的列表
    allChecked: false,
    tickets: "",
    showcomment: false, //；评论框
    content: "", //评论内容
    isEnough: 0,
    draw_type: null,
    authorization: false,
    getMobile: false,
    mobile: wx.getStorageSync("userInfo").mobile,
    hourTime: "",
    minuteTime: "",
    secondTime: "",
    draw_second: null, //倒计时的秒数
    timer: null, //倒计时
    draw_time1: null,
    draw_time2: null,
    week: null,
    shareImg: null, //分享的海报
    isMobile: false,
    imgUrl: APP.globalData.imageurl,
    secondCode: 60,
    code: null, //短信验证码,
    tipTxt: "申请获得您的手机号",
    joinSuccess: false,
    show_newbox: true,
    isAll: false,
  },
  formatDate(t) {
    let time = new Date(t);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var date = time.getDate();
    return year + "-" + (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date);
  },
  preview(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.e,
      urls: [e.currentTarget.dataset.e],
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.dataList.award_info.spon_mobile,
    })
  },
  onClose() {
    this.setData({
      probability: false,
      up: false,
      join: false,
      result: false,
      shareImgbox: false
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
  },
  showPro() {
    this.setData({
      probability: true
    })
  },
  showUp() {
    this.setData({
      up: true
    })
  },
  onLoad(options) {
    let that = this,
      {
        nickname,
        mobile
      } = wx.getStorageSync('userInfo');
    this.setData({
      options: options,
      showBack: 'from_id' in options || 'awardQR' in options,
      nickName: nickname,
      nickname,
      mobileshow: mobile,
    });
  },
  onShow() {
    let that = this;
    that.getDetail();
    let timer = setInterval(() => {
      that.formatSeconds(that.data.draw_second--);
      if (that.data.draw_second == -1) {
        clearInterval(that.data.timer);
        that.getDetail();
      }
    }, 1000);
    that.setData({
      timer
    })
  },
  onChange(event) {
    let that = this;
    this.setData({
      checked: event.detail
    });
    http.postReq("/community/award/", {
      cmd: event.detail ? "startDrawRemind" : "stopDrawRemind", //开启了提醒//没有开启提醒
      draw_id: that.data.dataList.award_info.draw_id
    }, res => {})
  },
  openConfirm(e) {
    let that = this;
    wx.showModal({
      content: '检测到您没打开家长社区的定位权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success(res) {
        if (res.confirm) {
          wx.openSetting({
            success(res) {
              if (res.authSetting['scope.userLocation']) {
                APP.getAddress(() => {
                  that.checkAddress(e);
                });
              }
            }
          })
        } else {
          console.log('用户点击取消')
        }
      }
    });
  },
  checkAddress(e) {
    let that = this,
      check_location = this.data.dataList.award_info.check_location;
    if (check_location == 1) {
      // 检查用户是否受过地理权限
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.userLocation']) {
            that.openConfirm(e);
            return;
          } else if (wx.getStorageSync('province') != '上海市') {
            wx.showModal({
              content: '检测到您的位置不是上海市，无法参加此活动。',
              confirmText: "确认",
              success: res => {}
            });
            return;
          } else {
            that.goJoin(e);
          }
        }
      })
    } else {
      that.goJoin(e);
    }
  },
  goJoin(e) {
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
        })
        that.withdraw();
      }
    }
  },
  withdraw: util.throttle(function(e) {
    this.joinPrize();
  }, 1000),
  //点击参与抽奖
  joinPrize() {
    let that = this,
      {
        award_id,
        draw_id,
        from_id
      } = that.data.dataList.award_info;
    http.postReq("/community/award/", {
      cmd: "joinAwardDrawV22",
      award_id,
      draw_id,
      from_id,
    }, res => {
      if ('subStatus' in res && res.subStatus == 1) {
        Dialog.confirm({
          title: '温馨提示',
          message: res.msg,
          confirmButtonText: '去获券',
          cancelButtonText: '以后再说'
        }).then(() => {
          wx.redirectTo({
            url: '/pages/getPrize/prizeTicket/prizeTicket',
          })
        }).catch(() => {
          // on cancel
        });
        that.setData({
          joinSuccess: false
        })
      } else {
        that.setData({
          dataList: that.data.dataList,
          joinSuccess: true,
          showMsg: res.showMsg,
        })
        that.getDetail();
      }
    });
  },
  closeMask() {
    this.setData({
      showMask: false,
      isAll: false
    })
  },
  //查询活动奖品详情
  getDetail() {
    let that = this,
      {
        award_id,
        draw_id,
        awardQR
      } = this.data.options;
    http.postReq("/community/award/", {
      cmd: "getAwardActDetailV21",
      award_id,
      draw_id,
      awardQR,
      ...wx.getStorageSync('position')
    }, res => {
      if (res.showHomePage == 1) {
        Dialog.alert({
          title: '温馨提示',
          message: res.msg
        }).then(() => {
          wx.switchTab({
            url: '/pages/new/index/index',
          })
        });
        return;
      }
      wx.stopPullDownRefresh();
      res.award_info.start_time = res.award_info.start_time.slice(0, 10).replace(/-/g, ".");
      res.award_info.end_time = res.award_info.end_time.slice(0, 10).replace(/-/g, ".");
      res.add_rate = res.add_rate.toFixed(2);
      res.base_rate = res.base_rate.toFixed(2);
      res.rate = res.rate.toFixed(2);
      that.setData({
        draw_time1: res.award_info.draw_time.split(" ")[0].replace(/-/g, "."),
        draw_time2: res.award_info.draw_time.split(" ")[1].slice(0, 5),
        week: that.getMyDay(new Date(res.award_info.draw_time.split(" ")[0])),
        isAll: false
      })
      if (res.award_info.draw_time.slice(0, 10).replace(/-/g, "/") == that.getTodayTime()) {
        res.award_info.isToday = 1;
      } else {
        res.award_info.isToday = 0;
      }
      that.setData({
        draw_type: res.award_info.draw_type
      })
      for (let i = 0, len = res.award_comments.length; i < len; i++) {
        res.award_comments[i].new_create_time = res.award_comments[i].create_time.slice(0, 10).replace(/-/g, ".");
      }
      for (let i = 0, len = res.rate_add_lists.length; i < len; i++) {
        res.rate_add_lists[i].rate = res.rate_add_lists[i].rate.toFixed(2);
      }
      for (let i = 0, len = res.rate_list.length; i < len; i++) {
        res.rate_list[i].rate = res.rate_list[i].rate.toFixed(2);
      }
      if (res.award_info.status == 2 && res.award_info.get_award == 1) { //是否开奖 2--已开奖//get_award 1-已领取 0-未领取
        that.setData({
          result: false
        })
      }
      that.setData({
        checked: res.remind == 1, //已开启了提醒
      })
      that.setData({
        dataList: res,
        draw_second: res.award_info.draw_second,
      });
    })
  },
  continue () {
    this.getMyUserTickets();
  },
  close() {
    this.setData({
      joinSuccess: false,
    })
    // Util.subscribeMessage({
    //   tmplIds: ['Qp4-nj4BVSMEn6TWkvRmPIN7e5-tnuy1XJmZIVsxLmQ','ngCd0Uhx-SEhajlymjDSnQDSp1ph3d8AJ1VE_QN2Eso'],
    //   success: res => {}
    // });
  },
  //查询我的可用抽奖券
  getMyUserTickets() {
    let that = this;
    that.setData({
      showMask: true,
    })
    http.postReq("/community/award/", {
      cmd: "getMyUnUsedTickets",
    }, res => {
      for (let i = 0, len = res.data.length; i < len; i++) {
        res.data[i].new_get_time = res.data[i].get_time.slice(0, 10).replace(/-/g, ".");
        res.data[i].new_valid_time = res.data[i].valid_time.slice(0, 10).replace(/-/g, ".");
        res.data[i].checked = false;
        // res.data[i].is_valid = that.isValid(res.data[i].valid_time);
      }
      that.setData({
        myUserTicketsList: res.data
      })
      if (that.data.myUserTicketsList.length < that.data.dataList.award_info.tickets) {
        for (let i = 0, len = that.data.myUserTicketsList.length; i < len; i++) {
          res.data[i].checked = true;
        }
      } else {

        for (let i = 0, len = that.data.dataList.award_info.tickets; i < len; i++) {
          res.data[i].checked = true;
        }
      }
      that.setData({
        myUserTicketsList: res.data
      })
    })
  },
  preventTouchMove() {},

  sureBetting: util.throttle(function(e) {
    this.betting();
  }),
  //全选
  allChoose() {
    let that = this;
    that.data.isAll = !that.data.isAll;
    if (that.data.isAll) { //未全选
      for (let i = 0, len = that.data.myUserTicketsList.length; i < len; i++) {
        that.data.myUserTicketsList[i].checked = true;
      }
    } else { //已全选

      for (let i = 0, len = that.data.myUserTicketsList.length; i < len; i++) {
        that.data.myUserTicketsList[i].checked = false;
      }
    }
    that.setData({
      myUserTicketsList: that.data.myUserTicketsList,
      isAll: that.data.isAll
    })
  },
  onChoose(e) {
    let index = e.currentTarget.dataset.index;
    this.data.myUserTicketsList[index].checked = !this.data.myUserTicketsList[index].checked;
    this.setData({
      myUserTicketsList: this.data.myUserTicketsList
    });

  },
  //继续投注
  betting() {
    let arr = [];
    let that = this;
    that.setData({
      isEnough: 0
    })
    if (that.data.myUserTicketsList.length == 1) {
      if (that.data.myUserTicketsList[0].checked) {
        that.data.tickets = that.data.myUserTicketsList[0].id;
        that.data.isEnough = that.data.isEnough + 1;
        that.setData({
          isEnough: that.data.isEnough,
          tickets: that.data.tickets
        })
      } else {
        if (that.data.isEnough == 0) {
          wx.showToast({
            title: "请先选择抽奖券",
            icon: "none"
          })
          return
        }
      }
    } else {
      for (let i = 0, len = that.data.myUserTicketsList.length; i < len; i++) {
        if (that.data.myUserTicketsList[i].checked) {
          arr.push(that.data.myUserTicketsList[i].id);
          that.data.isEnough = that.data.isEnough + 1;
          that.setData({
            isEnough: that.data.isEnough,
            tickets: arr.join(),
          })
        }
      }
    }

    if (that.data.isEnough == 0) {
      wx.showToast({
        title: "请先选择抽奖券",
        icon: "none"
      })
      return
    }

    http.postReq("/community/award/", {
      cmd: "joinAwardDrawAddDrawTicketV22",
      award_id: that.data.dataList.award_info.award_id,
      draw_id: that.data.dataList.award_info.draw_id,
      tickets: that.data.tickets
    }, res => {
      that.setData({
        showMask: false,
        showMsg: res.showMsg,
        joinSuccess: true,
        myUserTicketsList: []
      })
      that.getDetail();
    })
  },
  //收藏抽奖活动
  clickCollect() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "collectAward",
      award_id: that.data.dataList.award_info.award_id,
      from: that.data.dataList.award_info.status,
    }, res => {
      that.data.dataList.award_info.collect_count = that.data.dataList.award_info.collect_count + 1;
      that.data.dataList.award_info.is_collect = 1;
      that.setData({
        dataList: that.data.dataList
      })
    })
  },
  //取消收藏抽奖活动
  clickCancleCollect() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "cancelCollectAward",
      award_id: that.data.dataList.award_info.award_id,
    }, function(res) {
      that.data.dataList.award_info.collect_count = that.data.dataList.award_info.collect_count - 1;
      that.data.dataList.award_info.is_collect = 0;
      that.setData({
        dataList: that.data.dataList
      })
    })
  },
  //点赞抽奖活动
  clickZan() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "likeAward",
      award_id: that.data.dataList.award_info.award_id,
      from: that.data.dataList.award_info.status,
    }, function(res) {
      that.data.dataList.award_info.like_count = that.data.dataList.award_info.like_count + 1;
      that.data.dataList.award_info.is_like = 1;
      that.setData({
        dataList: that.data.dataList
      })
    })
  },
  //取消点赞抽奖活动
  clicCancelkZan() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "cancelLikeAward",
      award_id: that.data.dataList.award_info.award_id,
    }, function(res) {
      that.data.dataList.award_info.like_count = that.data.dataList.award_info.like_count - 1;
      that.data.dataList.award_info.is_like = 0;
      that.setData({
        dataList: that.data.dataList
      })
    })
  },
  hasJoin() {
    wx.showToast({
      title: "活动人数已满，无法继续参与",
      icon: "none"
    })
  },
  //去获券
  goGetTicket() {
    wx.navigateTo({
      url: "/pages/getPrize/prizeTicket/prizeTicket"
    })
  },
  //去拉取新用户
  goPullUser() {
    let award_info = this.data.dataList.award_info;
    this.data.dataList.award_info.new_user_limit ? wx.navigateTo({
      url: `/pages/new/pullNewUser/pullNewUser?award_id=${award_info.award_id}&prizeImg=${award_info.pic_path}&prizeTitle=${award_info.name}`
    }) : Dialog.alert({
      title: '温馨提示',
      message: '该奖品尚未参与活动'
    }).then(() => {

    });
  },
  //输入评论
  inputComment(e) {
    this.setData({
      content: e.detail.value,
    })
  },
  //打开评论框
  openShowComment() {
    this.setData({
      showcomment: true
    })
  },
  //发送评论
  sureComment() {
    let that = this;
    if (that.data.content == "") {
      wx.showToast({
        title: "请输入评论内容",
        icon: "none",
        duration: 2000
      })
    } else {
      http.postReq("/community/award/", {
        cmd: "addAwardComments",
        ope_id: wx.getStorageSync("userInfo").id,
        award_id: that.data.dataList.award_info.award_id,
        content: that.data.content,
      }, function(res) {
        that.setData({
          showcomment: false
        })
        that.data.dataList.award_comments.push({
          award_id: res.data.award_id,
          content: res.data.content,
          new_create_time: that.formatDate(new Date().getTime()),
          like_count: 0,
          nickname: res.data.nickname,
          no: res.data.no,
          pic_path: res.data.pic_path
        });
        that.setData({
          dataList: that.data.dataList
        })
      })
    }
  },
  //关闭评论框
  cancelComment() {
    this.setData({
      showcomment: false,
    })
  },
  //评论点赞
  commentClick(e) {
    let that = this;
    let options = e.currentTarget.dataset;
    http.postReq("/community/award/", {
      cmd: "addAwardCommentsLike",
      award_id: that.data.dataList.award_info.award_id,
      com_on: options.no,
    }, function(res) {
      for (let i = 0, len = that.data.dataList.award_comments.length; i < len; i++) {
        that.data.dataList.award_comments[options.index].checked = true;
      }
      that.data.dataList.award_comments[options.index].like_count++;
      that.setData({
        dataList: that.data.dataList
      })

    })

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
  closeAuthorization() {
    this.setData({
      authorization: false,
      getMobile: false,
    })
  },
  inputMobile(e) {
    this.setData({
      Mobile: e.detail
    })
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
      }, res => {
        APP.login('', () => {
          that.setData({
            getMobile: false,
            authorization: false
          })
          let userInfo = wx.getStorageSync('userInfo');
          if (userInfo.nickname && userInfo.mobile) {
            that.withdraw();
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
  //领取奖品
  gerPrize(e) {
    let that = this;
    let options = e.currentTarget.dataset;
    http.postReq("/community/award/", {
      cmd: 'getMyAwardPrize',
      ope_id: wx.getStorageSync("userInfo").id,
      award_id: options.awardid,
      draw_id: options.drawid,
    }, function(res) {
      wx.showToast({
        title: "已领取",
        icon: "none"
      })
      setTimeout(() => {
        that.onClose();
        that.getDetail();
      }, 1000)
    })
  },
  //是否过期 3天以内为过期
  isValid(nowTime) {
    let timestamp = new Date().getTime();
    console.log("当前系统时间的时间戳" + timestamp);
    let date = new Date(nowTime.slice(0, 19)).getTime() - timestamp;
    let days = Math.floor(date / (24 * 3600 * 1000));
    if (days < 3 && days > 0) {
      return true
    } else {
      return false
    }
  },
  //判断是否为今天
  isToday(str) {
    var d = new Date(str.replace(/-/g, "/"));
    var todaysDate = new Date();
    if (d.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
      return true;
    } else {
      return false;
    }
  },
  //根据时间知道是星期几
  getMyDay(date) {
    var week;
    if (date.getDay() == 0) week = "周日";
    if (date.getDay() == 1) week = "周一";
    if (date.getDay() == 2) week = "周二";
    if (date.getDay() == 3) week = "周三";
    if (date.getDay() == 4) week = "周四";
    if (date.getDay() == 5) week = "周五";
    if (date.getDay() == 6) week = "周六";
    return week;
  },
  //获取当前时间
  getTodayTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    var nowDate = year + "/" + month + "/" + day;
    return nowDate
  },
  //倒计时函数
  formatSeconds(value) {
    var secondTime = parseInt(value); // 秒
    var minuteTime = 0; // 分
    var hourTime = 0; // 小时
    if (secondTime > 60) { //如果秒数大于60，将秒数转换成整数
      //获取分钟，除以60取整数，得到整数分钟
      minuteTime = parseInt(secondTime / 60);
      //获取秒数，秒数取佘，得到整数秒数
      secondTime = parseInt(secondTime % 60);
      //如果分钟大于60，将分钟转换成小时
      if (minuteTime > 60) {
        //获取小时，获取分钟除以60，得到整数小时
        hourTime = parseInt(minuteTime / 60);
        //获取小时后取佘的分，获取分钟除以60取佘的分
        minuteTime = parseInt(minuteTime % 60);
      }
    }
    if (secondTime < 10) {
      secondTime = "0" + secondTime;
    }
    if (minuteTime < 10) {
      minuteTime = "0" + minuteTime;
    }
    if (hourTime < 10) {
      hourTime = "0" + hourTime;
    }
    this.setData({
      hourTime: hourTime,
      minuteTime: minuteTime,
      secondTime: secondTime
    })
  },
  goPage(e) {
    wx.navigateTo({
      url: "/" + e.currentTarget.dataset.link
    })
    http.postReq("/community/user/", {
      cmd: 'clickAds',
      ad_id: e.currentTarget.dataset.i,
    }, function(res) {})
  },
  shareFriend() {
    this.onClose();
    this.setData({
      shareImgbox: true
    })
    this.shareFriendDate();
  },
  saveImg() {
    let that = this;
    Util.saveImg(that.data.shareImg, () => {
      that.setData({
        shareImgbox: false
      });
    });
  },
  shareFriendDate() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "getAwardActFriendsterPoster",
      award_id: that.data.dataList.award_info.award_id,
      draw_id: that.data.dataList.award_info.draw_id,
    }, function(res) {
      that.setData({
        shareImg: that.data.serverUrl + res.path
      })
    })
  },

  closeInvalid() {
    this.setData({
      invalid: false,
    })
  },

  onHide() {
    clearInterval(this.data.timer);
  },
  onUnload() {
    clearInterval(this.data.timer);
  },
  onPullDownRefresh() {
    this.getDetail();
  },
  onShareAppMessage(res) {
    let {
      draw_id,
      award_id
    } = this.data.options;
    return {
      title: '又上线新奖品啦！马上送没了。',
      path: `/pages/new/luckyDetail/luckyDetail?from_id=${wx.getStorageSync("userInfo").id}&award_id=${award_id}&draw_id=${draw_id}`,
      imageUrl: this.data.serverUrl + this.data.dataList.award_info.icon_path,
    }
  },
})