Component({
  options: {
    multipleSlots: true 
  },
  properties: {
    courseInfo:{
      type:Object
    },
    imgUrl:{
      type:String
    },
    hideCourse:{
      type:Boolean,
      value:true
    },
    showShare:{
      type:Boolean,
      value:false
    },
  },
  data: {
    url: getApp().globalData.serverUrl,
  },
  methods: {

  }
})
