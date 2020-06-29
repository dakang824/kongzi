Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer:function(newVal,oldVal,change){
        newVal?this.setData({cur:this.data.current}):'';
      }
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

  attached() {
   
  },

  methods: {
    onClose(e) {
      this.setData({show:false})
      this.triggerEvent('closeView');
    },
    onChange(e){
      this.setData({cur:e.detail.current})
    },
  }
})