Component({
  properties: {
    tabBar:{
      type:Object,
      value: {}
    },
    transparent: {
      type: Boolean,
      value: false
    },
  },
  data: {
    
  },
  methods: {
    jump(e){
      let {url} = e.currentTarget.dataset;
      wx.switchTab({
        url: url,
        complete:res=>{
          // let view = getCurrentPages();
          // getCurrentPages().length - 1
          // console.log(view);
        }
      })
    }
  }
})
