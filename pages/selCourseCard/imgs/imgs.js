let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    ...getApp().globalData,
    show:false,
  },
  onLoad(options) {
    Loading.start();
    this.setData({options});
    wx.setNavigationBarTitle({
      title: options.type==1?'课程介绍':options.type==3?'福利说明':'机构介绍',
    })
    this.getData();
  },
  getData(){
    let {type,id}=this.data.options;
    http.postReq("/community/industry/", {
      cmd: type==1?'getCardCoursesIntroPics':type==3?'getCourseCardIntroImages':'getInst2IntroPics',
      course_id:id
    }, res=> {
      this.setData({img:res.data,type,show:true});
      Loading.close();
    })
  },
  onPullDownRefresh() {

  },
  onShareAppMessage() {

  }
})