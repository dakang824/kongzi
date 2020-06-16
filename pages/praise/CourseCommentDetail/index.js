let http = require('../../../common/request.js'),
  app = getApp();
  import $ from '../../../utils/timeFrom.js';
Page({
  data: {
    url: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
  },
  onLoad(options) {
    let list=[JSON.parse(decodeURI(options.d))];
    for(let key of list[0].appends){
      key.timeFrom=$.timeFrom(new Date(key.create_time.slice(0, 19).replace(/-/g, "/")).getTime());
    }
    this.setData({
      list,
      courseInfo: JSON.parse(decodeURI(options.courseInfo)),
    })
  },

  onShareAppMessage() {

  }
})