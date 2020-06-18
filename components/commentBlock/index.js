let http = require('../../common/request.js'),utils = require('../../utils/util.js');
import $ from '../../utils/timeFrom.js';
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
    },
    noData:{
      type:Boolean,
      value:false
    }
  },
  data: {
    url: getApp().globalData.serverUrl,
    imgurl: getApp().globalData.imageurl,
    show: false,
    imgs: [],
    current: 0,
    content:'',
    keyBoardHeight: ''
  },
  methods: {
    focus(e){
      this.setData({
        keyBoardHeight: e.detail.height
      })
    }, 
    blur(){
      this.setData({
        keyBoardHeight: ''
      })
    },
    goReview(e){
      let {i,ind}=e.currentTarget.dataset,{courseInfo}=this.data;
      wx.navigateTo({
        url: `/pages/praise/CourseCommentDetail/index?ind=${ind}&d=${encodeURI(JSON.stringify(i))}&courseInfo=${encodeURI(JSON.stringify(courseInfo))}`,
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
      } = e.currentTarget.dataset.i,index=e.currentTarget.dataset.ind;
      this.postLike({
        user_id,
        review_id,
        type: 2,
        index
      });
    },
    postLike({
      review_id,
      user_id,
      type,
      index
    }) {
      http.postReq("/community/industry/", {
        cmd: 'likeCardCourseReview',
        review_id,
        user_id,
        type
      }, res => {
        this.triggerEvent('changeLike',{type,index});
      })
    },
    like(e) {
      let {
        user_id,
        review_id
      } = e.currentTarget.dataset.i,index=e.currentTarget.dataset.ind;;
      this.postLike({
        user_id,
        review_id,
        type: 1,
        index
      });
    },
    onChange(e){
      this.setData({content:e.detail.value})
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
        let {pic_path,nickname}=wx.getStorageSync('userInfo'),t=utils.getTime(new Date().getTime());
        this.triggerEvent('changAppends',{timeFrom:$.timeFrom(new Date(t.replace(/-/g, "/")).getTime()),content,nickname,pic_path,create_time:t});
        this.setData({content:''})
      })
    },
  }
})