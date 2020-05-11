import Util from '../../utils/util.js';
Component({
  externalClasses: ['box-shadow'],
  properties: {
    showMore: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    show:false
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
    showLayer(){
      this.setData({ show: !this.data.show})
    },
    cach(){
      this.showLayer();
      wx.navigateTo({
        url: '/pages/cash/cash',
      })
    }
  }
})