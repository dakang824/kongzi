Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    list:{
      type:Object,
      value:[],
    }
  },
  
  data: {
    ...getApp().globalData
  },
  methods: {

  }
})
