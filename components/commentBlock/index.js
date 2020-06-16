let http = require('../../common/request.js');
Component({
  properties: {
    list: {
      type: Array,
      value: []
    },
    isDetail:{
      type:Boolean,
      value:false
    },
    courseInfo:{
      type:Object
    }
  },
  data: {
    url: getApp().globalData.serverUrl,
    imgurl: getApp().globalData.imageurl,
    show: false,
    imgs: [],
    current: 0,
    content:''
  },
  methods: {
    goReview(e){
      let {i}=e.currentTarget.dataset,{courseInfo}=this.data;
      wx.navigateTo({
        url: `/pages/praise/CourseCommentDetail/index?d=${encodeURI(JSON.stringify(i))}&courseInfo=${encodeURI(JSON.stringify(courseInfo))}`,
      })
    },
    lookImg(e) {
      let {
        list
      } = this.data, {
        i,
        current
      } = e.currentTarget.dataset;
      let imgs = list[i].pics;
      this.setData({
        imgs,
        show: true,
        current
      })
    },
    dislike(e) {
      let {
        user_id,
        review_id
      } = e.currentTarget.dataset.i;
      this.postLike({
        user_id,
        review_id,
        type: 2
      });
    },
    postLike({
      review_id,
      user_id,
      type
    }) {
      http.postReq("/community/industry/", {
        cmd: 'likeCardCourseReview',
        review_id,
        user_id,
        type
      }, res => {

      })
    },
    like(e) {
      let {
        user_id,
        review_id
      } = e.currentTarget.dataset.i;
      this.postLike({
        user_id,
        review_id,
        type: 1
      });
    },
    onChange(e){
      this.setData({content:e.detail})
    },
    confirm(){
      let {
        user_id,
        review_id
      } = this.data.list[0],{content}=this.data;
      if(content===''){
        wx.showToast({
          title: '请填写评论内容',
          icon:'none'
        })
        return;
      }
      http.postReq("/community/industry/", {
        cmd: 'addReviewAppend',
        review_id,
        user_id,
        content
      }, res => {

      })
    },
  }
})