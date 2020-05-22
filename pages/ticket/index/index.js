let http = require('../../../common/request.js'),
  APP = getApp();
Page({
  data: {
    serverUrl: APP.globalData.serverUrl, //服务器地址
    active: 0,
    category: [],
    show: false,
    rootUrl: APP.globalData.serverUrl,
    distance: 16.5,
    getActsNearby: {
      cmd: "queryParkTickets",
      latitude: '',
      longitude: '',
      age_from: '',
      age_to: '',
      content: '',
      // distance: 3000,
      type: "", //门票类型 1：次票 2：套票（N次） 3：年票（无限次
      page_no: 1,
      page_size: 10,
      noMore: false,
    },
    addressName: "",
    dataList: [],
    age: [{
      name: '全部',
      value: '~',
      checked: true,
      age_from: "",
      age_to: "",
    }, {
      name: '0~3岁',
      value: '0~3',
      checked: false,
      age_from: "0",
      age_to: "3",
    }, {
      name: '4~6岁',
      value: '4~6',
      checked: false,
      age_from: "4",
      age_to: "6",
    }, {
      name: '7~12岁',
      value: '7~12',
      checked: false,
      age_from: "7",
      age_to: "12",
    }, {
      name: '13~15岁',
      value: '13~15',
      checked: false,
      age_from: "13",
      age_to: "15",
    }, {
      name: '16~18岁',
      value: '16~18',
      checked: false,
      age_from: "16",
      age_to: "18",
    }, {
      name: '18岁以上',
      value: '18岁以上',
      checked: false,
      age_from: "18",
      age_to: "80",
    }],
    list: {
      all: '',
    },
    typeList: [{
        name: "全部",
        type: "",
        checked: true
      },
      {
        name: "次票",
        type: 1,
        checked: false
      },
      {
        name: "套票",
        type: 2,
        checked: false
      },
      {
        name: "年票",
        type: 3,
        checked: false
      }
    ]
  },
  search(e) {
    this.setData({'getActsNearby.content': e.detail,})
  },
  onLoad(e) {
    let that = this,
      position = wx.getStorageSync('position');
    this.getHeight('#headTopNav', function(r) {
      r.height ? that.setData({
        height: r.height
      }) : '';
      that.setData({
        scrollHeight: APP.globalData.systemInfo.screenHeight - (APP.globalData.Custom.height + APP.globalData.Custom.top + (that.data.height || r.height) + 60)
      })
    })
    that.setData({
      addressName: wx.getStorageSync('addressName'),
      'getActsNearby.latitude': position.latitude,
      'getActsNearby.longitude': position.longitude,
      province: wx.getStorageSync('address').ad_info.province
    })
    this.getData();
  },
  // 重置
  reset() {
    for (let item of this.data.typeList) {
      item.checked = false;
    }
    for (let item of this.data.age) {
      item.checked = false;
    }
    this.data.typeList[0].checked = true;
    this.data.age[0].checked = true;
    this.setData({
      'getActsNearby.content': '',
      'getActsNearby.age_from': '',
      'getActsNearby.age_to': '',
      'getActsNearby.type': '',
      show: false,
      age: this.data.age,
      typeList: this.data.typeList,
      page_no: 1,
    });
    this.searchBtn();
  },
  searchBtn() {
    this.setData({
      'getActsNearby.page_no': 1,
      'getActsNearby.noMore': false,
      dataList: [],
      show:false,
    });
    this.getData();
  },
  //点击确定
  getData() {
    let that = this;
    this.setData({
      getActsNearby: this.data.getActsNearby
    })
    http.postReq("/community/ticket/", that.data.getActsNearby, function(res) {
      for (let i = 0, len = res.data.records.length; i < len; i++) {
        res.data.records[i].new_maxdis = (res.data.records[i].maxdis / 1000).toFixed(1);
        res.data.records[i].new_mindis = (res.data.records[i].mindis / 1000).toFixed(1)
      }
      that.setData({
        dataList: that.data.dataList.concat(res.data.records),
        show: false,
        noMore: res.data.records.length < 6,
        'getActsNearby.page_no': that.data.getActsNearby.page_no + 1
      })
    })
  },
  //输入搜索内容
  inputContent(e) {
    this.setData({
      'getActsNearby.content': e.detail,
      dataList: [],
      'getActsNearby.page_no': 1,
      noMore: false,
    })
    this.getData();
  },
  //门票类型选择
  ticketChange(e) {
    let index = e.target.dataset.value;
    for (let item of this.data.typeList) {
      item.checked = false;
    }
    this.data.typeList[index].checked = true;
    this.data.getActsNearby.type = this.data.typeList[index].type;
    this.setData({
      typeList: this.data.typeList,
      getActsNearby: this.data.getActsNearby
    })
  },
  // 学龄阶段选择
  ageChange(e) {
    let age = this.data.age,
      index = e.target.dataset.value;
    for (let item of age) {
      item.checked = false;
    }
    age[index].checked = true;
    this.data.getActsNearby.age_from = age[index].age_from;
    this.data.getActsNearby.age_to = age[index].age_to;
    this.setData({
      age: age,
      getActsNearby: this.data.getActsNearby
    });
  },
  getHeight(ele, fun) {
    var tabsHeight = '';
    wx.createSelectorQuery().select(ele).boundingClientRect(function(rect) {
      fun(rect)
    }).exec();
    return tabsHeight;
  },
  //选择
  openChoose() {
    this.data.show = !this.data.show;
    this.setData({
      show: this.data.show
    })
  },
  onChange(event) {
    let ind = event.detail.index;
    this.setData({
      'getActsNearby.act_type': ind ? ind : ''
    })
    this.getData();
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  togglePopup() {
    this.setData({
      show: !this.data.show
    });
  },
  onDrag(e) {
    this.setData({
      'getActsNearby.distance': e.detail.value == 0 ? 0 : ((e.detail.value * 0.3 * 1000).toFixed(0)),
      'distance': e.detail.value
    })
  },
  onPullDownRefresh: function() {
    this.setData({
      dataList: []
    })
    this.reset();
    this.getData();
  },
  onReachBottom: function() {
    if (!this.data.noMore) {
      this.getData();
    }
  },
  onShareAppMessage() {}
});