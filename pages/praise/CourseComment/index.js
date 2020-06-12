Page({
  data: {
    tagsActive:0,
    active: 0,
    tags: [{
      name: '有图',
      value: '120'
    }, {
      name: '有视频',
      value: '120'
    }, {
      name: '有追评',
      value: '120'
    }, {
      name: '有点赞',
      value: '120'
    }, {
      name: '有点怼',
      value: '120'
    }],
    list: [{
      name: '全部',
      value: '123'
    }, {
      name: '好评',
      value: '123'
    }, {
      name: '中评',
      value: '123'
    }, {
      name: '差评',
      value: '123'
    }]
  },
  tagsClick(e){
    this.setData({
      tagsActive: e.currentTarget.dataset.i
    })
  },
  tabSwitch(e) {
    this.setData({
      active: e.currentTarget.dataset.i
    })
  },
  onLoad(options) {

  },
  onShareAppMessage() {

  }
})