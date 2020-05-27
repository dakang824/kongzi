var time = '';
Component({
  properties: {

  },
  data: {
    isHide: false,
    x: 0
  },
  methods: {
    close() {
      setTimeout(()=>{
        this.setData({
          isHide: true,
        })
      },500)
    },
    start() {
      this.setData({
        isHide: false,
      })
    }
  }
})