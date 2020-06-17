let http = require('../../../common/request.js'),
  app = getApp();
  import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    tagsActive: 0,
    active: 0,
    page_size:10,
    url: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
    tags: [{
      name: '有图',
      value: '0'
    }, {
      name: '有视频',
      value: '0'
    }, {
      name: '有追评',
      value: '0'
    }, {
      name: '有点赞',
      value: '0'
    }, {
      name: '有点怼',
      value: '0'
    }],
    list: [{
      name: '全部',
      value: '0',
      data: [],
      page_no: 1,
      noData:true,
    }, {
      name: '好评',
      value: '0',
      data: [],
      page_no: 1,
      noData:true,
    }, {
      name: '中评',
      value: '0',
      data: [],
      page_no: 1,
      noData:true,
    }, {
      name: '差评',
      value: '0',
      data: [],
      page_no: 1,
      noData:true,
    }]
  },
  changeLike(e){
    let {active}=this.data;
    this.setData({
      [`list[${active}].data[${e.detail.index}].my_like_count`]:e.detail.type==1?1:0,
      [`list[${active}].data[${e.detail.index}].my_dislike_count`]:e.detail.type==2?1:0,
    })
  },
  tagsClick(e) {
    this.setData({
      tagsActive: e.currentTarget.dataset.i
    })
  },
  tabSwitch(e) {
    let {i}=e.currentTarget.dataset;
    this.setData({
      active:i
    })
    let {list,active}=this.data;
    list[active].noData?(i==0?this.getAllData():this.getData()):'';
  },
  onLoad(options) {
    this.setData({
      course_id: options.course_id
    });
    this.getAllData();
  },
  getAllData() {
    Loading.start();
    let {
      list,
      course_id,
      page_size
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: 'getCardCourseReview',
      course_id,
      page_no: list[0].page_no,
      page_size
    }, res => {
      wx.stopPullDownRefresh({});
      let {
        courseInfo,
        reviews
      } = res;
      this.setData({
        courseInfo,
        [`list[0].data`]:list[0].data.concat(reviews),
        [`list[0].noData`]:reviews.length==page_size,
        [`list[0].value`]:courseInfo.review_count,
        [`list[1].value`]:courseInfo.good_count,
        [`list[2].value`]:courseInfo.med_count,
        [`list[3].value`]:courseInfo.bad_count,

        [`tags[0].value`]:courseInfo.pic_count,
        [`tags[1].value`]:courseInfo.video_count,
        [`tags[2].value`]:courseInfo.append_count,
        [`tags[3].value`]:courseInfo.like_count,
        [`tags[4].value`]:courseInfo.dislike_count,
      });
      Loading.close();
    })
  },
  getData(){
    Loading.start();
    let {
      list,
      course_id,active,
      page_size
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: 'queryCardCourseReview',
      course_id,
      page_no: list[active].page_no,
      type:active,
      page_size
    }, res => {
      wx.stopPullDownRefresh({});
      let {
        reviews
      } = res;
      this.setData({
        [`list[${active}].data`]:list[active].data.concat(reviews),
        [`list[${active}].noData`]:reviews.length==page_size,
      });
      Loading.close();
    })
  },
  onReachBottom(){
   let {active,list}=this.data;
   list[active].noData?(active==0?this.getAllData():this.getData()):'';
  },
  onPullDownRefresh(){
    let {active}=this.data;
    this.setData({
      [`list[${active}].data`]:[],
      [`list[${active}].noData`]:true,
    })
    this.onReachBottom();
  },
  onShareAppMessage() {

  }
})