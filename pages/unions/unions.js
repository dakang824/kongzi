let http = require('../../common/request.js'),
  app = getApp(),
  config = require('./config.js');
Page({
  data: {
    init: 0, // 是否加载 0：未加载，1：已加载
    imgUrl: app.globalData.serverUrl,
    value1: '',
    active: 0,
    tabInd: 0,
    noData: false,
    card: false,
    category: [],
    parks: [],
    show: false,
    loading1: false,
    titLoading: true,
    addressName: '',
    rootUrl: app.globalData.serverUrl,
    distance: 0,
    isFixed: false,
    getActsNearby: {
      // cmd: "queryUnionMembers",
      cmd: "queryUnionMembersV20",
      latitude: '',
      longitude: '',
      age_from: '',
      age_to: '',
      category: '',
      condition: '',
      distance: 0,
      type: 1, // 1: 联盟成员   2：诚信保障列表
      page_no: 1,
      page_size: 7
    },
    Institution: config.Institution,
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
    // list: {
    //   all: '',
    // },
    list: [],
    page_no: 1,
  },
  setSearchValue(e) {
    this.setData({
      list: [],
      'getActsNearby.page_no': 1,
      'getActsNearby.condition': e.detail,
    });
    this.getData();
  },
  search(e){
    this.setData({ 'getActsNearby.condition': e.detail})
  },
  onPullDownRefresh() {
    this.setData({
      loading1: true,
      titLoading: false
    })
    if (this.data.tabInd == 1) {
      this.setData({
        page_no: 1,
        parks: [],
        noData: false
      });
      this.getParksData();
    } else {
      this.setData({ list: [], 'getActsNearby.page_no': 1, noData: false})
      this.getData();
    }
    wx.stopPullDownRefresh();
  },
  clearSearch(e) {
    this.setData({
      'getActsNearby.condition': ''
    });
    this.getData();

  },
  reset() {
    let age = this.data.age;
    for (let item of age) {
      item.checked = false;
    }
    age[0].checked = true;
    this.setData({
      'getActsNearby.category': '',
      'getActsNearby.age_from': '',
      'getActsNearby.age_to': '',
      'getActsNearby.distance': 0,
      'getActsNearby.condition': '',
      'getActsNearby.page_no': 1,
      'getActsNearby.page_size': 7,
      distance: 0,
      show: false,
      age: age,
    });
    this.onPullDownRefresh();
  },
  /* 选择机构类型 */
  choose_inst(e) {
    this.setData({
      'getActsNearby.category': e.currentTarget.dataset.category
    })
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
  getParksData() {
    let getActsNearby = this.data.getActsNearby,
      getParksData = {},
      that = this,
      page_no = this.data.page_no;
    getParksData.cmd = 'queryParks';
    getParksData.page_no = page_no;
    getParksData.page_size = 5;
    getParksData.content = getActsNearby.condition;
    getParksData.age_from = getActsNearby.age_from;
    getParksData.age_to = getActsNearby.age_to;
    getParksData.latitude = getActsNearby.latitude;
    getParksData.longitude = getActsNearby.longitude;
    http.postReq("/community/ticket/", getParksData, function(res) {
      let records = res.data.records;
      if (records.length) {
        for (let item of records) {
          item['logo'] = that.data.rootUrl + item.list_pic;
          item['maxdis'] = (item.maxdis / 1000).toFixed(1)
          item['mindis'] = (item.mindis / 1000).toFixed(1)
        }
        let data = that.data.parks.concat(records);
        that.setData({
          parks: data,
          page_no: page_no + 1,
          loading1: false,
          show: false,
          noData: !(records.length == 5),
        })
      } else {
        that.setData({
          noData: true,
          loading1: false,
          show: false,
        })
      }
    })
  },
  errorImg(e) {
    let list = this.data.list,
      i = e.target.dataset.i,
      tabInd = this.data.tabInd,
      parks = this.data.parks;
    if (tabInd == 0 && list.length || tabInd == 2 && list.length) {
      list[i].logo = '';
      this.setData({
        'list': list
      });
    } else {
      parks[i].logo = '';
      this.setData({
        'parks': list
      });
    }
  },
  //得到数据
  getData() {
    if (this.data.show) {
      this.setData({
        'getActsNearby.page_no': 1,
        list: []
      })
    }
    if (this.data.tabInd == 1) {
      console.log(111);
      this.setData({
        parks: [],
        page_no: 1
      })
      this.getParksData();
      return;
    }
    this.setData({
      show: false
    })
    let that = this,
      type = this.data.getActsNearby.act_type;
    http.postReq("/community/user/", that.data.getActsNearby, function(res) {
      if (res.data.length) {
        res.data.map(function(item, index) {
          item['maxdis'] = (item.maxdis / 1000).toFixed(1)
          item['mindis'] = (item.mindis / 1000).toFixed(1)
          item['logo'] = getApp().globalData.serverUrl + item.cover_image
        })
        that.setData({
          list: that.data.list.concat(res.data),
          loading1: false,
          titLoading: true,
          noData: !(res.data.length==7),
          'getActsNearby.page_no': that.data.getActsNearby.page_no + 1
        })
      }else{
        that.setData({ noData: true })
      }
    }, that.data.titLoading);
  },
  getHeight(ele, fun) {
    var tabsHeight = '';
    wx.createSelectorQuery().select(ele).boundingClientRect(function(rect) {
      fun(rect)
    }).exec();
    return tabsHeight;
  },
  onLoad(e) {
    this.setData({
      tabInd: Number(e.tabInd),
      union: Number(e.union)
    })

    if (Number(e.tabInd) == 1) {
      wx.setNavigationBarTitle({ //1-乐园  0--联盟  2--诚信保障
        title: "乐园列表",
      })
      this.setData({
        parks: []
      })
    } else if (Number(e.tabInd) == 0) {
      wx.setNavigationBarTitle({ //1-乐园  0--联盟  2--诚信保障
        title: "联盟成员列表",
      })
      this.setData({
        'getActsNearby.type': '1',
        list: []
      })
    } else if (Number(e.tabInd) == 2) {
      wx.setNavigationBarTitle({ //1-乐园  0--联盟  2--诚信保障
        title: "诚信保障机构",
      })
      this.setData({
        'getActsNearby.type': '2',
        list: []
      })
    }
    let that = this;
    this.setData({
      'getActsNearby.latitude': wx.getStorageSync('position').latitude,
      'getActsNearby.longitude': wx.getStorageSync('position').longitude,
      addressName: wx.getStorageSync('addressName'),
      province: wx.getStorageSync('address').ad_info.province,
    });
    this.getHeight('#headTopNav', function(r) {
      that.setData({
        scrollHeight: app.globalData.systemInfo.screenHeight - (app.globalData.Custom.height + app.globalData.Custom.top + r.height + 60)
      })
    })
    this.data.tabInd == 1 ? this.getParksData() : this.getData()
    this.getCategorys();
  },
  getCategorys() {
    let that = this;
    http.postReq("/inst2/account/", {
      cmd: 'getCategorys'
    }, function(res) {
      that.setData({
        categorys: res.data
      });
    }, true)
  },
  scroll(e) {
    this.setData({
      isFixed: e.detail.isFixed
    });
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
      'getActsNearby.distance': e.detail.value == 0 ? '' : (e.detail.value * 0.5 * 1000).toFixed(0),
      'distance': e.detail.value
    })
  },
  onReachBottom() {
    if (this.data.tabInd == 1 && !this.data.noData) {
      this.getParksData();
    } else if (this.data.tabInd == 0 || this.data.tabInd == 2){
      this.getData();
    }
  },
  onShow() {
    (this.data.addressName == wx.getStorageSync('addressName')) ? '' : this.onLoad({
      tabInd: this.data.tabInd,
      union: this.data.union
    });
  },
  onShareAppMessage() {}
});