let http = require('../../../common/request.js'),
  app = getApp();
import $ from '../../../utils/timeFrom.js';
Page({
  data: {
    url: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
  },
  onLoad(options) {
    let list = [JSON.parse(decodeURI(options.d))];
    for (let key of list[0].appends) {
      key.timeFrom = $.timeFrom(new Date(key.create_time.slice(0, 19).replace(/-/g, "/")).getTime());
    }
    this.setData({
      list,
      ind: options.ind,
      courseInfo: JSON.parse(decodeURI(options.courseInfo)),
    })
  },
  changAppends(e) {
    let pages = getCurrentPages(),prepage = pages[pages.length - 2];
    let {active,list}=prepage.data,{ind}=this.data;
    prepage.setData({
      [`list[${active}].data[${ind}].appends`]:list[active].data[ind].appends.concat(e.detail)
    });
    this.setData({
      [`list[0].appends`]: this.data.list[0].appends.concat(e.detail)
    })
  },
  changeLike(e) {
    this.setData({
      [`list[0].my_like_count`]: e.detail.type == 1 ? 1 : 0,
      [`list[0].my_dislike_count`]: e.detail.type == 2 ? 1 : 0,
    })
  },
  onShareAppMessage() {

  }
})