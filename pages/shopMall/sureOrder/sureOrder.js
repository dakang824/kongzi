let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
import Util from '../../../utils/util.js';

Page({
  data: {
    serverUrl: APP.globalData.serverUrl, 
    imgStr: "data/communityImage/",
    dataList: null,
    options: null,
    quantity: 1,
    addList: null,
    discountList: null,
    payMethod: true,
    pay_type: 2, //1:余额支付  2：微信支付
    total_price: null, //总价
    total_price1: null,
  },
  onLoad: function(options) {
    let that = this;
    that.setData({
      options: options,
      total_price: Number(options.price) * Number(that.data.quantity) + Number(options.postage),
      total_price1: Number(options.price) * Number(that.data.quantity) + Number(options.postage),
      balance: wx.getStorageSync('userInfo').balance / 100
    })
    that.getMyCoupon();
    that.getMyPostAddress();
  },
  paySuccess(){
    APP.login(this, () => {
      // Util.subscribeMessage({
      //   tmplIds:['QFmfs8NOR6KQ5P9wRsTKdffpi_O8PtCldGN6rqdixvU'],
      //   success:res=>{
          setTimeout(() => {
            wx.navigateBack()
          }, 1300)
          wx.showToast({
            title: "购买成功",
            icon: "none"
          })
    //     }
    //   });
    })
  },
  buy: Util.throttle(function(e) {
    let that = this;
    if (this.data.addList==null){
      wx.showToast({
        title: "请选择收货人",
        icon: "none"
      })
      return;
    }
    if (that.data.discountList == null || that.data.discountList.id == 0) {
      that.setData({
        'discountList.id': 0,
        discount: 0,
      })
    }
    if (that.data.total_price1 == 0 && that.data.pay_type == 2) { //实际付款为0，只能用余额支付
      wx.showToast({
        title: "请选择余额支付",
        icon: "none"
      })
      return
    }
    let {
      discount,
      pay_type,
      total_price,
      quantity
    } = that.data, { price, id } = that.data.options;

    http.postReq("/community/product/", {
      cmd: 'unifiedProductOrder',
      user_coupon_id: that.data.discountList.id, //用户使用的代金券id
      price,//单价
      prod_id: id, //商品id
      discount,//优惠金额  根据代金券计算
      pay_type,//优惠金额  根据代金券计算
      total_price,//总价=单价*购买数量
      quantity,//购买数量
      ...that.data.addList,//收货人信息
    }, res => {
      if (that.data.pay_type == 1) {
        that.paySuccess();
      } else {
        APP.wxpay(res.payParams,()=> {
          that.paySuccess();
        },()=>{
          setTimeout(() => {
            wx.navigateBack()
          }, 1300)
        })
      }
    })
  }),
  //查询优惠券
  getMyCoupon() {
    http.postReq("/community/product/", {
      cmd: 'getMyCoupon',
    }, res=> {
      wx.stopPullDownRefresh();
      this.setData({
        cardList: res.data
      })
    })
  },
  payMethod(e) {
    let paytype = e.currentTarget.dataset.paytype;
    if (paytype == 1) {
      this.setData({
        payMethod: false,
        pay_type: 1,
      })
    } else {
      this.setData({
        payMethod: true,
        pay_type: 2,
      })
    }
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
          total_price: (Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage)).toFixed(2),
          total_price1: (Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage)).toFixed(2),
        })
      } else {
        if (that.data.discountList.type == 1) { //1-代金券 2-折扣券，
          let value = that.data.discountList.value;
          let total_price = Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage);
          this.setData({
            quantity: this.data.quantity,
            total_price: total_price,
            discount: value > total_price ? total_price : value,
            total_price1: total_price > value ? (total_price - value).toFixed(2) : 0
          })
        } else if (that.data.discountList.type == 2) {
          let value = that.data.discountList.value / 100;
          let total_price = Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage);
          let discount = (Number(this.data.options.price) * Number(this.data.quantity) * (1 - value)).toFixed(2);
          this.setData({
            quantity: this.data.quantity,
            total_price: total_price,
            discount: discount,
            total_price1: total_price > discount ? (total_price1 - discount).toFixed(2) : 0,
          })
        } else {
          let balance = that.data.discountList.balance;
          let total_price = that.data.options.price * that.data.quantity + Number(this.data.options.postage);;
          this.setData({
            quantity: this.data.quantity,
            total_price1: total_price > balance ? (total_price - balance).toFixed(2) : 0,
            discount: total_price > balance ? balance : total_price,
            total_price: total_price
          })
        }
      }
    }
  },
  add() {
    let that = this;
    that.data.quantity += 1;
    if (that.data.discountList == null || that.data.discountList.id == 0) { //先判断有没有选择卡券 1-已买
      this.setData({
        quantity: this.data.quantity,
        total_price: (Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage)).toFixed(2),
        total_price1: (Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage)).toFixed(2)
      })
    } else {
      if (that.data.discountList.type == 1) { //1-代金券 2-折扣券，
        let value = that.data.discountList.value;
        let total_price = Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage);
        this.setData({
          quantity: this.data.quantity,
          total_price: total_price,
          discount: value > total_price ? total_price : value,
          total_price1: total_price > value ? (total_price - value).toFixed(2) : 0
        })
      } else if (that.data.discountList.type == 2) {
        let value = that.data.discountList.value / 100;
        let total_price = Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage);
        let discount = (Number(this.data.options.price) * Number(this.data.quantity) * (1 - value)).toFixed(2);
        this.setData({
          quantity: this.data.quantity,
          total_price: total_price,
          discount: discount,
          total_price1: total_price > discount ? (total_price - discount).toFixed(2) : 0
        })
      } else {
        let balance = that.data.discountList.balance;
        let total_price = that.data.options.price * that.data.quantity + Number(this.data.options.postage);;
        this.setData({
          quantity: this.data.quantity,
          total_price1: total_price > balance ? (total_price - balance).toFixed(2) : 0,
          discount: total_price > balance ? balance : total_price,
          total_price: total_price
        })
      }
    }



  },
  goAddress() {
    wx.navigateTo({
      url: "/pages/shopMall/chooseAdd/chooseAdd"
    })
  },
  set_addList(addList) {
    this.setData({
      addList
    })
  },
  set_discount(discountList) {
    console.log(discountList);
    let that = this,total_price = Number(this.data.options.price) * Number(this.data.quantity) + Number(this.data.options.postage);;
    if (discountList.type == 1) { //1-代金券 2-折扣券，
      let value = discountList.value;
      this.setData({
        quantity: this.data.quantity,
        discount: value > total_price ? total_price : value,
        total_price: total_price,
        total_price1: total_price > value ? (total_price - value).toFixed(2) : 0,
      })
    } else if (discountList.type == 2) {
      let value = discountList.value / 100;
      let discount = (that.data.options.price * that.data.quantity * (1 - value)).toFixed(2);
      this.setData({
        quantity: this.data.quantity,
        total_price: total_price,
        discount: discount,
        total_price1: total_price > discount ? (total_price - discount).toFixed(2) : 0,
      })
    } else if (discountList.type == 4){
      let balance = discountList.balance;
      this.setData({
        quantity: this.data.quantity,
        total_price1: total_price > balance ? (total_price - balance).toFixed(2) : 0,
        discount: total_price > balance ? balance : total_price,
        total_price: total_price
      })
    }else{
      this.setData({
        quantity: this.data.quantity,
        total_price1: total_price,
        discount: 0,
        total_price
      })
    }
    this.setData({
      discountList: discountList
    })
  },
  chooseCard() {
    if (this.data.cardList.length == 0) {
      return
    } else {
      if (this.data.discountList == null) {
        wx.navigateTo({
          url: "/pages/shopMall/chooseCard/chooseCard?total_price=" + this.data.total_price
        })
      } else {
        wx.navigateTo({
          url: "/pages/shopMall/chooseCard/chooseCard?id=" + this.data.discountList.id + "&total_price=" + this.data.total_price
        })
      }
    }
  },
  getMyPostAddress() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'getMyPostAddress',
    }, res => {
      if (res.data.length) {
        let arr = [];
        for (let [key, val] of res.data.entries()) {
          val.isdefault ? arr.push(val) : '';
        }
        arr.length ? '' : arr.push(res.data[0]);
        that.setData({
          addList: {
            post_name: arr[0].name,
            post_mobile: arr[0].mobile,
            post_address: arr[0].address
          }
        })
      }
    })
  },
  onPullDownRefresh(){
    this.getMyCoupon();
  },
  onShareAppMessage() {}
})