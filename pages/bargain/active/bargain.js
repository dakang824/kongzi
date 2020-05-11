import Toast from '../../../dist/toast/toast';
import Dialog from '../../../dist/dialog/dialog';
import Notify from '../../../dist/notify/notify';
import Util from '../../../utils/util.js';
let http = require('../../../common/request.js'),
  timeS = null,
  app = getApp();
Page({
  data: {
    isNeed: true,
    up: false,
    shareImgbox: false,
    payType: false,
    isauth: false,
    layer: false,
    isFromShare: false,
    rootUrl: app.globalData.serverUrl,
    imageurl: app.globalData.imageurl,
    disabled: false,
    currentValue: 50,
    show: false,
    music: {
      status: true,
    },
    collec: false,
    countDown: {
      d: '00',
      h: '00',
      m: '00',
    },
    //帮忙砍价所需数据
    help: {
      cmd: 'helpOtherBargain',
      ope_id: '',
      inst_id: '',
      act_no: '',
      start_no: '',
      pic_path: '', //砍价人的微信头像
      nickname: '', //砍价人的微信名字
    },
    //砍价多少元
    reduce: '0.00',
    autho: false,
    isStrat: false,
    isHelp: false,
    isLaunch: false,
    helpHim: false,
    isLowmoney: false,
    share: false,
    self: false, //验证是不是自己
    // 跳转到报名所需要的数据
    baoming: {
      img: '',
      lable: '',
      title: '',
      money: '',
      activeTime: '',
      act_no: '',
      inst_id: '',
      view_id: '',
    },
    //拼团底部显示判断
    startPT: false,
    teamOK: false,
    teamdoing: false,
    friendHelp: false,
    friendHelpOk: false,
    loadingData: {},
    num: 3,
    id: '', //0表示砍价,1表示拼团,2表示试听,3表示优惠,
    payRadio: '1',
  },
  saveImg() {
    let that = this;
    Util.saveImg(this.data.shareImg, function() {
      that.setData({
        shareImgbox: false
      });
    });
  },
  shareFriend() {
    let that = this,
      data = this.data.data.group_info;
    http.postReq("/community/user/", {
      cmd: 'getGroupActFriendsterPoster',
      start_no: that.data.start_no,
      from_id: wx.getStorageSync('userInfo').open_id,
      inst_id: data.inst_id,
      act_no: data.act_no,
    }, function(res) {
      that.setData({
        shareImgbox: true,
        up: false,
        shareImg: that.data.rootUrl + res.path
      })
    })
  },
  showUp() {
    this.setData({
      up: true
    })
  },
  onChange1(event) {
    this.setData({
      'payRadio': event.detail
    });
  },
  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset;
    this.setData({
      'payRadio': name
    });
  },
  bargainError(e) {
    let list = this.data.data.bargain_info.bargain_list,
      i = e.currentTarget.dataset.i;
    list[i].pic_path = '';
    this.setData({
      'data.bargain_info.bargain_list': list
    });
  },
  imgError(e) {
    let i = e.currentTarget.dataset.i,
      list = this.data.data.group_info.group_list;
    list[i].pic_path = '';
    this.setData({
      'data.group_info.group_list': list
    });
  },
  headerError(e) {
    this.setData({
      'data.group_info.pic_path': ''
    })
  },
  loadimage(e) {
    var that = this;
    that.setData({
      url: that.data.url + ' ',
    })
  },
  onPullDownRefresh() {
    this.setData({
      'loadingData.isRefush': 1
    });
    this.refresh();
    wx.stopPullDownRefresh();
  },
  goHome() {
    wx.switchTab({
      url: '/pages/new/index/index'
    })
  },
  shareClose() {
    this.setData({
      sharefanli: false
    })
  },
  goShare() {
    this.setData({
      sharefanli: true
    })
  },
  refresh() {
    this.setData({
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
    this.loadingData();
  },
  againBuy: Util.throttle(function (e) {
    let data = this.data.data.group_info.order_info,
      that = this;
    http.postReq("/community/user/", {
      cmd: 'rePayUnifiedInstOrders',
      trade_no: data.trade_no,
      inst_id: data.inst_id,
      pay_type: that.data.payRadio,
      from_id: that.data.loadingData.fromid ? that.data.loadingData.fromid : ''
    }, function(res) {
      that.setData({
        'baoming.trade_no': res.trade_no,
        payData: res.payParams,
        pay_amount: res.pay_amount
      })
      if (that.data.loadingData.fromid) {
        that.setData({
          isFromShare: true
        })
      } else {
        that.payMoney();
      }
    })
  }),
  teamBuy() {
    this.setData({
      'baoming.type': 16
    });
    wx.navigateTo({
      url: '/pages/bargain/bargain_from/index?data=' + JSON.stringify(this.data.baoming),
    })
  },
  showPayType(e) {
    this.setData({
      payType: true,
      t_s: e.currentTarget.dataset.i
    })
  },
  // 立马购买 底价购买
  goBuy: Util.throttle(function (t, cmd) {
    let { ope_id, inst_id, act_no, fromid} = this.data.loadingData,
      that = this;
    http.postReq("/community/user/", {
      cmd: 'unifiedBargainOrdersV21',
      ope_id,
      inst_id,
      act_no,
      start_no: this.data.start_no,
      from_id: fromid ? fromid : '',
      pay_type: that.data.payRadio
    }, res=> {
      this.setData({
        'baoming.trade_no': res.trade_no,
        payData: res.payParams,
        pay_amount: res.pay_amount,
      })
      fromid ? this.setData({
        isFromShare: true
      }) : this.payMoney();
    })
  }),
  balancePay() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'payOrderWithBalance',
      trade_no: that.data.baoming.trade_no
    }, function(res) {
      app.login(this, function() {
        if (res.status == 1) {
          that.paySuccessCallBack();
          that.setData({
            isFromShare: false
          })
          that.refresh();
        };
      })
    })
  },
  paySuccessCallBack() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getOrderTicketTasks',
    }, function(res) {
      res.tasks[1].each_tickets != 0 ? Dialog.alert({
        title: '温馨提示',
        message: `恭喜您，获得${res.tasks[1].each_tickets}张抽奖券。赶快去抽奖吧！`,
        confirmButtonText: '我知道了',
      }).then(() => {
        that.setData({
          layer: true
        })
      }) : that.setData({
        layer: true
      });
    })
  },
  payMoney() {
    let pay = this.data.payData,
      that = this;
    if (this.data.payRadio == 1) {
      app.wxpay(pay, () => {}, () => {}, () => {
        this.setData({
          isFromShare: false
        })
        this.refresh();
      })
    } else {
      this.balancePay();
    }
  },
  gomeet() {
    wx.navigateTo({
      url: '/pages/bargain/meet/index?data=' + JSON.stringify(this.data.baoming),
    })
  },
  calling: function() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  collec() {
    let data = this.data.loadingData,
      that = this;
    http.postReq("/community/user/", {
      cmd: 'collectActs',
      inst_id: data.inst_id,
      act_no: data.act_no,
      type: this.data.collec ? 0 : 1
    }, function(res) {
      that.setData({
        collec: !that.data.collec
      })
    })
  },
  onLoad(e) {
    var that = this;
    e.cmd = 'getInstActDetailV20';
    'help' in e ? e.ope_id = JSON.parse(e.help).ope_id : '';
    this.setData({
      'loadingData': e,
      'baoming.qr_options': e,
      'loadingData.isRefush': 0,
    });
    wx.getSetting({
      success(res) {
        that.setData({
          isauth: res.authSetting['scope.userInfo']
        })
        that.loadingData();
      }
    })
    if (e.share) {
      this.setData({
        share: true
      })
      // if (e.fromid == wx.getStorageSync('userInfo').open_id) {
      //   Notify('要分享给别人吆,自己是没有优惠的');
      // }
    }
    e.fromid ? this.setData({
      'baoming.from_id': e.fromid
    }) : '';
    e.qr_id ? this.setData({
      'baoming.qr_id': e.qr_id
    }) : '';
  },

  loadingData() {
    clearInterval(timeS);
    let that = this,
      e = this.data.loadingData;
    http.postReq("/community/user/", that.data.loadingData, function(res) {
      wx.setStorageSync('b', res.data.act_info);
      let act_info = res.data.act_info,
        id = act_info.type;
      if (act_info.status == 3) {
        Dialog.alert({
          title: '温馨提示',
          message: '此活动已结束,前去查看其它活动.',
          zIndex: '999999'
        }).then(() => {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        });
      }
      if (that.data.baoming.qr_id || !act_info.enableSharedProfit) {
        act_info.shared_discount = 0;
      }
      that.setData({
        data: res.data,
        tem: res.data.act_info.back_path.indexOf('custom') == -1 ? true : false,
        collec: res.collect,
        'help.ope_id': that.data.loadingData.ope_id ? that.data.loadingData.ope_id : wx.getStorageSync('userInfo').id,
        'help.inst_id': e.inst_id,
        'help.act_no': e.act_no,
        'baoming.gift_name': act_info.gift_name,
        'baoming.need_stu_gender': act_info.need_stu_gender,
        'baoming.need_stu_age': act_info.need_stu_age,
        'baoming.title': act_info.title.replace(/\?/g, ""),
        'baoming.act_no': e.act_no,
        'baoming.inst_id': e.inst_id,
        'baoming.shared_discount': act_info.shared_discount,
        'baoming.firstlevel_profit': act_info.firstlevel_profit,
        'baoming.seclevel_profit': act_info.seclevel_profit,
        'baoming.shared': act_info.enableSharedProfit,
        "start_no": res.data.bargain_info.no ? res.data.bargain_info.no : res.data.group_info.no ? res.data.group_info.no : '',
        'baoming.img': act_info.list_pic,
        'baoming.type': act_info.type,
        // "baoming.order_limit": act_info.order_limit,
        "baoming.act_members": JSON.stringify(res.data.act_members),
        'baoming.lable': id,
        'baoming.view_id': res.view_id,
        'end_time': act_info.end_time.slice(0, 10),
        'baoming.activeTime': act_info.start_time.slice(0, 10).replace(/-/g, ".") + "-" + act_info.end_time.slice(0, 10).replace(/-/g, "."),
        id: id,
        disabled: act_info.status !== 2,
      })
      if (that.data.music.status) {
        that.onMusic();
      }

      //判断活动是开启还是结束
      if (act_info.status == 1) {
        that.countDown(act_info.start_time.slice(0, 19).replace(/-/g, "/"));
      } else {
        that.countDown(act_info.end_time.slice(0, 19).replace(/-/g, "/"));
      }
      // 设置标题
      // wx.setNavigationBarTitle({
      //   title: id == 1 ? '邀友砍价' : id == 2 ? '拉友拼团' : id == 3 ? 'N元试听' : id == 5 ? '限时优惠' : id == 6 ? '限量优惠' : ''
      // })
      //价格判断 id=1是砍价,id=2是拼团,id=3试听,id=5是优惠
      if (id == 1) {
        that.setData({
          'baoming.money': act_info.ori_price / 100,
        })
        // 判断是否开启砍价
        if (res.data.bargain_info.act_no) {
          let bargain_info = res.data.bargain_info,
            a = 0;
          if (bargain_info.bargain_list.length) {
            for (let item of bargain_info.bargain_list) {
              item.nickname = decodeURIComponent(item.nickname);
              item.time = item.time.slice(0, 19);
              a += item.reduct;
            }
          }
          that.setData({
            bargain_list: bargain_info.bargain_list.slice(0, 3),
            'help.start_no': bargain_info.no,
            dreduct: a
          })
          // 计算当前价格进度
          let priceData = res.data,
            oriPrice = res.data.bargain_info.ori_price,
            lowPrice = res.data.act_info.bargain_price_limit,
            nowPrice = res.data.bargain_info.cur_price,
            price = '';
          price = (oriPrice - nowPrice) / (oriPrice - lowPrice) * 100;
          that.setData({
            price: price
          });
          //判断是不是自己
          if (res.data.bargain_info.open_id == wx.getStorageSync('userInfo').open_id) {
            //判断是否是最低价购买
            if (price == 100) {
              that.setData({
                isLowmoney: true
              })
            } else {
              that.setData({
                isLaunch: true
              })
            }
          } else {
            //判断是否是帮好友砍价
            that.data.isauth ? '' : that.setData({
              autho: true
            });
            // 判断是否是帮好友砍过价
            let bargain_list = res.data.bargain_info.bargain_list,
              ishelp = false;
            for (let item of bargain_list) {
              item.nickname = decodeURIComponent(item.nickname);
              if (item.open_id == wx.getStorageSync('userInfo').open_id) {
                ishelp = true;
              }
            }
            if (ishelp) {
              that.setData({
                helpHim: true,
              });
            } else {
              that.setData({
                isHelp: true,
                help: JSON.parse(e.help)
              });
            }
          }
        } else {
          that.setData({
            isStrat: true,
          })
        }
      } else if (id == 2) {
        let group_info = res.data.group_info,
          ind = '',
          groups = res.data.groups;

        that.setData({
          'baoming.money': act_info.ori_price / 100
        })
        //判断好友进去的显示状态
        if (!res.data.group_info.myJoin && !res.data.group_info.myStart) {
          that.setData({
            startPT: true,
          })
          return;
        } else {
          //名字解码
          for (let item of res.data.group_info.group_list) {
            item.nickname = decodeURIComponent(item.nickname);
          }
          res.data.group_info.nickname = decodeURIComponent(res.data.group_info.nickname);

          //判断是发起的哪一个团
          for (let i = 0; i < groups.length; i++) {
            if (groups[i].no == group_info.group_no) {
              ind = i;
              break;
            }
          }
        }
        //判断是不是自己进入
        if (res.data.group_info.open_id == wx.getStorageSync('userInfo').open_id) {
          that.setData({
            'baoming.start_no': group_info.no,
            'baoming.type': 7,
            teamMoney: (Math.floor(act_info.ori_price * 100 - act_info.group_head_discount * 100 - groups[ind].price * 100) * 0.01),
            payStatus: group_info.status,
            self: true,
          })
          //判断人数是不是已经完成组团
          if (group_info.size == group_info.group_list.length + 1) {
            that.setData({
              teamOK: true
            })
          } else {
            that.setData({
              teamdoing: true
            })
          }
        } else {
          that.setData({
            'baoming.start_no': res.data.group_info.no,
            'baoming.type': 15,
            teamMoney: Math.floor(act_info.ori_price * 100 - groups[ind].price * 100) * 0.01,
          })
          //判断是否授权
          if (!that.data.isauth) {
            that.setData({
              autho: true
            })
          }
          if (res.data.group_info.size == res.data.group_info.group_list.length + 1) {
            that.setData({
              teamOK: true,
            })

            let ishelp = false;
            for (let item of res.data.group_info.group_list) {
              if (item.open_id == wx.getStorageSync('userInfo').open_id) {
                ishelp = true;
              }
            }!ishelp ? Dialog.alert({
              title: '温馨提示',
              message: '此拼团已满，不能加入该团。\n请发起拉友拼团'
            }).then(() => {
              let b = that.data.loadingData;
              that.onLoad({
                act_no: b.act_no,
                inst_id: b.inst_id,
                ope_id: wx.getStorageSync('userInfo').id,
                from_id: b.from_id,
                source: b.source
              });
            }) : '';
          } else {
            //判断是不是帮好友拼过团
            let ishelp = false;
            for (let item of res.data.group_info.group_list) {
              item.nickname = decodeURIComponent(item.nickname);
              if (item.open_id == wx.getStorageSync('userInfo').open_id) {
                ishelp = true;
              }
            }
            ishelp ? that.setData({
              friendHelpOk: true
            }) : that.setData({
              friendHelp: true
            });
          }
        }
      } else if (id == 3) {
        that.setData({
          'baoming.money': act_info.audition_price / 100
        })
      } else if (id == 5) {
        that.setData({
          'baoming.money': act_info.deposit / 100
        })
      } else if (id == 6) {
        that.setData({
          'baoming.money': act_info.bound_discount_price / 100
        })
      }
      that.setData({
        data: res.data
      });

    })
    that.getAgentMessages2();
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
  // 用户授权
  autho(e) {
    var that = this;
    wx.getUserInfo({
      success(res) {
        let userInfo = res.userInfo;
        http.postReq("/community/user/", {
          cmd: 'modifyMyInfo',
          'nickname': encodeURIComponent(userInfo.nickName),
          'gender': userInfo.gender == 1 ? 'm' : userInfo.gender == 2 ? 'f' : 'f',
          'avatarUrl': userInfo.avatarUrl,
        }, function(res) {
          console.log(res);
        })
        userInfo.nickname = decodeURIComponent(userInfo.nickname)
        wx.setStorageSync('helper', userInfo);
        that.setData({
          autho: false,
          isauth: true
        })
      },
      fail() {
        wx.hideLoading()
      }
    })
  },
  onMusic(e) {
    this.audioCtx = wx.createAudioContext('music'),
      this.audioCtx.play();
  },
  lookMore() {
    let list = this.data.bargain_list.length,
      that = this,
      data = this.data.baoming;
    http.postReq("/community/user/", {
      cmd: 'getBargainList',
      inst_id: data.inst_id,
      act_no: data.act_no,
      start_no: that.data.data.bargain_info.no,
    }, function(res) {
      if (list == res.data.length) {
        Toast.fail('没有更多')
      } else {
        for (let item of res.data) {
          item.nickname = decodeURIComponent(item.nickname);
        }
        that.setData({
          bargain_list: res.data
        })
      }
    })
  },
  musicStatus() {
    this.setData({
      'music.status': !this.data.music.status
    })
    this.data.music.status ? this.audioCtx.play() : this.audioCtx.pause()
  },
  countDown(t) {
    let that = this;
    timeS = setInterval(function() {
      var start = new Date(); //开始时间
      var end = new Date(t); //结束时间，可以设置时间
      var result = parseInt((end.getTime() - start.getTime()) / 1000); //计算出豪秒
      var d = parseInt(result / (24 * 60 * 60)); //用总共的秒数除以1天的秒数
      var h = parseInt(result / (60 * 60) % 24); //精确小时，用去余
      var m = parseInt(result / 60 % 60); //剩余分钟就是用1小时等于60分钟进行趣余
      var s = parseInt(result % 60);
      d < 0 ? clearInterval(timeS) : that.setData({
        'countDown.d': d < 10 ? '0' + d : d,
        'countDown.h': h < 10 ? '0' + h : h,
        'countDown.m': m < 10 ? '0' + m : m,
        'countDown.s': s < 10 ? '0' + s : s
      })
    }, 1000);
  },
  openTeam(e) {
    //判断按钮是否禁用
    let ind = e.currentTarget.dataset.no,
      data = this.data.data.groups,
      money = (Math.floor((this.data.data.act_info.ori_price * 100) - (this.data.data.act_info.group_head_discount * 100) - (data[ind].price * 100)) / 100.0);
    // money = e.currentTarget.dataset.money;
    if (this.data.data.act_info.status !== 1) {
      this.setData({
        'baoming.group_no': data[ind].no,
        'baoming.money': money / 100
      });
      wx.navigateTo({
        url: '/pages/bargain/bargain_from/index?data=' + JSON.stringify(this.data.baoming),
      })
    }
  },
  join() {
    let {
      top1,
      act_info
    } = this.data.data, t = { ...this.data.baoming
    };
    for (let key of this.data.data.groups) {
      if (top1.no == key.no) {
        t.money = (Math.floor(act_info.ori_price * 100 - key.price * 100) * 0.01) / 100;
      }
    }
    t.discount = act_info.shared_discount;
    t.start_no = top1.group_no;
    t.type = 15,
      wx.navigateTo({
        url: '/pages/bargain/bargain_from/index?data=' + JSON.stringify(t),
      })
  },
  statusClick(e) {
    let status = e.currentTarget.dataset.status,
      id = this.data.id,
      that = this;
    if (status == 0) {
      that.setData({
        'baoming.discount': that.data.data.act_info.shared_discount
      });
      let baoming = this.data.baoming;
      id == 2 ? baoming.money = this.data.teamMoney / 100 : '';
      wx.navigateTo({
        url: '/pages/bargain/bargain_from/index?data=' + JSON.stringify(baoming),
      })
    } else if (status == 1) { //帮他砍价
      let helper = wx.getStorageSync("helper");
      that.setData({
        'help.pic_path': helper.avatarUrl,
        'help.nickname': helper.nickName,
        'help.ope_id': wx.getStorageSync("userInfo").id
      })
      http.postReq("/community/user/", that.data.help, res => {
        that.setData({
          isHelp: false,
          helpHim: true,
          show: true,
          reduce: res.reduce
        })
        that.loadingData();
      })
    }
  },
  follow() {
    let loadingData = this.data.loadingData;
    loadingData.ope_id = wx.getStorageSync('userInfo').id;
    delete loadingData.help;
    this.setData({
      'loadingData': loadingData,
      helpHim: false,
      show: false
    });
    this.loadingData();
  },
  onClose() {
    this.setData({
      show: false,
      autho: false,
      layer: false,
      isFromShare: false,
      payType: false,
      up: false,
      shareImgbox: false,
    });
  },
  //关闭底部价钱优惠提示框
  fromShare() {
    this.setData({
      isFromShare: false
    });
    this.refresh();
  },
  onDrag(e) {
    this.setData({
      currentValue: e.detail.value
    })
  },
  onUnload() {
    clearInterval(timeS);
  },
  onHide() {
    this.audioCtx.pause();
  },
  onShow() {
    this.setData({
      balance: wx.getStorageSync('userInfo').balance
    });
  },
  showShare() {
    this.setData({
      shareImg: true
    })
  },
  onShareAppMessage(e) {
    let that = this,
      id = this.data.id,
      s = wx.getStorageSync('userInfo'),
      {
        act_no,
        inst_id
      } = that.data.loadingData,
      path = `/pages/bargain/active/bargain?from_id=${s.id}&act_no=${act_no}&inst_id=${inst_id}&source=31`,
      data = null;
    if (id == 3 || id == 5 || id == 6) {
      return {
        title:this.data.data.act_info.title,
        path,
        imageUrl: that.data.rootUrl + that.data.data.act_info.pic_path,
      }
    }
    if (id == 1) {
      data = this.data.data.bargain_info
    } else if (id == 2) {
      data = this.data.data.act_info
    }

    if (e.target && e.target.dataset.type == 1) { //判断是不是底价购买分享
      path = `/pages/bargain/active/bargain?act_no=${act_no}&inst_id=${data.inst_id}&fromid=${s.open_id}&share=true&source=22&from_id=${s.id}`;
    } else { //底部分享所需数据
      path = `/pages/bargain/active/bargain?act_no=${act_no}&inst_id=${inst_id}&help=${JSON.stringify(that.data.help)}&start_no=${that.data.start_no}&share=true&source=22&from_id=${s.id}`;
      if (id == 1 && this.data.helpHim) {
        path += '&ope_id=' + that.data.loadingData.ope_id;
      }
      if (id == 1 && this.data.isLaunch) {
        path += '&ope_id=' + s.id;
      }

      //获取活动发起者的open_id
      if (!that.data.loadingData.fromid) {
        path += '&fromid=' + wx.getStorageSync('userInfo').open_id;
      } else {
        path += '&fromid=' + that.data.loadingData.fromid;
      }
    }
    console.log(path);
    var shareObj = {
      title: this.data.data.act_info.title,
      path: path,
      imageUrl: that.data.rootUrl + that.data.data.act_info.pic_path,
    };
    return shareObj;
  }
})