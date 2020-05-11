let app=getApp();
Page({
  data: {
    showMask:false,
    num:1,
    totalPrice:null,
    payMask:false,
    pay_type:null,//1:余额支付  2：微信支付
    way1:true,
    way2:false,
    imgUrl: app.globalData.imageurl,
  },
  onLoad: function (options) {
   
  },

  onReady: function () {

  },
  onShow: function () {

  },
  //购买
  buy(){
    console.log(":ddd");
    this.setData({
      showMask:true,
    });
  },
  cancelBuy(){
    this.setData({
      showMask:false,
      payMask:false
    })
  },
  pay(){
    this.setData({
      showMask:false,
      payMask:true
    })
  },
  //选择支付方式
  chooseway(e){
    // console.log(e);
    // let options=e.currentTarget.dataset.paytype;
    // console.log(options);
    // if(){
    // }
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {

  }
})