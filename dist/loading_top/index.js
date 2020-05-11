var time = '';
Component({
  properties: {

  },
  data: {
    isHide: true,
    x: 0
  },
  methods: {
    onClose() {
      // this.data.x == 100 ? this.setData({
      //   isHide: true,
      // }) : '';
    },
    close() {
      // this.setData({
      //   x: 100
      // })
    },
    start() {
      // this.data.isHide ? (this.setData({
      //   x: 70,
      //   isHide: false
      // }), console.log('22222')) : '';
    }
  }
})