import Dialog from '../../../dist/dialog/dialog';
import Toast from '../../../dist/toast/toast';
let http = require('../../../common/request.js'),
  app = getApp();
import Util from '../../../utils/util.js';
Page({
  data: {
    ticket: {},
    school: [],
    disabled: true,
    postData: {
      "cmd": "orderSelectCourseV2",
      union_id: '',
      order_no: '',
      branches: []
    },
    isFromShare: false
  },
  backClose() {
    wx.navigateBack({
      delta: 1
    })
  },
  onChange1(event) {
    let {
      pay_amount1,
      ticket,
      pay_amount
    } = this.data, pay = ticket.id ? pay_amount1 : pay_amount / 100;
    console.log(pay);
    this.setData({
      'pay_type': pay == 0 ? '2' : event.detail
    });
  },
  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset, {
      pay_amount1,
      ticket,
      pay_amount
    } = this.data, pay = ticket.id ? pay_amount1 : pay_amount / 100;
    this.setData({
      'pay_type': pay == 0 ? '2' : name
    });
  },
  toggle(event) {
    let {disabled,yx}=event.currentTarget.dataset;
    disabled? wx.showToast({
      title: yx,
      icon: 'none'
    }) : '';
    const {
      name
    } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${name}`);
    checkbox.toggle();
  },
  onChange(event) {
    if (event.detail.length) {
      let members = this.data.data.act_members,
        ind = event.detail[event.detail.length - 1];
      if (members[ind].need_num && members[ind].need_num <= members[ind].num) {
        Dialog.alert({
          title: '温馨提示',
          message: '此课程已选满，请选择其它课程。'
        }).then(() => {

        });
      } else {
        this.setData({
          school: event.detail
        });
        this.ver();
      }
    } else {
      this.setData({
        school: []
      })
      this.ver();
    }
  },
  checkboxClick(e) {
    let {disabled,yx}=event.currentTarget.dataset;
    disabled ? wx.showToast({
      title: yx,
      icon: 'none'
    }) : '';
  },
  ver() {
    let {
      order_limit_min
    } = this.data.data;
    this.setData({
      disabled: !(this.data.school.length >= order_limit_min)
    })
  },
  sign() {
    let that = this,
      data = that.data.postData,order_limit=this.data.order_limit;
      let act_members = that.data.data.act_members,
        arr = [];
      for (let item of that.data.school) {
        arr.push({
          inst_id: act_members[item].inst_id,
          branch_no: act_members[item].branch_no
        })
      }
      data.branches = arr;

    Dialog.confirm({
      message: order_limit==arr.length?'提交后，教育机构会在3个工作日内与您电话联系，请注意接听；有任何问题，请随时联系孔紫客服。':`您知道吗，您最多可以选择${order_limit}个课程！您确定要提交吗，或是再看一下？`
    }).then(() => {
      http.postReq("/community/user/", data, res => {
        let pages = getCurrentPages(),
          t = this.data.shareData,
          prevPage = pages[pages.length - 2];
        if (prevPage.__route__ == 'pages/order/orderDetail/orderDetail') {
          prevPage.setData({
            'bigData.selected_course': 1
          });
          prevPage.getCourse(data.union_id, data.order_no)
        }
        //判断是否是先选课后付款
        if (!('pb_code' in t && t.pb_code == 1) && that.data.coursePay) {
          that.setData({
            isFromShare: true
          });
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
        } else {
          ('pb_code' in t && t.pb_code == 1) ? this.balancePay(): this.tip();
        }
        prevPage.setData({
          'd.selected_course': 1
        });
      })
    }).catch(() => {

    });
  },
  tip() {
    let that = this;
    Dialog.alert({
      title: '温馨提示',
      message: '您选择的课程已成功提交，校区课程顾问会在72小时内与您电话联系，确定上课时间，请注意接听。'
    }).then(() => {
      //判断是否开启分享
      if (that.data.shared == 1) {
        wx.redirectTo({
          url: '/pages/bargain/rebate/rebate?data=' + JSON.stringify(that.data.shareData),
        })
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
    });
  },
  balancePay(trade_no) {
    http.postReq("/community/user/", {
      cmd: 'payOrderWithBalance',
      trade_no: this.data.trade_no
    }, res => {
      app.login(this, () => {
        res.status == 1 ? this.paySuccessCallBack() : this.payErrorCallBack();
      })
    })
  },
  paySuccessCallBack() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getOrderTicketTasks',
    }, res => {
      res.tasks[1].each_tickets != 0 ? Dialog.alert({
        title: '温馨提示',
        message: `恭喜您，获得${res.tasks[1].each_tickets}张抽奖券。赶快去抽奖吧！`,
        confirmButtonText: '我知道了',
      }).then(() => {
        that.tip();
      }) : that.tip();
    })
    this.onClose();
  },
  payErrorCallBack() {
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 1500)
    this.onClose();
  },

  pay: Util.throttle(function (e) {
    let {
      type,
      trade_no
    } = this.data.shareData, {
        ticket,
        catCardMoney,
        pay_amount,
        reduce,
        discount,
        pay_type
      } = this.data, m = pay_amount / 100,
      v = reduce + discount;
    if ('id' in ticket) {
      http.postReq("/community/user/", {
        cmd: 'useCouponInCourseOrder',
        trade_no,
        type: type == 4 ? 1 : 2,
        pay_type,
        amount: m - v,
        discount: v,
        user_coupon_id: ticket.id
      }, res => {
        if (pay_type == 1) {
          wx.setStorageSync('pay', res)
        }
        this.lastPayMoney();
      })
    } else {
      this.lastPayMoney();
    }
  }),
  lastPayMoney() {
    let pay = wx.getStorageSync('pay'),
      shareData = wx.getStorageSync('shareData');
    if (this.data.pay_type == 1) {
      if (this.data.coursePay && pay) {
        app.wxpay(pay.payParams, () => {
          this.paySuccessCallBack();
        }, () => {
          this.payErrorCallBack();
        })
      }
    } else {
      this.balancePay();
    }
  },
  onUnload() {
    wx.removeStorageSync('pay');
    wx.removeStorageSync('shareData');
  },
  onLoad(e) {
    let that = this,
      {
        coursePay,
        shared,
        pay_type,
        trade_no,
        order_no,
        act_no
      } = e;
    this.setData({
      'postData.union_id': e.union_id || e.inst_id,
      coursePay,
      shared,
      pay_type,
      trade_no,
      age: Number(e.age),
      'postData.order_no': order_no,
      'postData.act_no': act_no,
    });
    if (wx.getStorageSync('shareData')) {
      let pay = wx.getStorageSync('pay');
      this.setData({
        shareData: JSON.parse(wx.getStorageSync('shareData')),
        'shareData.selected_course': 1,
        pay_amount: pay.pay_amount,
        discount: pay.discount,
        balance: wx.getStorageSync('userInfo').balance
      })
    };

    http.postReq("/community/user/", {
      "cmd": "getOrderCouldCHooseCourses",
      union_id: e.union_id || e.inst_id,
      order_no: e.order_no
    }, res => {
      if (res.data) {
        let data = {};
        data.order_limit = res.data[0].order_limit;
        data.order_limit_min = res.data[0].order_limit_min;
        data.act_members = res.data;
        that.setData({
          data
        })

        let select_inst = res.select_inst || wx.getStorageSync('select_inst'),
          members = data.act_members,
          school = [];

        for (let i = 0; i < members.length; i++) {
          if (members[i].mast_select == 1) {
            school.push(String(i));
            that.setData({
              school: school,
            })
          }
        }
        if (select_inst) {
          for (let i = 0; i < members.length; i++) {
            if (members[i].inst_id == select_inst) {
              school.push(String(i));
              that.setData({
                school: school,
                selected: i,
                disabled: false
              })
            }
          }
        }

        this.ver();
      }
    })
    this.getMyCoupon();
  },
  getMyCoupon() {
    let {
      shareData,
      postData
    } = this.data;
    http.postReq("/community/product/", {
      cmd: 'getMyCoupon',
      prod_type: 1,
      prod_id: shareData ? shareData.inst_id : postData.union_id,
      prod_no: shareData ? shareData.act_no : postData.act_no
    }, res => {
      this.setData({
        ticketsLen: res.data
      })
    })
  },
  onClose() {
    this.setData({
      isFromShare: false
    })
  },
  set_discount(e) {
    let m = this.data.pay_amount / 100,
      d = (e.type == 4 ? (m - e.balance) : e.type == 1 ? (m - e.value) : e.type == 2 ? m * (e.value / 100) : 0).toFixed(2),
      pay_amount1 = d < 0 ? 0 : d;
    d <= 0 ? this.setData({
      pay_type: '2'
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