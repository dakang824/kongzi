import Util from '../../utils/util.js';
Component({
  options: {
    addGlobalClass: true,
  },
  externalClasses: ['box-shadow'],
  properties: {
    showMore: {
      type: Boolean,
      value: false,
    },
  },
  data: {

  },
  ready() {
    wx.request({
      url: `${getApp().globalData.serverUrl}data/virus_total.json`,
      success: res => {
        let d=res.data.newslist[0].desc;
        this.setData({
          virusData: d,
          time: Util.getTime(d.modifyTime)
        });
      }
    })
  },
  methods: {

  }
})