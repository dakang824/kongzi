let http = require('../../common/request.js'),app=getApp();
Page({
  data: {
    list:[],
    imgUrl: app.globalData.serverUrl,
  },
  onLoad: function(options) {
    let that=this;
    http.postReq("/community/user/", {
      cmd: 'getMySharedProfitV2'
    }, function(res) {
      for(let item of res.data){
        let num1 = item.up1_profit ? parseInt(item.up1_profit) : 0, num2 = item.up2_profit ? parseInt(item.up2_profit) : 0;
        let num3 = item.up1_count ? parseInt(item.up1_count) : 0, num4 = item.up2_count ? parseInt(item.up2_count) : 0;
        item.totalmoney = (num1+ num2)/100;
        item.gx=num3+num4;
        item.actTime=item.start_time.slice(0,10)+' ~ '+item.end_time.slice(0,10);
      }
      that.setData({list:res.data})
    })
  },
  onShareAppMessage(){}
})