let APP = getApp();
let http = require('../../../common/request.js');
Page({
  data: {
    start: false,
    active:2,
    child_name:"",//姓名
    child_phone:"",//收件电话
    child_address:"",//收件地址
    options:null,
    imgUrl: APP.globalData.imageurl
  },
  onLoad: function (options) {
    this.setData({
      options:options,
      platform: APP.globalData.platform
    })
    this.getWriteData();
  },
  getWriteData(){
    let that=this;
    http.postReq("/community/award/", {
      cmd:'getMailAddress',
      draw_id: that.data.options.draw_id
    }, function (res) {
      let d=res.data;
      that.setData({ child_name: d.name, child_phone: d.mobile, child_address:d.address})
    })
  },
  // onSwitch(e){
  //   this.setData({ active: e.currentTarget.dataset.i});
  // },
  //输入姓名
  childName(e){
    let that=this;
    that.setData({
      child_name:e.detail,
    })
  },
  //输入收件电话
  childPhone(e){
    this.setData({
      child_phone:e.detail,
    })
  },
  //收件地址
  childAddress(e){
    this.setData({
      child_address:e.detail
    })
  },
  sure(){
    let that=this;
    if(that.data.child_name==""){
      wx.showToast({
        title:"请输入收件人姓名",
        icon:"none"
      })
      return
    }
    if(that.data.child_phone==""){
      wx.showToast({
        title:"请输入联系电话",
        icon:"none"
      })
      return
    }
    if(that.data.child_address==""){
      wx.showToast({
        title:"请输入收件地址",
        icon:"none"
      })
      return
    }

    http.postReq("/community/award/",{
      cmd: that.data.options.is_get == 1 ?'modifyMailAddress':that.data.options.nua_id ?'getAwardNewUserTaskAward':'getMyAwardPrize',
      award_id:that.data.options.award_id,
      draw_id:that.data.options.draw_id,
      name:that.data.child_name,
      mobile:that.data.child_phone,
      address:that.data.child_address,
      nua_id: that.data.options.nua_id
    },function(res){
      wx.navigateBack();
    })
  },
  onShareAppMessage(){}
})