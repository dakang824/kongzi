let http = require('../../../common/request.js'),
  app = getApp();
import Dialog from '../../../dist/dialog/dialog';
import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed: true,
    userInfo: '',
    url: app.globalData.serverUrl,
    tabBar: app.globalData.tabBar,
    show: false,
    logistics: false,
    payRadio: '1',
    payType: false,
    status: '',
    page_no: 1,
    page_size:10,
    typePage: 1,
    typePage1: 1,
    typePage2: 1,
    typePage3: 1,
    list: [],
    arr: [],
    arr1: [],
    arr2: [],
    steps: [],
    noData:false,
    noData1:false,
    noData2:false,
    noData3:false,
  },
  onLoad(){
    Util.editTabbar();
    this.setData({ope_id:wx.getStorageSync('userInfo').id})
  },
  updateAddress(e){
    let { post_name, id, post_mobile, post_address, post_status} = e.currentTarget.dataset.i;
    post_status==1?wx.navigateTo({
      url: `/pages/shopMall/add/add?type=3&name=${post_name}&id=${id}&mobile=${post_mobile}&address=${post_address}&isdefault=1`,
    }) : Dialog.alert({
      title: '温馨提示',
      message: '订单已邮寄，无法修改地址。',
    }).then(() => { });
  },
  copy() {
    wx.setClipboardData({
      data: this.data.no,
    })
  },
  viewLog(e) {
    http.postReq("/community/order/", {
      cmd: 'getTrackingInfo',
      order_id: e.currentTarget.dataset.i
    }, res => {
      let d = JSON.parse(res.tracking),
        {
          list,
          company,
          no
        } = d.result,
        steps = [];
      for (let key of list) {
        steps.push({
          text: key.datetime,
          desc: key.remark
        })
      }
      steps.reverse();
      this.setData({
        logistics: !this.data.logistics,
        steps,
        company,
        no
      })
    })
  },
  errorImg(e) {
    let {
      list
    } = this.data;
    list[e.target.dataset.i].pic_path = '';
    this.setData({
      list
    });
  },
  onChange1(event) {
    this.setData({
      payRadio: event.detail
    });
  },
  onChange(e) {
    let status = e.detail.index == 0 ? '' : e.detail.index - 1;
    this.setData({
      status,
      page_no: status === '' ? this.data.typePage : status === 0 ? this.data.typePage1 : status == 1 ? this.data.typePage2 : status == 2 ? this.data.typePage3 : ''
    });
    this.getData();
  },
  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset;
    this.setData({
      'payRadio': name
    });
  },
  selCourse(e) {
    let obj = e.currentTarget.dataset.obj;
    wx.navigateTo({
      url: `/pages/bargain/courses/courses?union_id=${obj.union_id}&order_no=${obj.no}&act_no=${obj.act_no}&age=${obj.age}`
    })
  },
  share(e) {
    this.setData({
      shareData: e.target.dataset.data,
    })
    let data = this.data.shareData;
    data.type == 5 ? data.type = 4 : '';
    data.inst_id = data.union_id;
    wx.navigateTo({
      url: `/pages/bargain/rebate/rebate?data=${JSON.stringify(data)}`,
    })
  },
  cancelMyOrders(e) {
    let that = this,
      ind = e.currentTarget.dataset.ind;
    Dialog.confirm({
      title: '温馨提示',
      message: '订单尚未完成付款您确定要取消订单吗 ?'
    }).then(() => {
      http.postReq("/community/order/", {
        cmd: 'cancelMyOrders',
        id: e.currentTarget.dataset.id
      }, res => {
        let status = that.data.status,
          {
            list,
            arr
          } = that.data;
        if (status === '') {
          that.data.list[ind].status = 2;
          that.setData({
            list
          })
        } else if (status === 0) {
          that.data.arr[ind].status = 2;
          that.setData({
            arr
          })
        }
      })
    }).catch(() => {});
  },
  showPayType(e) {
    this.setData({
      payType: true,
      t: e.currentTarget.dataset,
    })
  },
  rePayMyOrders: Util.throttle(function(e) {
    let that = this,
      {
        t,
        status,
        ind
      } = this.data,
      pay_type = that.data.payRadio;

    http.postReq("/community/order/", {
      cmd: 'rePayMyOrdersV21',
      order_id: t.id,
      trade_no: t.no,
      pay_type: pay_type
    }, res => {
      if (pay_type == 1) {
        app.wxpay(res.payParams, () => {
          let {
            list,
            arr
          } = that.data;
          if (status === '') {
            that.data.list[ind].status = 1;
            that.setData({
              list
            })
          } else if (status === 0) {
            that.data.arr[ind].status = 1;
            that.setData({
              arr
            })
          }
        })
      } else {
        that.balancePay(res.trade_no);
      }
    })
  }),
  paySuccess() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getOrderTicketTasks',
    }, res => {
      res.tasks[1].each_tickets != 0 ? Dialog.alert({
        title: '温馨提示',
        message: `恭喜您，获得${res.tasks[1].each_tickets}张抽奖券。赶快去抽奖吧！`,
        confirmButtonText: '我知道了',
      }).then(() => {
        // if (that.data.t.d.enableSharedProfit){

        // }
      }) : '';
    })
  },
  balancePay(trade_no) {
    let that = this,
      status = this.data.status,
      ind = this.data.t.ind;
    http.postReq("/community/user/", {
      cmd: 'payOrderWithBalance',
      trade_no: trade_no
    }, res => {
      app.login(this, () => {
        if (res.status == 1) {
          if (status === '') {
            that.data.list[ind].status = 1;
            that.setData({
              list: that.data.list
            })
          } else if (status === 0) {
            that.data.arr[ind].status = 1;
            that.setData({
              arr: that.data.arr
            })
          }
        };
      })
    })
  },
  transferMyOrder(e) {
    this.setData({
      id: e.currentTarget.dataset.id,
      show: true
    })
  },
  getData() {
    let that = this,
      {
        page_no,
        page_size,
        status
      } = this.data;
    http.postReq("/community/order/", {
      cmd: 'queryMyOrdersV21',
      page_size,
      page_no,
      status
    }, res => {
      wx.stopPullDownRefresh();
      if (res.data.records.length) {
        let data = res.data.records,
          status = that.data.status;
        for (let item of data) {
          // item.t = (new Date(item.create_time.replace(new RegExp("-", "gm"), "/"))).getTime()
          delete item.nickname;
        }
        // data.sort(that.compare('t')).reverse();
        status === '' ? that.setData({
            list: that.data.list.concat(data),
            typePage: that.data.typePage + 1,
            noData:data.length<page_size,
          }) :
          status === 0 ? that.setData({
            arr: that.data.arr.concat(data),
            typePage1: that.data.typePage1 + 1,
            noData1:data.length<page_size,
          }) :
          status == 1 ? that.setData({
            arr1: that.data.arr1.concat(data),
            typePage2: that.data.typePage2 + 1,
            noData2:data.length<page_size,
          }) :
          status == 2 ? that.setData({
            arr2: that.data.arr2.concat(data),
            typePage3: that.data.typePage3 + 1,
            noData3:data.length<page_size,
          }) : '';
      }
    })
  },
  compare(property) {
    return (a, b) => {
      return a[property] - b[property];
    }
  },
  onShow: function() {
    this.setData({
      list: [],
      arr: [],
      arr1: [],
      arr2: [],
      page_no: 1,
      typePage: 1,
      typePage1: 1,
      typePage2: 1,
      typePage3: 1,
      balance: wx.getStorageSync('userInfo').balance
    })
    this.getData();
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  onPullDownRefresh() {
    let status = this.data.status,
      that = this;
    status === '' ? that.setData({
        list: [],
        typePage: 1
      }) :
      status === 0 ? that.setData({
        arr: [],
        typePage1: 1
      }) :
      status == 1 ? that.setData({
        arr1: [],
        typePage2: 1
      }) :
      status == 2 ? that.setData({
        arr2: [],
        typePage3: 1
      }) : '';
    this.setData({
      page_no: 1
    });
    this.getData();
  },
  onClose() {
    this.setData({
      payType: false,
      logistics: false
    })
  },
  cancelTransfer(e) {
    let {
      id,
      ind
    } = e.currentTarget.dataset,
      that = this;
    Dialog.confirm({
      title: '温馨提示',
      message: '是否要取消转赠'
    }).then(() => {
      http.postReq("/community/order/", {
        cmd: 'cancelTransferOrder',
        id
      }, res => {
        let status = that.data.status;
        if (status === '') {
          that.data.list[ind].status = 1;
          that.setData({
            list: that.data.list
          })
        } else if (status === 1) {
          that.data.arr1[ind].status = 1;
          that.setData({
            arr1: that.data.arr1
          })
        }
      })
    }).catch(() => {

    });
  },
  onTabItemTap() {
    app.globalData.disableTab ? '' : wx.switchTab({
      url: '/pages/new/index/index',
    })
  },
  onReachBottom() {
    let status = this.data.status;
    this.setData({
      page_no: status === '' ? this.data.typePage : status === 0 ? this.data.typePage1 : status == 1 ? this.data.typePage2 : status == 2 ? this.data.typePage3 : ''
    })
    this.getData();
  },
  onShareAppMessage(e) {
    let that = this,
      list = this.data.list,
      type = '',
      d = wx.getStorageSync('userInfo'),
      data = '',
      img = '',
      status = this.data.status;
    if (e.from == 'button') {
      http.postReq("/community/order/", {
        cmd: 'transferMyOrder',
        id: that.data.id
      }, res => {})
      for (let key of list) {
        if (key.id == that.data.id) {
          data = JSON.stringify(key);
          type = key.type == 1 || key.type == 5 ? '一份课程' : key.type == 2 || key.type == 6 ? '一张门票' : key.type == 3 ? '一张卡券' : '';
          img = that.data.url + (key.list_pic || key.pic_path);
          break;
        }
      }
      console.log(`/pages/order/share/share?name=${encodeURIComponent(d.nickname)}&pic_path=${d.pic_path}&id=${that.data.id}&d=${data}&from_id=${d.id}`);
      return {
        title: `${d.nickname}分享给你${type},请注意查收`,
        path: `/pages/order/share/share?name=${encodeURIComponent(d.nickname)}&pic_path=${d.pic_path}&id=${that.data.id}&d=${data}&from_id=${d.id}`,
        imageUrl: app.globalData.imageurl + 'sharepage.jpg',
      };
    } else {
      return {
        path: `/pages/order/index/index?from_id=${d.id}`,
      };
    }
  }
})