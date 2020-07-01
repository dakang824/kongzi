let app = getApp();
import $ from '../../../utils/timeFrom.js';
Page({
  data: {
    url: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
  },
  onLoad(options) {
    let {i,courseInfo}=wx.getStorageSync('comment'),list = i;
    list.appends.forEach(item=>{
      item.timeFrom = $.timeFrom(new Date(item.create_time.slice(0, 19).replace(/-/g, "/")).getTime());
    })
    this.setData({
      list:[list],
      ind: options.ind,
      courseInfo,
    })
  },
  changAppends(e) {
    let pages = getCurrentPages(),prepage = pages[pages.length - 2];
    let {active,list}=prepage.data,{ind}=this.data;
    list[active].data[ind].appends.unshift(e.detail);
    prepage.setData({
      [`list[${active}].data[${ind}].appends`]:list[active].data[ind].appends
    });
    this.setData({
      [`list[0].appends`]: list[active].data[ind].appends
    })
  },
  changeLike(e) {
    this.setData({
      [`list[0].my_like_count`]: e.detail.type == 1 ? 1 : 0,
      [`list[0].my_dislike_count`]: e.detail.type == 2 ? 1 : 0,
    })

    let pages = getCurrentPages(),prepage = pages[pages.length - 2];
    let {active}=prepage.data,{ind}=this.data;
    prepage.setData({
      [`list[${active}].data[${ind}].my_like_count`]:e.detail.type == 1 ? 1 : 0,
      [`list[${active}].data[${ind}].my_dislike_count`]:e.detail.type == 2 ? 1 : 0,
    });
  },
  onShareAppMessage() {

  }
})