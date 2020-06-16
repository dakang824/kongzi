Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    onClass: {
      type: Boolean,
      value: true
    },
    current:{
      type:Number,
      value:0
    },
    imgs: {
      type: Array,
      value: []
    }
  },
  data: {
    url: getApp().globalData.serverUrl,
  },

  attached() {},

  methods: {
    onClose(e) {
      this.setData({show:false})
    },
    onChange(e){
      this.setData({current:e.detail.current})
    },
  }
})