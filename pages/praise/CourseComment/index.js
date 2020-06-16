let http = require('../../../common/request.js'),
  app = getApp();
Page({
  data: {
    tagsActive: 0,
    active: 0,
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
      page_no: 1
    }, {
      name: '好评',
      value: '0',
      data: [],
      page_no: 1
    }, {
      name: '中评',
      value: '0',
      data: [],
      page_no: 1
    }, {
      name: '差评',
      value: '0',
      data: [],
      page_no: 1
    }]
  },
  
  tagsClick(e) {
    this.setData({
      tagsActive: e.currentTarget.dataset.i
    })
  },
  tabSwitch(e) {
    this.setData({
      active: e.currentTarget.dataset.i
    })
  },
  onLoad(options) {
    this.setData({
      course_id: options.course_id
    });
    this.getAllData();
  },
  getAllData() {
    let {
      list,
      course_id
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: 'getCardCourseReview',
      course_id,
      page_no: list[0].page_no,
      page_size: 10
    }, res => {
      let {
        courseInfo,
        reviews
      } = res;
      this.setData({
        courseInfo,
        [`list[0].data`]: list[0].data.concat(reviews),
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
    })
  },
  onShareAppMessage() {

  }
})