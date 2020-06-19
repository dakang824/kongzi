let app = getApp();
import http from '../../../common/request.js';
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    show: false,
    active: 0,
    sc_active: 0,
    rootUrl: app.globalData.serverUrl,
    list: [{
      data: [],
      name: '全部',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '少儿英语',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '少儿编程',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '思维训练',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '国学教育',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '美术培训',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '音乐培训',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '舞蹈培训',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '体育运动',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '课外辅导',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }, {
      data: [],
      name: '其他培训',
      page_no: 1,
      noData: false,
      page_size:10,
      show: false,
    }],
    teachStyle: [{
      name: '全部',
      value: ''
    }, {
      name: '线上',
      value: 1
    }, {
      name: '线下',
      value: 0
    }, {
      name: '线上+线下',
      value: 2
    }],
    comment_attr: [{
      name: '有图',
      active: false
    }, {
      name: '有视频',
      active: false
    }, {
      name: '无差评',
      active: false
    }, {
      name: '体验课',
      active: false
    }, {
      name: '正式课',
      active: false
    }],
    screenData: [{
      name: '综合排序',
      value: [1, 2]
    }, {
      name: '评分优先',
      value: [3, 4]
    }, {
      name: '好评优先',
      value: [5, 6]
    }, {
      name: '价格优先',
      value: [7, 8]
    }],
    postData: {
      cmd: 'queryCardInsts',
      category: "",
      order_type: 1, //1:综合升  2：综合降  3：评分升  4：评分降  5：好评升  6：好评降  7：价格升  8：价格降
      online: "", //0 线下，1 线上,2 线下 + 线上
      age: "",
      review_has_pic: "", //1 有图  未选中时传递‘’
      revoew_has_video: "", //1 有视频  未选中时传递‘’
      review_no_dislike: "", //1无差评 未选中时传递‘’
      try_count: "", //1 体验课  未选中时传递‘’
      formal_count: '', //1正式课  未选中时传递‘’
      page_size: 10
    }
  },
  reviewChange(e) {
    let {
      i
    } = e.currentTarget.dataset, {
      comment_attr
    } = this.data, a = !comment_attr[i].active;
    comment_attr[i].active = a;
    this.setData({
      comment_attr,
      'postData.review_has_pic': comment_attr[0].active ? 1 : 0,
      'postData.revoew_has_video': comment_attr[1].active ? 1 : 0,
      'postData.review_no_dislike': comment_attr[2].active ? 1 : 0,
      'postData.try_count': comment_attr[3].active ? 1 : 0,
      'postData.formal_count': comment_attr[4].active ? 1 : 0,
    })
  },
  ageChange(e) {
    let {
      i
    } = e.currentTarget.dataset;
    this.setData({
      'postData.age': i == 0 ? '' : i
    })
  },
  onlineChange(e) {
    this.setData({
      'postData.online': e.currentTarget.dataset.i
    })
  },
  tabsClick(e) {
    let {
      i
    } = e.currentTarget.dataset;
    let {
      postData,
      screenData
    } = this.data;
    this.setData({
      sc_active: i,
      ['postData.order_type']: postData.order_type == screenData[i].value[0] ? screenData[i].value[1] : screenData[i].value[0]
    });
    this.getData();
  },
  showLayer() {
    this.setData({
      show: true
    })
  },
  TabChange(e) {
    let value = e.detail.index;
    this.setData({
      // 1 少儿英语，2 思维训练，3 国学教育，4 美术培训，5 音乐培训，6 舞蹈培训，7 体育运动，8 少儿编程，9 课外辅导，99 其他培训
      'postData.category': value ? (value == 9 ? value : value == 1 ? value : value == 2 ? 8 : value == 10 ? 99 : value - 1) : '',
      active: value,
    });

    this.getData();
  },
  onReset() {
    let {
      copyPostData,
      list
    } = this.data;
    for (let key of list) {
      key.data = [];
      key.page_no = 1;
      key.noData = false;
      key.show = false;
    }
    this.setData({
      show: false,
      postData: copyPostData,
      list
    })
    this.getData();
  },
  onConfirm() {
    this.setData({
      show: false
    })
    this.getData();
  },
  getData() {
    Loading.start();
    let {
      postData,
      list,
      active
    } = this.data;
    http.postReq("/review/front/", {
      page_no: list[active].page_no,
      ...postData
    }, res => {
      wx.stopPullDownRefresh();
      let data = res.data.records;
      if (data.length) {
        console.log( list[active].data.concat(data));
        this.setData({
          [`list[${active}].data`]: list[active].data.concat(data),
          [`list[${active}].page_no`]: list[active].page_no + 1,
        })
      }
      this.setData({
        [`list[${active}].noData`]: data.length == postData.page_size,
        [`list[${active}].show`]: true,
      })
      Loading.close();
    })
  },
  onLoad(options) {
    this.getData();
    this.setData({
      copyPostData: JSON.parse(JSON.stringify(this.data.postData))
    })
  },
  onShareAppMessage() {

  }
})