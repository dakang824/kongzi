let APP = getApp(),http = require('../../../common/request.js');
import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed:true,
    showMask: false,
    quantity: 1,
    total_price: null,
    radio: '2',
    id: null,
    dataList: null,
    serverUrl: APP.globalData.serverUrl,
    fun_branches: null,
    cardList: null,
    total_price: null,
    total_price1: null,
    showMore: false,
    branchesList: [],
    postData: {
      name: '',
      mobile: '',
    }
  },
  onLoad(options) {
    this.setData({
      id: options.id,
    })
    this.getFunTicketDetail();
    this.getMyCoupon();
    this.getAgentMessages2();
  },
  onInput(e) {
    let postData = this.data.postData;
    console.log(e);
    postData[e.currentTarget.dataset.i] = e.detail;
    this.setData({
      postData: postData
    })
  },
  init() {
    this.setData({
      total_price1: null,
      total_price: null,
      discountList: null,
      radio: "2",
      quantity: 1,
    })
  },
  getFunTicketDetail() {
    let that = this;
    http.postReq("/community/coupon/", {
      cmd: 'getFunTicketDetail',
      fun_id: that.data.id,
      ...wx.getStorageSync("position")
    }, res => {
      wx.stopPullDownRefresh();
      res.fun_info.seconds = that.timestamp(res.fun_info.end_time);
      for (let value of res.fun_branches) {
        value.distance = (Number(value.distance) / 1000).toFixed(1);
      }
      let { post_name = '', post_mobile = '' } = 'contact' in res &&res.contact[0] ? res.contact[0]:'',t={name:post_name,mobile:post_mobile};

      that.setData({
        dataList: res.fun_info,
        fun_branches: res.fun_branches,
        branchesList: res.fun_branches.slice(0, 3),
        total_price: that.data.quantity * res.fun_info.price,
        total_price1: that.data.quantity * res.fun_info.price,
        agent: res.agent,
        postData: t,
        contact: t,
        balance: res.fun_info.balance
      })
    })
  },
  getAgentMessages2() {
    let that = this;
    http.postReq("/community/agent/", {
      cmd: "getAgentMessages2"
    }, res => {
      that.setData({
        messageList: res.data
      })
    })
  },
  seeMore() {
    this.setData({
      showMore: !this.data.showMore
    })
  },
  goLuckyDetail() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'getAwardDrawFromGoods',
      prod_id: that.data.id,
      type: 2, //type:""//2:玩乐  3：代金券美食  15:好物
    }, function(res) {
      wx.navigateTo({
        url: "/pages/new/luckyDetail/luckyDetail?award_id=" + res.data.award_id + "&draw_id=" + res.data.draw_id
      })
    })
  },
  pay: Util.throttle(function(e) {
    let that = this,
      d = this.data.postData;
    if (that.data.discountList == null || that.data.discountList.id == 0) {
      that.setData({
        'discountList.id': 0,
        discount: 0,
      })
    }
    if (that.data.total_price == 0 && that.data.radio == 2) { //实际付款为0，只能用余额支付
      wx.showToast({
        title: "请选择余额支付",
        icon: "none"
      })
      return
    }
    if (d.name === '') {
      wx.showToast({
        title: "请填写姓名",
        icon: "none"
      })
      return
    }
    if (d.mobile === '') {
      wx.showToast({
        title: "请填写手机号",
        icon: "none"
      })
      return
    }
    let {
      quantity,
      discount,
      id,
      radio
    } = that.data
    http.postReq("/community/coupon/", {
      cmd: "unifiedFunTicketOrder",
      fun_id: id,
      pay_type: radio, //1:余额支付  2：微信支付
      price: that.data.dataList.price,
      total_price: that.data.total_price1.toFixed(2),
      user_coupon_id: that.data.discountList.id, //用户使用的代金券id
      discount, //优惠金额  根据代金券计算
      quantity, //购买数量
      ...d
    }, res => {
      if (that.data.radio == 2) {
        APP.wxpay(res.payParams, () => {
          APP.login(this, () => {
            wx.showToast({
              title: "购买成功",
              icon: "none"
            })
            that.getFunTicketDetail();
            that.getMyCoupon();
            that.init();
          })
        });
      } else {
        APP.login(this, () => {
          wx.showToast({
            title: "购买成功",
            icon: "none"
          })
          that.getFunTicketDetail();
          that.getMyCoupon();
          that.init();
        })
      }
      that.setData({
        showMask: false,
      })
    })
  }),
  getMyCoupon() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'getMyCoupon',
    }, res => {
      wx.stopPullDownRefresh();
      that.setData({
        cardList: res.data
      })
    })
  },
  reduce() {
    let that = this;
    if (this.data.quantity == 1) {
      return
    } else {
      that.data.quantity -= 1;
      if (that.data.discountList == null || that.data.discountList.id == 0) { //先判断有没有选择卡券 1-已买

        this.setData({
          quantity: this.data.quantity,
          total_price: Number(this.data.dataList.price) * Number(this.data.quantity),
          total_price1: Number(this.data.dataList.price) * Number(this.data.quantity)
        })
        console.log(this.data.quantity);
        console.log(this.data.total_price);
        console.log(this.data.total_price1);
      } else {
        if (that.data.discountList.type == 1) { //1-代金券 2-折扣券，
          let value = that.data.discountList.value;
          let total_price = Number(this.data.dataList.price) * Number(this.data.quantity);
          this.setData({
            quantity: this.data.quantity,
            total_price: total_price > value ? total_price - value : 0,
            discount: value > total_price ? total_price : value,
            total_price1: Number(this.data.dataList.price) * Number(this.data.quantity)
          })
        } else if (that.data.discountList.type == 2) {
          let value = that.data.discountList.value / 100;
          let total_price = (Number(this.data.dataList.price) * Number(this.data.quantity) * value).toFixed(2);
          let discount = (Number(this.data.dataList.price) * Number(this.data.quantity) * (1 - value)).toFixed(2);
          this.setData({
            quantity: this.data.quantity,
            total_price: total_price,
            discount: discount,
            total_price1: Number(this.data.dataList.price) * Number(this.data.quantity)
          })
        } else {
          let balance = that.data.discountList.balance;
          let total_price = that.data.dataList.price * that.data.quantity;
          // console.log(balance,total_price);
          this.setData({
            quantity: this.data.quantity,
            total_price: total_price > balance ? (total_price - balance).toFixed(2) : 0,
            discount: total_price > balance ? balance : total_price,
            total_price1: that.data.dataList.price * that.data.quantity
          })
        }
      }
    }
  },
  add() {
    let that = this;
    this.data.quantity++;
    if (that.data.discountList == null || that.data.discountList.id == 0) { //先判断有没有选择卡券 1-已买

      this.setData({
        quantity: this.data.quantity,
        total_price: Number(this.data.dataList.price) * Number(this.data.quantity),
        total_price1: Number(this.data.dataList.price) * Number(this.data.quantity)
      })
      console.log(this.data.quantity);
      console.log(this.data.total_price);
      console.log(this.data.total_price1);
    } else {
      if (that.data.discountList.type == 1) { //1-代金券 2-折扣券，
        let value = that.data.discountList.value;
        let total_price = Number(this.data.dataList.price) * Number(this.data.quantity);
        this.setData({
          quantity: this.data.quantity,
          total_price: total_price > value ? total_price - value : 0,
          discount: value > total_price ? total_price : value,
          total_price1: Number(this.data.dataList.price) * Number(this.data.quantity)
        })
      } else if (that.data.discountList.type == 2) {

        let value = that.data.discountList.value / 100;
        let total_price = (Number(this.data.dataList.price) * Number(this.data.quantity) * value).toFixed(2);
        let discount = (Number(this.data.dataList.price) * Number(this.data.quantity) * (1 - value)).toFixed(2);
        this.setData({
          quantity: this.data.quantity,
          total_price: total_price,
          discount: discount,
          total_price1: Number(this.data.dataList.price) * Number(this.data.quantity),
        })
      } else {
        let balance = that.data.discountList.balance;
        let total_price = that.data.dataList.price * that.data.quantity;
        this.setData({
          quantity: this.data.quantity,
          total_price: total_price > balance ? (total_price - balance).toFixed(2) : 0,
          discount: total_price > balance ? balance : total_price,
          total_price1: that.data.dataList.price * that.data.quantity
        })
      }
    }

  },
  onClick(e) {
    let name = e.currentTarget.dataset.name;
    this.setData({
      radio: name
    });
  },
  preventTouchMove() {},
  onChange1(e) {
    this.setData({
      timeData: e.detail
    });
    let d = e.detail;
    d.days == 0 && d.hours == 0 && d.minutes == 0 && d.seconds == 0 ? this.getFunTicketDetail() : '';
  },
  cancelBuy() {
    this.setData({
      showMask: false
    })
  },
  goBuy() {
    if (this.data.dataList.status == 2 || this.data.dataList.stock == 0) {
      wx.showToast({
        title: "该商品已售罄",
        icon: "none"
      })
      return
    } else {

      this.setData({
        showMask: true
      })
    }
  },
  chooseCard() {
    // if(this.data.cardList.length==0){
    //   return
    // }else{

    //   wx.navigateTo({
    //     url:"/pages/shopMall/chooseCard/chooseCard"
    //   })
    // }
    if (this.data.cardList.length == 0) {
      return
    } else {
      if (this.data.discountList == null) {
        wx.navigateTo({
          url: "/pages/shopMall/chooseCard/chooseCard?total_price=" + this.data.total_price1
        })
      } else {
        wx.navigateTo({
          url: "/pages/shopMall/chooseCard/chooseCard?id=" + this.data.discountList.id + "&total_price=" + this.data.total_price1
        })
      }
    }
  },
  set_discount(discountList) {
    console.log(discountList);
    let that = this,total_price = that.data.dataList.price * that.data.quantity;
    if (discountList.type == 1) { //1-代金券 2-折扣券，
      let value = discountList.value;
      that.setData({
        total_price: total_price > value ? total_price - value : 0,
        discount: value > total_price ? total_price : value,
        total_price1: that.data.dataList.price * that.data.quantity
      })

    } else if (discountList.type == 2) {
      let value = discountList.value / 100;
      let discount = (that.data.dataList.price * that.data.quantity * (1 - value)).toFixed(2);
      this.setData({
        total_price: total_price > discount ? (total_price - discount).toFixed(2) : 0,
        discount: discount,
        total_price1: that.data.dataList.price * that.data.quantity
      })
    } else if (discountList.type == 4){
      let balance = discountList.balance;
      this.setData({
        total_price: total_price > balance ? (total_price - balance).toFixed(2) : 0,
        discount: total_price > balance ? balance : total_price,
        total_price1: that.data.dataList.price * that.data.quantity
      })
    }else{
      this.setData({
        total_price,
        discount: 0,
        total_price1: total_price
      })
    }
    this.setData({
      discountList: discountList
    })

  },
  openMap(e) {
    let options = e.currentTarget.dataset;
    wx.openLocation({ //​使用微信内置地图查看位置。
      latitude: options.latitude, //要去的纬度-地址
      longitude: options.longitude, //要去的经度-地址
      name: options.name,
      address: options.address
    })
  },
  call(e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  //日期转时间戳--得到多少秒
  timestamp(time) {
    let timestamp = new Date().getTime();
    let date = new Date(time.slice(0, 19).replace(/-/g, '/')).getTime() - timestamp;
    return date
  },
  onPullDownRefresh: function() {
    let that = this;
    if (that.data.showMask) {
      that.getMyCoupon();
    } else {
      that.getFunTicketDetail();
      that.getMyCoupon();
      that.getAgentMessages2();
    }
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