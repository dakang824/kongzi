Page({
  data: {
    ...getApp().globalData
  },
  onLoad(e) {
    this.setData({index:Number(e.index),imgs:JSON.parse(e.imgs)})
  },
  first(){
    this.setData({ index: 0 })
  },
  pre(){
    this.setData({ index: this.data.index != 0 ? this.data.index-1:0 })
  },
  next(){
    let ind=this.data.index + 1;
    this.setData({ index: ind >= this.data.imgs.length ? this.data.imgs.length-1:ind})
  },
  last() {
    this.setData({ index: this.data.imgs.length-1 })
  },
  swiperChange(e){
    this.setData({ index:e.detail.current})
  },
  onShareAppMessage() {

  }
})