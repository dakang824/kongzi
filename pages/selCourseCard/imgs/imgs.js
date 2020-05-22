let http = require('../../../common/request.js');
Page({
  data: {
    ...getApp().globalData
  },
  onLoad(options) {
    this.setData({options});
    wx.setNavigationBarTitle({
      title: options.type==1?'课程介绍':'机构介绍',
    })
    this.getData();
  },
  getData(){
    let {type,id}=this.data.options;
    http.postReq("/community/industry/", {
      cmd: type==1?'getCardCoursesIntroPics':'getInst2IntroPics',
      course_id:id
    }, res=> {
      this.setData({img:res.data,type});
    })
  },
  onPullDownRefresh() {

  },
  onShareAppMessage() {

  }
})