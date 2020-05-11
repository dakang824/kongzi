import Toast from '../../../dist/toast/toast';
let http = require('../../../common/request.js'),
  app = getApp(),
  areaList = require("./area.js");
import Dialog from '../../../dist/dialog/dialog';
import Util from '../../../utils/util.js';
Page({
  data: {
    errPhone: true,
    province: '上海市',
    city: '上海市',
    area: '黄浦区',
    cityShow: false,
    areaList: '',
    ticket: {},
    rootUrl: app.globalData.serverUrl,
    disabled: true,
    showAge: false,
    columns: ['1岁', '2岁', '3岁', '4岁', '5岁', '6岁', '7岁', '8岁', '9岁', '10岁', '11岁', '12岁', '13岁', '14岁', '15岁', '其它'],
    ind: 0,
    show: false,
    isFromShare: false,
    goOrder: true,
    order: {
      cmd: '',
      act_no: '',
      inst_id: '',
      stu_name: '',
      stu_age: '',
      mobile: '',
      view_id: '',
      trade_no: '',
      get_gift_type: 1,
      gender: 'm',
      pay_type: '1'
    },
    list: ['a', 'b', 'c'],
    school: '',
  },
  seleCity(e) {
    let val = e.detail.values;
    this.setData({
      cityShow: false,
      province: val[0].name,
      city: val[1].name,
      area: val[2].name
    });
  },
  showCity() {
    this.setData({
      cityShow: !this.data.cityShow
    })
  },
  onChange1(event) {
    let {
      pay_amount1,
      ticket,
      pay_amount
    } = this.data, pay = ticket.id ? pay_amount1 : pay_amount / 100;
    this.setData({
      'order.pay_type': pay == 0 ? '2' : event.detail
    });
  },
  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset, {
      pay_amount1,
      ticket,
      pay_amount
    } = this.data, pay = ticket.id ? pay_amount1 : pay_amount / 100;;
    this.setData({
      'order.pay_type': pay == 0 ? '2' : name
    });
  },
  onChange(event) {
    this.setData({
      school: event.detail
    });
    this.ver();
  },
  genderChange(event) {
    this.setData({
      'order.gender': event.detail,
      checked: event.detail
    });
  },
  onConfirm(e) {
    this.setData({
      'order.stu_age': e.detail.value,
      showAge: false
    })
    this.ver();
  },
  switchLine() {
    this.data.switchGift ? (this.setData({
      'order.get_gift_type': this.data.order.get_gift_type == 1 ? 2 : 1
    }), this.ver()) : ''
  },
  selage(e) {
    let age = parseInt(e.currentTarget.dataset.item);
    this.setData({
      'order.stu_age': age,
      selNum: e.currentTarget.dataset.index
    })
    this.ver();
  },
  selAge() {
    this.setData({
      showAge: true
    })
  },
  lastStep() {
    this.setData({
      show: false
    });
    wx.navigateBack({
      delta: 1,
    })
  },
  getphonenumber(e) {
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      Toast('授权手机号失败,请手动填写。');
      this.setData({
        errPhone: false
      })
      return;
    }
    let data = this.data.data,
      that = this;
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
            'order.mobile': res.data.phoneNumber
          })
          that.ver();
          app.login();
        } else {
          Toast('授权手机号失败,请手动填写。');
          that.setData({
            errPhone: false
          })
        }
      }
    })
  },
  toggle(event) {
    const {
      name
    } = event.currentTarget.dataset;
    this.setData({
      school: name
    });
    this.ver();
  },
  onClose() {
    this.setData({
      show: false,
      timeShow: false,
      isFromShare: false,
      showAge: false
    });
  },
  goback() {
    wx.navigateBack({
      delta: 1
    })
  },
  gomeet() {
    let {
      inst_id,
      order_no
    } = this.data.data;
    wx.redirectTo({
      url: `/pages/bargain/courses/courses?union_id=${inst_id}&order_no=${order_no}&age=${this.data.order.stu_age}`,
    })
  },
  onLoad(e) {
    var that = this,
      data;
    try {
      data = JSON.parse(e.data);
    } catch (event) {
      data = JSON.parse(decodeURIComponent(e.data))
    }
    data.pic_path = app.globalData.serverUrl + data.img;
    if (data.qr_id) {
      this.setData({
        'order.qr_id': data.qr_id,
      })
    }
    if (data.from_id) {
      this.setData({
        'order.from_id': data.from_id,
        'order.shared_discount': data.shared_discount,
      })
    }
    if (wx.getStorageSync('userInfo').mobile) {
      this.setData({
        'order.mobile': wx.getStorageSync('userInfo').mobile
      })
    }
    this.setData({
      'order.inst_id': data.inst_id,
      'order.act_no': data.act_no,
      'order.view_id': data.view_id,
      'order.amount': (data.money * 100).toFixed(2) * 1,
      'order.qr_options': data.qr_options,
      data: data,
      areaList: areaList.default,
      platform: app.globalData.platform,
      'data.act_members': JSON.parse(data.act_members),
    });

    // e.type 1是邀友砍价,2是拼团,3是试听,4优惠,5加入拼团,6拼团原价购买
    if (data.type == 1) {
      this.setData({
        'order.cmd': 'startBargain'
      })
    } else if (data.type == 2) {
      this.setData({
        'order.cmd': 'startGroupV21',
        'order.group_no': data.group_no
      })
    } else if (data.type == 3) {
      this.setData({
        'order.cmd': 'unifiedAuditionOrdersV21'
      })
    } else if (data.type == 4) {
      ('pb_code' in data) && data.pb_code == 1 ? this.setData({
        'order.cmd': 'unifiedDepositOrdersV21',
        'order.pb_code': 1,
        'order.publishBenefitCode': data.publishBenefitCode,
      }) : this.setData({
        'order.cmd': 'unifiedDepositOrdersV21',
      });
    } else if (data.type == 15) {
      this.setData({
        'order.cmd': 'joinGroupV21',
        'order.start_no': data.start_no
      })
    } else if (data.type == 5) {
      this.setData({
        'order.cmd': 'unifiedDiscountOrdersV21',
        'order.start_no': data.start_no
      })
    } else if (data.type == 16) {
      this.setData({
        'order.cmd': 'unifiedGroupActOrdersOnOriPriceV21',
      })
    } else if (data.type == 6) {
      this.setData({
        'order.cmd': 'unifiedBoundDiscountOrdersV21',
      })
    }
  },
  getMyCoupon(b) {
    let {
      baoming,
      data
    } = this.data;
    http.postReq("/community/product/", {
      cmd: 'getMyCoupon',
      prod_type: data.lable == 4 ? 1 : 2,
      prod_id: b.union_id || b.inst_id,
      prod_no: b.no
    }, res => {
      this.setData({
        ticketsLen: res.data
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
    }) : id == 4 ? this.setData({
      'order.gift_address': e.detail
    }) : '';
    this.ver();
  },
  // 验证数据是否都填完
  ver() {
    let {
      province,
      order,
      data,
      bt
    } = this.data, result;
    result = data.type == 4 ? (order.stu_name !== '' && order.stu_age !== '' && order.mobile !== '') : (order.stu_name !== '' && order.stu_age !== '' && order.mobile !== '' && this.data.school !== '')
    this.setData({
      disabled: !result
    });
    if (!this.data.disabled) {
      if (bt.enable_gift && order.get_gift_type == 2 && !order.gift_address) {
        this.setData({
          disabled: true
        })
      }
      if (this.data.switchGift) {
        if (bt.enable_gift && order.get_gift_type == 2 && !order.gift_address) {
          this.setData({
            disabled: true
          })
        }
      }
    }
  },
  onUnload() {
    wx.getStorageSync('b') ? wx.removeStorageSync('b') : '';
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2];
    prevPage.setData({
      autho: false,
      isStrat: false,
      isHelp: false,
      isLaunch: false,
      helpHim: false,
      isLowmoney: false,
      startPT: false,
      teamOK: false,
      teamdoing: false,
      friendHelp: false,
      friendHelpOk: false
    })
    prevPage.loadingData();
  },
  sign: Util.throttle(function (e) {
    let that = this,
      act_members = that.data.data.act_members,
      // arr = [],
      {
        province,
        city,
        area,
        order,
        school
      } = this.data;
    order.gift_address = province + city + area + order.gift_address;
    if (!(order.mobile.length == 11)) {
      Toast.fail('电话号码错误');
      return;
    }

    school === '' ? '' : order.branch_no = that.data.data.act_members[school].branch_no;
    http.postReq("/community/user/", order, res=> {
      if (!('pb_code' in order&&order.pb_code==1)&&res.pay_amount == 0) {
        Toast.success('购买成功');
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
        return;
      }
      if (that.data.data.type == 1) {
        Toast.success(res.msg);
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        let {trade_no,order_no,payParams,pay_amount,discount}=res;
        that.setData({
          'data.trade_no': trade_no,
          'data.no':order_no,
          'data.order_no':order_no,
          pay:payParams,
          pay_amount,
          discount
        })
        if (that.data.data.select_course_type == 1) {
          let {
            inst_id,
            order_no,
            shared,
            pb_code,
            publishBenefitCode
          } = that.data.data,url=`/pages/bargain/courses/courses?union_id=${inst_id}&order_no=${order_no}&shared=${shared}&coursePay=1&pay_type=${that.data.order.pay_type}&trade_no=${res.trade_no}&age=${that.data.order.stu_age}`;
          wx.redirectTo({
            url:pb_code==1?url+=`&pb_code=${pb_code}&publishBenefitCode=${publishBenefitCode}`:url
          });
          wx.setStorageSync('pay', res);
          wx.setStorageSync('shareData', JSON.stringify(that.data.data));
          wx.setStorageSync('select_inst', that.data.data.select_inst)
        } else if(('pb_code' in order&&order.pb_code==1)){
          this.balancePay();
        }else {
          that.setData({
            isFromShare: true
          })
          //默认选择一个代金券
          let {
            ticketsLen
          } = that.data, min = [];
          if (ticketsLen.length) {
            for (let key of ticketsLen) {
              min.push(that.set_discount({
                value: key.value,
                type: key.type,
                id: key.user_coupon_id,
                hasCard: 1,
                balance: key.balance,
              }));
            }
            let {
              type,
              value,
              user_coupon_id,
              balance
            } = that.data.ticketsLen[min.indexOf(Math.min.apply(Math, min))];
            that.set_discount({
              value,
              type,
              id: user_coupon_id,
              hasCard: 1,
              balance,
            });
          }
        }
      }
    })
  }),
  balancePay() {
    http.postReq("/community/user/", {
      cmd: 'payOrderWithBalance',
      trade_no: this.data.data.trade_no
    }, res=> {
      app.login(this, ()=> {
        res.status == 1 ? this.paySuccessCallBack() : this.payErrorCallBack();
      })
    })
  },
  back() {
    this.setData({
      isFromShare: false
    });
    wx.navigateBack({
      delta: 1
    })
  },
  paySuccessCallBack() {
    let that = this,
      type = this.data.data.type;
    that.setData({
      isFromShare: false,
    })
    //判断是否开启分享
    if (that.data.data.shared == 1 && (type == 3 || type == 4 || type == 5 || type == 6)) {
      http.postReq("/community/award/", {
        cmd: 'getOrderTicketTasks',
      }, function (res) {
        res.tasks[1].each_tickets != 0 ? Dialog.alert({
          title: '温馨提示',
          message: `购买成功,恭喜您，获得${res.tasks[1].each_tickets}张抽奖券。赶快去抽奖吧！`,
          confirmButtonText: '我知道了',
        }).then(() => {
          wx.redirectTo({
            url: '/pages/bargain/rebate/rebate?data=' + JSON.stringify(that.data.data),
          })
        }) : wx.redirectTo({
          url: '/pages/bargain/rebate/rebate?data=' + JSON.stringify(that.data.data),
        });
      })
    } else if (type == 4) {
      http.postReq("/community/award/", {
        cmd: 'getOrderTicketTasks',
      }, function (res) {
        res.tasks[1].each_tickets != 0 ? Dialog.alert({
          title: '温馨提示',
          message: `恭喜您，获得${res.tasks[1].each_tickets}张抽奖券。赶快去抽奖吧！`,
          confirmButtonText: '我知道了',
        }).then(() => {
          that.setData({
            show: true
          })
        }) : that.setData({
          show: true
        });
      })
    } else {
      http.postReq("/community/award/", {
        cmd: 'getOrderTicketTasks',
      }, function (res) {
        if (res.tasks[1].each_tickets != 0) {
          Dialog.alert({
            title: '温馨提示',
            message: `恭喜您，获得${res.tasks[1].each_tickets}张抽奖券。赶快去抽奖吧！`,
            confirmButtonText: '我知道了',
          }).then(() => {
            wx.navigateBack({
              delta: 1
            })
          })
        } else {
          wx.showToast({
            title: '支付成功',
            duration: 2000
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000)
        }
      })
    }
  },
  payErrorCallBack() {
    setTimeout(function () {
      wx.navigateBack({
        delta: 1
      })
    }, 1500)
  },
  payMoney: Util.throttle(function (e) {
    let that = this,
      t = that.data.data.type,
      ticket = that.data.ticket,
      {
        pay_type
      } = that.data.order;
    let catCardMoney = that.data.catCardMoney;
    let m = this.data.pay_amount / 100,
      v = that.data.reduce + this.data.discount;
    if ('id' in ticket) {
      http.postReq("/community/user/", {
        cmd: 'useCouponInCourseOrder',
        trade_no: that.data.data.trade_no,
        type: t == 4 ? 1 : 2,
        pay_type: pay_type,
        amount: m - v,
        discount: v,
        user_coupon_id: ticket.id
      }, res => {
        if (pay_type == 1) {
          this.setData({
            pay: res.payParams
          })
        }
        that.lastPayMoney();
      })
    } else {
      that.lastPayMoney();
    }
  }),
  lastPayMoney() {
    let that = this,
      pay = this.data.pay;
    if (that.data.order.pay_type == 1) {
      app.wxpay(pay, () => {
        this.paySuccessCallBack();
      }, () => {
        this.payErrorCallBack();
      })
    } else {
      that.balancePay();
    }
  },
  onReady() {
    let b = wx.getStorageSync('b'),
      gift_ype = b.get_gift_type + 1;
    this.setData({
      'order.get_gift_type': gift_ype == 3 ? 1 : gift_ype,
      'order.gift_address': b.gift_address,
      'switchGift': gift_ype == 3,
      bt: b,
      balance: b.balance * 100
    })
    this.getMyCoupon(b);
  },
  set_discount(e) {
    let m = this.data.pay_amount / 100,
      d = (e.type == 4 ? (m - e.balance) : e.type == 1 ? (m - e.value) : e.type == 2 ? m * (e.value / 100) : 0).toFixed(2),
      pay_amount1 = d < 0 ? 0 : d;
    d <= 0 ? this.setData({
      'order.pay_type': '2'
    }) : '';
    this.setData({
      ticket: e,
      pay_amount1,
      reduce: (e.type == 4 ? (m <= e.balance ? m : e.balance) : e.type == 1 ? (m <= e.value ? m : e.value) : e.type == 2 ? m - m * (e.value / 100) : 0).toFixed(2),
      catCardMoney: (e.balance > m ? m : m - e.balance).toFixed(2)
    });
    return Number(pay_amount1);
  },
  onShareAppMessage() {}
})