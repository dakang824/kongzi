import Toast from '../../dist/toast/toast';
import Dialog from '../../dist/dialog/dialog';
import Notify from '../../dist/notify/notify';
let http = require('../../common/request.js'),
  timeS = null,
  app = getApp();
import Util from '../../utils/util';
Page({
  data: {
    getGift: false,
    isNeed: true,
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
    id: '' //0表示砍价,1表示拼团,2表示试听,3表示优惠,
  },
  onPullDownRefresh() {
    this.setData({
      'loadingData.isRefush': 1,
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
    let that = this,
      d = this.data.loadingData,
      fromId = d.from_id;
    delete d.from_id;
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
      friendHelpOk: false,
      loadingData: d
    })
    that.loadingData();
    d.from_id = fromId;
    that.setData({
      loadingData: d
    })
  },
  againBuy() {
    let data = this.data.data.group_info.order_info,
      that = this;
    http.postReq("/community/user/", {
      cmd: 'rePayUnifiedOrders',
      // order_no: data.order_no,
      trade_no: data.trade_no,
      inst_id: data.inst_id,
      from_id: that.data.loadingData.fromid ? that.data.loadingData.fromid : ''
    }, function (res) {
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
  },
  teamBuy() {
    this.setData({
      'baoming.type': 6
    });
    wx.navigateTo({
      url: '/pages/bargain/bargain_from/index?data=' + JSON.stringify(this.data.baoming),
    })
  },
  // 立马购买 底价购买
  goBuy() {
    let data = this.data.loadingData,
      no = this.data.start_no,
      that = this;
    http.postReq("/community/user/", {
      cmd: 'unifiedBargainOrdersV20',
      ope_id: data.ope_id,
      inst_id: data.inst_id,
      act_no: data.act_no,
      start_no: no,
      from_id: that.data.loadingData.fromid ? that.data.loadingData.fromid : ''
    }, function (res) {
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
  },
  payMoney() {
    let pay = this.data.payData;
    app.wxpay(pay, () => {
      this.setData({
        layer: true
      });
    }, () => {}, () => {
      this.setData({
        isFromShare: false
      })
      this.refresh();
    })
  },
  gomeet() {
    wx.navigateTo({
      url: '/pages/bargain/meet/index?data=' + JSON.stringify(this.data.baoming),
    })
  },
  calling: function () {
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
    }, res => {
      that.setData({
        collec: !that.data.collec
      })
    })
  },
  onLoad(e) {
    var that = this;
    e.cmd = 'getActDetailV20';
    this.setData({
      'loadingData': e,
      code:'pbcode' in e?e.pbcode:'',
      'baoming.qr_options': e,
      'loadingData.isRefush': 0
    });
    wx.getSetting({
      success(res) {
        let isauth = res.authSetting['scope.userInfo'];
        that.setData({
          isauth,
          autho: !isauth
        })
        that.loadingData();
      }
    })
    if (e.share) {
      this.setData({
        share: true
      })
      if (e.fromid == wx.getStorageSync('userInfo').open_id) {
        Notify('要分享给别人吆,自己是没有优惠的');
      }
    }
    if (e.fromid) {
      this.setData({
        'baoming.from_id': e.fromid
      })
    }
    if (e.qr_id) {
      this.setData({
        'baoming.qr_id': e.qr_id
      })
    }
    e.hasOwnProperty('select_inst') ? this.setData({
      'baoming.select_inst': e.select_inst
    }) : '';
  },
  loadingData() {
    clearInterval(timeS);
    let that = this,
      e = this.data.loadingData;
    http.postReq("/community/user/", that.data.loadingData, function (res) {
      wx.setStorageSync('b', res.data.act_info);
      let act_info = res.data.act_info,
        id = act_info.type - 1;
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
        collec: res.collect,
        len: res.data.branch_count,
        'help.ope_id': that.data.loadingData.ope_id ? that.data.loadingData.ope_id : wx.getStorageSync('userInfo').id,
        'help.inst_id': e.inst_id,
        'help.act_no': e.act_no,
        'baoming.title': act_info.title,
        'baoming.select_course_type': act_info.select_course_type,
        'baoming.act_no': e.act_no,
        'baoming.inst_id': e.inst_id,
        'baoming.shared_discount': act_info.shared_discount,
        'baoming.firstlevel_profit': act_info.firstlevel_profit,
        'baoming.seclevel_profit': act_info.seclevel_profit,
        'baoming.shared': act_info.enableSharedProfit,
        "start_no": res.data.bargain_info.no ? res.data.bargain_info.no : res.data.group_info.no ? res.data.group_info.no : '',
        'baoming.img': act_info.pic_path,
        'baoming.type': act_info.type,
        "baoming.order_limit": act_info.order_limit,
        "baoming.act_members": JSON.stringify(res.data.act_members),
        'baoming.lable': id + 1,
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
      //   title: id == 0 ? '邀友砍价' : id == 1 ? '拉友拼团' : id == 2 ? '课程试听' : id == 3 ? '限时优惠' : ''
      // })
      //价格判断 id=0是砍价,id=1是拼团,id=2试听,id=3是优惠
      if (id == 0) {
        that.setData({
          'baoming.money': act_info.ori_price / 100,
        })
        // 判断是否开启砍价
        if (res.data.bargain_info.act_no) {
          let bargain_info = res.data.bargain_info;
          if (bargain_info.bargain_list.length) {
            for (let item of bargain_info.bargain_list) {
              item.nickname = decodeURIComponent(item.nickname);
              item.time = item.time.slice(0, 19)
            }
          }
          that.setData({
            bargain_list: bargain_info.bargain_list.slice(0, 3),
            'help.start_no': bargain_info.no
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
            isStrat: true
          })
        }
      } else if (id == 1) {
        that.setData({
          'baoming.money': act_info.ori_price / 100
        })
        //判断好友进去的显示状态
        if (!res.data.group_info.myJoin && !res.data.group_info.myStart) {
          that.setData({
            startPT: true
          })
          return;
        }

        //判断是不是自己进入
        if (res.data.group_info.open_id == wx.getStorageSync('userInfo').open_id) {
          let group_info = res.data.group_info;
          that.setData({
            'baoming.start_no': group_info.no,
            'baoming.type': 5,
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
            'baoming.type': 5
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
            for (let item of res.data.group_info.group_list) {
              item.nickname = decodeURIComponent(item.nickname);
            }
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
      } else if (id == 2) {
        that.setData({
          'baoming.money': act_info.audition_price / 100
        })
      } else if (id == 3) {
        that.setData({
          'baoming.money': act_info.deposit / 100
        })
      }
      that.setData({
        data: res.data
      });
      that.getAgentMessages2();
    })
  },
  getAgentMessages2() {
    let that = this;
    http.postReq("/community/agent/", {
      ope_id: wx.getStorageSync("userInfo").id,
      cmd: "getAgentMessages2"
    }, function (res) {
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
        }, function (res) {

        })
        userInfo.nickname = decodeURIComponent(userInfo.nickname)
        wx.setStorageSync('helper', userInfo);
        that.setData({
          autho: false,
          isauth: true
        })
        that.onLoad(that.data.loadingData);
      },
      fail() {
        wx.hideLoading();
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
    }, function (res) {
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
    timeS = setInterval(function () {
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
      data = this.data.data.groups;
    if (this.data.data.act_info.status !== 1) {
      this.setData({
        'baoming.group_no': data[ind].no,
        'baoming.money': data[ind].price / 100
      });
      wx.navigateTo({
        url: '/pages/bargain/bargain_from/index?data=' + JSON.stringify(this.data.baoming),
      })
    }
  },
  onInput(e) {
    this.setData({
      code: e.detail
    })
  },
  statusClick(e) {
    let status = e.currentTarget.dataset.status,
      that = this,
      {
        union_type,
        pb_code,
        range,
        distance,
        showMsg
      } = this.data.data.act_info;
    if (pb_code == 1) {
      this.setData({
        getGift: true
      })
      return;
    }
    if (union_type == 3) {
      wx.navigateTo({
        url: '/pages/bargain/select/select',
      })
      return;
    }
    if(range<distance){
      Dialog.alert({
        title: '温馨提示',
        message: showMsg,
        zIndex: '999999'
      }).then(() => {});
      return;
    }

    if (status == 0) {
      that.setData({
        'baoming.discount': that.data.data.act_info.shared_discount
      });
      wx.navigateTo({
        url: '/pages/bargain/bargain_from/index?data=' + JSON.stringify(this.data.baoming),
      })
    } else if (status == 1) { //帮他砍价
      let helper = wx.getStorageSync("helper");
      that.setData({
        'help.pic_path': helper.avatarUrl,
        'help.nickname': helper.nickName,
        'help.ope_id': wx.getStorageSync("userInfo").id
      })
      http.postReq("/community/user/", that.data.help, function (res) {
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
  codeConfirm() {
    let {
      union_id,
      no
    } = this.data.data.act_info;
    http.postReq("/community/user/", {
      cmd: 'checkPublishBenefitCode',
      code:this.data.code,
      union_id,
      act_no: no
    }, res => {
      let {
        baoming,
        code
      } = this.data;
      baoming.pb_code = 1;
      baoming.publishBenefitCode = code;
      wx.navigateTo({
        url: '/pages/bargain/bargain_from/index?data=' + JSON.stringify(this.data.baoming),
      })
    })
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
      isFromShare: false
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
  onHide() {
    this.audioCtx.pause();
  },
  // onShareAppMessage(e) {
  //   let that = this,
  //     id = this.data.id,
  //     path = '',
  //     data = null;
  //   if (id == 0) {
  //     data = this.data.data.bargain_info
  //   } else if (id == 1) {
  //     data = this.data.data.group_info
  //   }
  //   if (e.target.dataset.type == 1) { //判断是不是底价购买分享
  //     data = that.data.loadingData;
  //     path = '/pages/bargain/bargain?act_no=' + data.act_no + '&inst_id=' + data.inst_id + '&fromid=' + wx.getStorageSync('userInfo').open_id + '&share=true&source=22' + '&from_id=' + wx.getStorageSync('userInfo').open_id;
  //   } else { //底部分享所需数据
  //     path = '/pages/bargain/bargain?act_no=' + data.act_no + '&inst_id=' + data.inst_id + '&help=' + JSON.stringify(that.data.help) + '&start_no=' + that.data.start_no + '&share=true&source=22' + '&from_id=' + wx.getStorageSync('userInfo').open_id;
  //     if (id == 0 && this.data.helpHim) {
  //       path += '&ope_id=' + that.data.loadingData.ope_id;
  //     }
  //     if (id == 0 && this.data.isLaunch) {
  //       path += '&ope_id=' + wx.getStorageSync('userInfo').id;
  //     }

  //     if (id == 1) {
  //       path += '&ope_id=' + that.data.loadingData.ope_id;
  //     }
  //     //获取活动发起者的open_id
  //     if (!that.data.loadingData.fromid) {
  //       path += '&fromid=' + wx.getStorageSync('userInfo').open_id;
  //     } else {
  //       path += '&fromid=' + that.data.loadingData.fromid;
  //     }
  //   }
  //   return {
  //     title: id == 0 ? '邀友砍价' : id == 1 ? '拉友拼团' : id == 2 ? '课程试听' : id == 3 ? '限时优惠' : '',
  //     path: path,
  //     imageUrl: that.data.rootUrl + that.data.data.act_info.pic_path,
  //   };
  // },
  onShareAppMessage(e) {
    let {
      act_info
    } = this.data.data;
    return Util.sharePage(act_info.title, this.data.rootUrl + act_info.pic_path)
  },
  onUnload() {
    clearInterval(timeS);
  },
})