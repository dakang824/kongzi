let http = require('../../common/request.js'),
  utils = require('../../utils/util.js'),
  app = getApp(),
  setTime = null;
Page({
  data: {
    imgUrl: app.globalData.serverUrl,
    value1: '',
    active: 0,
    show: false,
    loading: false,
    titLoading: true,
    addressName: '',
    rootUrl: app.globalData.serverUrl,
    addressName: '',
    ope_id: '',
    distance: 0,
    noData: false,
    getActsNearby: {
      cmd: 'getActsNearbyV22',
      distance: '',
      status: '',
      course_type: '',
      age_from: '',
      age_to: '',
      condition: '',
      latitude: '',
      longitude: '',
      page_size: 10,
      page_no: 1
    },
    activeType: [{
      name: "全部",
      value: '',
      checked: true
    }, {
      name: "邀友砍价",
      value: 1,
      checked: false
    }, {
      name: "拉友拼团",
      value: 2,
      checked: false
    }, {
      name: "N元试听",
      value: 3,
      checked: false
    }, {
      name: "限时优惠",
      value: 4,
      checked: false
    }, {
      name: "限量优惠",
      value: 5,
      checked: false
    }],
    activeStatus: [{
      name: "全部",
      value: '',
      checked: true
    }, {
      name: "体验课",
      value: 1,
      checked: false
    }, {
      name: "短课包",
      value: 2,
      checked: false
    }, {
      name: "正式课",
      value: 3,
      checked: false
    }, {
      name: "联合课包",
      value: 4,
      checked: false
    }],
    age: [{
      name: '全部',
      value: '~',
      checked: true
    }, {
      name: '0~3岁',
      value: '0~3',
      checked: false
    }, {
      name: '4~6岁',
      value: '4~6',
      checked: false
    }, {
      name: '7~12岁',
      value: '7~12',
      checked: false
    }, {
      name: '13~15岁',
      value: '13~15',
      checked: false
    }, {
      name: '16~18岁',
      value: '16~18',
      checked: false
    }],
    list: {
      all: [],
      bargain: '',
      assemble: '',
      audition: '',
      discount: ''
    }
  },
  errorImg(e) {
    let list = this.data.list.all,
      i = e.target.dataset.i;
    list[i].list_pic = '';
    this.setData({
      'list.all': list
    });
  },
  search(e){
    this.setData({ 'getActsNearby.condition': e.detail})
  },
  setSearchValue(e) {
    this.setData({
      'list.all': [],
      noData: false,
      'getActsNearby.page_no': 1,
    });
    this.onPullDownRefresh();
  },
  onPullDownRefresh() {
    let that = this;
    this.setData({
      loading: true,
      titLoading: false,
      'list.all': [],
      'getActsNearby.page_no': 1,
      noData: false
    })
    that.getData();
    wx.stopPullDownRefresh();
  },
  clearSearch(e) {
    this.setData({
      'getActsNearby.condition': ''
    });
    this.getData();
  },
  // 重置
  reset() {
    let activeStatus = this.data.activeStatus,
      age = this.data.age,
      activeType = this.data.activeType;
    for (let item of activeStatus) {
      item.checked = false;
    }
    for (let item of age) {
      item.checked = false;
    }
    for (let item of activeType) {
      item.checked = false;
    }
    age[0].checked = true, activeStatus[0].checked = true, activeType[0].checked = true;
    this.setData({
      'getActsNearby.act_status': '',
      'getActsNearby.age_from': '',
      'getActsNearby.age_to': '',
      'getActsNearby.distance': '',
      'getActsNearby.condition': '',
      'getActsNearby.course_type': '',
      distance: 0,
      'list.all':[],
      age: age,
      activeStatus: activeStatus,
      activeType: activeType,
    });
    this.onPullDownRefresh();
  },
  // 活动转态选择
  activeChange(e) {
    let activeStatus = this.data.activeStatus,
      ind = e.target.dataset.value;
    for (let item of activeStatus) {
      item.checked = false;
    }
    activeStatus[ind].checked = true;
    this.setData({
      activeStatus: activeStatus,
      'getActsNearby.course_type': activeStatus[ind].value
    });
  },
  // 活动类型选择
  activeType(e) {
    let activeType = this.data.activeType,
      ind = e.target.dataset.value;
    for (let item of activeType) {
      item.checked = false;
    }
    activeType[ind].checked = true;
    this.setData({
      activeType: activeType,
      'getActsNearby.course_type': activeType[ind].value
    });
  },
  // 学龄阶段选择
  ageChange(e) {
    let age = this.data.age,
      ind = e.target.dataset.value,
      value = age[ind].value.split('~');
    for (let item of age) {
      item.checked = false;
    }
    age[ind].checked = true;
    this.setData({
      age: age,
      'getActsNearby.age_from': value[0],
      'getActsNearby.age_to': value[1]
    });
  },
  unique(arr) {
    let b = []
    let hash = {}
    for (let i = 0; i < arr.length; i++) {
      if (!hash[JSON.stringify(arr[i])]) {
        hash[JSON.stringify(arr[i])] = true
        b.push(arr[i])
      }
    }
    return b
  },
  //得到数据
  getData() {
    this.setData({
      show: false
    })
    clearInterval(setTime);
    let that = this,
      type = this.data.getActsNearby.course_type;
    http.postReq("/community/user/", that.data.getActsNearby, function(res) {
      let data = res.data,
        list = that.data.list.all,
        page_no = that.data.getActsNearby.page_no,
        i = 0;
      if (data.records.length) {
        for (let item of data.records) {
          item.maxDis = (item.maxDis / 1000).toFixed(1);
          item.minDis = (item.minDis / 1000).toFixed(1);
        }
        page_no == 1 ? list = [] : '';
        that.setData({
          'list.all': list.concat(data.records),
          loading: false,
          titLoading: true,
          noData: !(data.records.length == 10),
          'getActsNearby.page_no': page_no + 1
        })
      } else {
        that.setData({
          noData: true,
          loading: false,
          titLoading: true
        });
      }
    }, that.data.titLoading)
  },
  getHeight(ele, fun) {
    var tabsHeight = '';
    wx.createSelectorQuery().select(ele).boundingClientRect(function(rect) {
      fun(rect)
    }).exec();
    return tabsHeight;
  },
  onLoad(e) {
    let that = this;
    new Promise((resolve, reject) => {
      wx.getStorageSync('position') === '' ? app.getAddress(() => { resolve() }) : resolve();
    }).then(() => {
      this.setData({
        'getActsNearby.latitude': wx.getStorageSync('position').latitude,
        'getActsNearby.longitude': wx.getStorageSync('position').longitude,
        scrollHeight: app.globalData.systemInfo.screenHeight - 220,
        addressName: wx.getStorageSync('addressName'),
        province: wx.getStorageSync('address').ad_info.province,
        ope_id: wx.getStorageSync("userInfo").id
      });
      this.getHeight('#headTopNav', r=>{
        that.setData({
          scrollHeight: app.globalData.systemInfo.screenHeight - (app.globalData.Custom.height + app.globalData.Custom.top + r.height + 60)
        })
      })
    })
  },
  onShow() {
    this.getData();
  },
  onChange(event) {
    let ind = event.detail.index;
    this.setData({
      'getActsNearby.course_type': ind ? ind : ''
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
      'getActsNearby.distance': e.detail.value == 0 ? '' : (e.detail.value * 0.3 * 1000).toFixed(0),
      'distance': e.detail.value
    })
  },
  onReachBottom() {
    this.data.noData ? '' : this.getData();
  },
  onShareAppMessage() {}
});