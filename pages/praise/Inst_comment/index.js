let http = require('../../../common/request.js'),
  app = getApp();
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    collapsed:true,
    tagsActive: 0,
    active: 0,
    page_size: 10,
    url: app.globalData.serverUrl,
    imgUrl: app.globalData.imageurl,
    stars: [{
      name: '学习效果',
      value: '',
    }, {
      name: '师资环境',
      value: '',
    }, {
      name: '上课环境',
      value: '',
    }, {
      name: '服务态度',
      value: '',
    }],
    tags: [{
      name: '有图',
      value: '0',
      active: true,
    }, {
      name: '有视频',
      value: '0',
      active: false,
    }, {
      name: '有追评',
      value: '0',
      active: false,
    }, {
      name: '有点赞',
      value: '0',
      active: false,
    }, {
      name: '有点怼',
      value: '0',
      active: false,
    }],
    list: [{
      name: '全部',
      value: '0',
      data: [],
      page_no: 1,
      noData: true,
    }, {
      name: '好评',
      value: '0',
      data: [],
      page_no: 1,
      noData: true,
    }, {
      name: '中评',
      value: '0',
      data: [],
      page_no: 1,
      noData: true,
    }, {
      name: '差评',
      value: '0',
      data: [],
      page_no: 1,
      noData: true,
    }]
  },
  lookMore(){
    this.setData({collapsed:!this.data.collapsed})
  },
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: getApp().globalData.servPhone,
    })
  },
  goComment(){
    let {
      online,
      id,
      name
    } = this.data.courseInfo;
    let inst_id=id;
    let d={
      inst_id,
      online,
      name
    };
    wx.navigateTo({
      url: `/pages/praise/Inst_submitComment/index?d=${encodeURI(JSON.stringify(d))}`,
    })
  },
  changeLike(e) {
    let {
      active
    } = this.data;
    this.setData({
      [`list[${active}].data[${e.detail.index}].my_like_count`]: e.detail.type == 1 ? 1 : 0,
      [`list[${active}].data[${e.detail.index}].my_dislike_count`]: e.detail.type == 2 ? 1 : 0,
    })
  },
  tagsClick(e) {
    let {
      list,
      active
    } = this.data;
    for (let key of list) {
      key.data = [];
      key.page_no = 1;
      key.noData = true;
    }
    let {
      i
    } = e.currentTarget.dataset, t = i.split('_');

    list[t[0]].tags[t[1]].active = !list[t[0]].tags[t[1]].active;
    this.setData({
      list,
    })
    this.getData()
  },
  tabSwitch(e) {
    let {
      i
    } = e.currentTarget.dataset;
    this.setData({
      active: i
    })
    let {
      list,
      active
    } = this.data;
    list[active].noData ? (i == 0 ? this.getAllData() : this.getData()) : '';
  },
  onLoad(options) {
    let {
      tags,
      list,
    } = this.data;
    for (let key of list) {
      key.tags = JSON.parse(JSON.stringify(tags))
    }
    this.setData({
      list,
      id: options.id,
    })
    this.getData();
  },
  getAllData() {
    Loading.start();
    let {
      list,
      id,
      page_size,
      active
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: 'getCardInstDetail',
      id,
      page_no: list[0].page_no,
      page_size,
    }, res => {
      wx.stopPullDownRefresh();
      console.log(res);
      let {
        courseInfo,
        reviews
      } = res;
      this.setData({
        courseInfo,
        [`list[0].value`]: courseInfo.review_count,
        [`list[1].value`]: courseInfo.good_count,
        [`list[2].value`]: courseInfo.med_count,
        [`list[3].value`]: courseInfo.bad_count,
      });
      this.sData(courseInfo, reviews);
      Loading.close();
    })
  },
  sData(review_counts, reviews) {
    let {
      active,
      list,
      page_size
    } = this.data;
    list[active].page_no=list[active].page_no + 1;
    list[active].data=list[active].data.concat(reviews);
    list[active].noData=reviews.length == page_size;

    list[active].tags[0].value=review_counts.pic_count,
    list[active].tags[1].value=review_counts.video_count,
    list[active].tags[2].value=review_counts.append_count,
    list[active].tags[3].value=review_counts.like_count,
    list[active].tags[4].value=review_counts.dislike_count,
    this.setData({
      list
    });
  },
  getData() {
    Loading.start();
    let {
      list,
      id,
      active,
      tagsActive,
      page_size,
      stars
    } = this.data, d = {
      cmd: 'getCardInstDetail',
      id,
      page_no: list[active].page_no,
      type: active,
      page_size,
      has_image: list[active].tags[0].active ? 1 : '',
      has_video: list[active].tags[1].active ? 1 : '',
      has_append: list[active].tags[2].active ? 1 : '',
      has_like: list[active].tags[3].active ? 1 : '',
      has_dislike: list[active].tags[4].active ? 1 : '',
      ...wx.getStorageSync('position')
    };
    active == 0 ? delete d['type'] : '';
    http.postReq("/review/front/", d, res => {
      wx.stopPullDownRefresh({});
      let {
        reviews,
        review_counts,
        branches,
        inst_info
      } = res;
      stars[0].value=inst_info.eff_score;
      stars[1].value=inst_info.tea_score;
      stars[2].value=inst_info.env_score;
      stars[3].value=inst_info.ser_score;

      inst_info.online=inst_info.type;
      
      this.setData({
        courseInfo: inst_info,
        'stars[2].name':inst_info.online==0?'上课体验':'上课环境',
        stars,
        branches
      })
      this.sData(inst_info, reviews);
      Loading.close();
    })
  },
  goIntroduce(){
    wx.navigateTo({
      url: `/pages/selCourseCard/imgs/imgs?type=2&id=${this.data.id}`,
    })
  },
  onReachBottom() {
    let {
      active,
      list
    } = this.data;
    list[active].noData ? this.getData() : '';
  },
  onPullDownRefresh() {
    let {
      active
    } = this.data;
    this.setData({
      [`list[${active}].data`]: [],
      [`list[${active}].noData`]: true,
      [`list[${active}].page_no`]: 1,
    })
    this.onReachBottom();
  },
  onShareAppMessage() {

  }
})