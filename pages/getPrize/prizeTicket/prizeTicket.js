let APP = getApp();
let http = require('../../../common/request.js');
Page({
  data: {
    dataList:null,
  },
  onLoad: function (options) {
    this.getData();
  },
  getData(){
    let that=this;
    http.postReq("/community/award/",{
      cmd:"getTicketTasks",
      ope_id:wx.getStorageSync("userInfo").id,
    },function(res){
      wx.stopPullDownRefresh()
      that.setData({dataList:res})
    })
  },
  //去获券详情
  goDetail(e){
    let options=e.currentTarget.dataset;
    wx.navigateTo({
      url:"/pages/new/getTicket/getTicket?type="+options.type+"&name="+options.name+"&intro_path="+options.intropath
    })
  },
  //去门票列表
  goTicketsList(){
    wx.navigateTo({
      url:"/pages/getPrize/ticketList/ticketList"
    })
  },
  onPullDownRefresh: function () {
    this.getData();
  },
  onShareAppMessage() {}
})