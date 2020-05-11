let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
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
    coupon_branches: [],
    cardList: null,
    discountList: null,
    total_price: null, //总价
    total_price1: null,
    showMore: false,
    branchesList: [],
    postData: {
      name: '',
      mobile: '',
    }
  },
  onInput(e) {
    let postData = this.data.postData;
    postData[e.currentTarget.dataset.i] = e.detail
    this.setData({
      postData: postData
    })
  },
  onLoad(options) {
    this.setData({
      id: options.id,
    })
    if (options.type == "") {
      wx.setNavigationBarTitle({
        title: '卡券详情'
      })
      this.setData({
        type: ''
      })
    } else {
      wx.setNavigationBarTitle({
        title: '美食详情'
      })
      this.setData({
        type: 3
      })
    }
    this.getCouponDetail();
    this.getMyCoupon();
    this.getAgentMessages2();
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
  getCouponDetail() {
    let that = this;
    http.postReq("/community/coupon/", {
      cmd: 'getCouponDetail',
      coupon_id: that.data.id,
      ...wx.getStorageSync("position")
    }, res=> {
      wx.stopPullDownRefresh();
      res.coupon_info.seconds = that.timestamp(res.coupon_info.end_time);
      for (let value of res.coupon_branches) {
        value.distance = (Number(value.distance) / 1000).toFixed(1);
      }
      let { post_name = '', post_mobile = '' } = 'contact' in res && res.contact[0] ? res.contact[0]:'', t = { name: post_name, mobile: post_mobile };
      that.setData({
        dataList: res.coupon_info,
        coupon_branches: res.coupon_branches,
        branchesList: res.coupon_branches.slice(0, 3),
        total_price: that.data.quantity * res.coupon_info.price,
        total_price1: that.data.quantity * res.coupon_info.price,
        agent: res.agent,
        postData: t,
        contact: t,
        link:res.link,
        opeid:wx.getStorageSync('userInfo').id
      })
    })
  },
  getAgentMessages2() {
    let that = this;
    http.postReq("/community/agent/", {
      cmd: "getAgentMessages2"
    }, res=> {
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
  pay: Util.throttle(function(e) {
    let that = this,
      d = that.data.postData;
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
    http.postReq("/community/coupon/", {
      cmd: "unifiedCouponOrder",
      coupon_id: that.data.id,
      quantity: that.data.quantity, //购买数量
      pay_type: that.data.radio, //1:余额支付  2：微信支付
      price: that.data.dataList.price,
      total_price: that.data.total_price1,
      user_coupon_id: that.data.discountList.id, //用户使用的代金券id
      discount: that.data.discount, //优惠金额  根据代金券计算
      ...d
    }, res => {
      if (that.data.radio == 2) {
        APP.wxpay(res.payParams, ()=> {
          APP.login(this, ()=> {
            wx.showToast({
              title: "购买成功",
              icon: "none"
            });
            that.getMyCoupon();
            that.init();
            that.getCouponDetail();
          })
        });
      } else {
        APP.login(this, ()=> {
          wx.showToast({
            title: "购买成功",
            icon: "none"
          })
          that.getMyCoupon();
          that.init();
          that.getCouponDetail();
        })
      }
      that.setData({
        showMask: false,
      })
    })
  }),
  goLuckyDetail() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'getAwardDrawFromGoods',
      prod_id: that.data.id,
      type: 3, //type:""//2:玩乐  3：代金券美食  15:好物
    }, res=> {
      wx.navigateTo({
        url: "/pages/new/luckyDetail/luckyDetail?award_id=" + res.data.award_id + "&draw_id=" + res.data.draw_id
      })
    })
  },
  //查询优惠券
  getMyCoupon() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'getMyCoupon',
    }, res=> {
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
          total_price1: Number(this.data.dataList.price) * Number(this.data.quantity),
        })
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
        total_price1: Number(this.data.dataList.price) * Number(this.data.quantity),
      })
    } else {
      if (that.data.discountList.type == 1) { //1-代金券 2-折扣券，
        let value = that.data.discountList.value;
        let total_price = Number(this.data.dataList.price) * Number(this.data.quantity);
        this.setData({
          quantity: this.data.quantity,
          total_price: total_price > value ? total_price - value : 0,
          discount: value > total_price ? total_price : value,
          total_price1: Number(this.data.dataList.price) * Number(this.data.quantity),
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
  preventTouchMove() {},
  onClick(e) {
    let name = e.currentTarget.dataset.name;
    this.setData({
      radio: name
    });
  },
  onChange(event) {
    this.setData({
      radio: event.detail
    });
  },
  onChange1(e) {
    this.setData({
      timeData: e.detail
    });
    let d = e.detail;
    d.days == 0 && d.hours == 0 && d.minutes == 0 && d.seconds == 0 ? this.getCouponDetail() : '';
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
    let that = this;
    console.log(discountList);
    if (discountList.type == 1) { //1-代金券 2-折扣券，4-购物卡
      let value = discountList.value;
      let total_price = that.data.dataList.price * that.data.quantity;
      that.setData({
        total_price: total_price > value ? total_price - value : 0,
        discount: value > total_price ? total_price : value,
        total_price1: that.data.dataList.price * that.data.quantity
      })
    } else if (discountList.type == 2) {
      let value = discountList.value / 100;
      let total_price = that.data.dataList.price * that.data.quantity;
      let discount = (that.data.dataList.price * that.data.quantity * (1 - value)).toFixed(2);
      this.setData({
        total_price: total_price > discount ? (total_price - discount).toFixed(2) : 0,
        discount: discount,
        total_price1: that.data.dataList.price * that.data.quantity
      })
    } else if (discountList.type == 4){
      let balance = discountList.balance;
      let total_price = that.data.dataList.price * that.data.quantity;
      this.setData({
        total_price: total_price > balance ? (total_price - balance).toFixed(2) : 0,
        discount: total_price > balance ? balance : total_price,
        total_price1: that.data.dataList.price * that.data.quantity
      })
    }else{
      let total_price = that.data.dataList.price * that.data.quantity;
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

      that.getCouponDetail();
      that.getMyCoupon();
      that.getAgentMessages2();
    }
  },
  showShare() {
    this.setData({
      shareImg: true
    })
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