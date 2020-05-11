let http = require('../../common/request.js'),
  app = getApp(),
  config = require('./config.js');
Page({
  data: {
    init: 0, // 是否加载 0：未加载，1：已加载
    imgUrl: app.globalData.serverUrl,
    tabBar: app.globalData.tabBar,
    value1: '',
    noData1: false,
    active: 0,
    tabInd: 0,
    noData: false,
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
      cmd: "queryInstNearby",
      latitude: '',
      longitude: '',
      age_from: '',
      age_to: '',
      category: '',
      condition: '',
      distance: 0,
      page_no: 1,
      page_size: 7,
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
    age_from: '',
    age_: ''
  },
  onLoad(e){
    // app.editTabbar();
    this.setData({ tabInd: Number(e.tabInd)});
    Number(e.tabInd)?wx.setNavigationBarTitle({
      title: '儿童乐园',
    }):'';
  },
  setSearchValue(e) {
    let that = this;
    if (this.data.tabInd == 0) {
      this.setData({
        list: [],
        'getActsNearby.page_no': 1,
      })
      that.getData();
    } else if (this.data.tabInd == 1) {
      this.setData({
        parks: [],
        'page_no': 1,
      })
      this.getParksData();
    }
  },
  onShow() {
    (this.data.addressName == wx.getStorageSync('addressName')) ? '' : this.onInit();
    this.setData({
      province: wx.getStorageSync('address').ad_info.province
    })
  },
  onPullDownRefresh() {
    this.setData({
      loading1: true,
      titLoading: false
    })
    this.confirm();
    wx.stopPullDownRefresh();
  },
  clearSearch(e) {
    this.setData({
      'getActsNearby.condition': ''
    });
    this.data.tabInd ? this.getParksData() : this.getData();
  },
  confirm() {
    if (this.data.tabInd == 0) {
      this.setData({
        list: [],
        show: false,
        noData1: false,
        'getActsNearby.page_no': 1,
      })
      this.getData();
    } else {
      this.setData({
        parks: [],
        show: false,
        noData: false,
        page_no: 1
      })
      this.getParksData();
    }
  },
  reset() {
    let age = this.data.age,
      age1 = this.data.age1;
    for (let item of age) {
      item.checked = false;
    }
    age[0].checked = true;
    for (let item of age1) {
      item.checked = false;
    }
    age1[0].checked = true;
    if (this.data.tabInd) {
      this.setData({
        age_from: '',
        age_to: '',
        age1: age1
      })
    } else {
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
    }
    this.confirm();
  },
  choose_inst(e) {
    this.setData({
      'getActsNearby.category': e.currentTarget.dataset.category
    })
  },
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
  ageChange1(e) {
    let age = this.data.age1,
      ind = e.target.dataset.value,
      value = age[ind].value.split('~');
    for (let item of age) {
      item.checked = false;
    }
    age[ind].checked = true;
    this.setData({
      age1: age,
      'age_from': value[0],
      'age_to': value[1]
    });
  },
  getParksData() {
    let d = { ...this.data.getActsNearby
      },
      page_no = this.data.page_no,
      that = this,
      { ...data
      } = {
        cmd: 'queryParks',
        page_no: page_no,
        page_size: 5,
        content: d.condition,
        age_from: this.data.age_from,
        age_to: this.data.age_to,
      };
    http.postReq("/community/ticket/", { ...d,
      ...data
    }, function(res) {
      let records = res.data.records,
        parks = that.data.parks;
      if (records.length) {
        for (let item of records) {
          item['logo'] = that.data.rootUrl + item.list_pic;
          item['maxdis'] = (item.maxdis / 1000).toFixed(1)
          item['mindis'] = (item.mindis / 1000).toFixed(1)
        }
        page_no == 1 ? that.setData({
          pasks: []
        }) : '';
        that.setData({
          parks: parks.concat(records),
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
      i = e.target.dataset.i;
    list[i].logo = '';
    this.setData({
      'list': list
    });
  },
  errorImg1(e) {
    let i = e.target.dataset.i,
      parks = this.data.parks;
    parks[i].logo = '';
    this.setData({
      'parks': parks
    });
  },
  search(e) {
    this.setData({
      'getActsNearby.condition': e.detail
    })
  },
  getData() {
    let that = this,
      type = this.data.getActsNearby.act_type;
    http.postReq("/community/user/", that.data.getActsNearby, res=> {
      let list = that.data.list,
        page_no = that.data.getActsNearby.page_no;
      if (res.data.length) {
        res.data.map((item, index)=>{
          item.maxdis = (item.maxdis / 1000).toFixed(1)
          item.mindis = (item.mindis / 1000).toFixed(1)
          item.logo = getApp().globalData.serverUrl + item.cover_image
        })
        page_no == 1 ? that.setData({
          list: []
        }) : '';
        that.setData({
          list: list.concat(res.data),
          loading1: false,
          titLoading: true,
          noData1: !(res.data.length == 7),
          'getActsNearby.page_no': page_no + 1
        })
      } else {
        that.setData({
          noData1: true
        });
      }
    }, that.data.titLoading)
  },
  getHeight(ele, fun) {
    var tabsHeight = '';
    wx.createSelectorQuery().select(ele).boundingClientRect(rect=>{
      fun(rect)
    }).exec();
    return tabsHeight;
  },
  onInit(e) {
    let that = this;
    new Promise((resolve, reject) => {
      wx.getStorageSync('position') === '' ? app.getAddress(() => { resolve() }) : resolve();
      this.getCategorys();
    }).then(() => {
      this.setData({
        'getActsNearby.latitude': wx.getStorageSync('position').latitude,
        'getActsNearby.longitude': wx.getStorageSync('position').longitude,
        addressName: wx.getStorageSync('addressName'),
        province: wx.getStorageSync('address').ad_info.province,
        loading1: true,
        titLoading: false,
        page_no: 1,
        parks: [],
        noData: false,
        'getActsNearby.category': '',
        'getActsNearby.age_from': '',
        'getActsNearby.age_to': '',
        'getActsNearby.distance': 0,
        'getActsNearby.condition': '',
        'getActsNearby.page_no': 1,
        'getActsNearby.page_size': 7,
        distance: 0,
        show: false,
        list: [],
        age1: this.data.age
      });
      this.getHeight('#headTopNav', r=> {
        that.setData({
          scrollHeight: app.globalData.systemInfo.screenHeight - (app.globalData.Custom.height + app.globalData.Custom.top + r.height + 60)
        })
      })
      this.data.tabInd==1?this.getParksData():this.getData();
    })
  },
  getCategorys() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'getCategorys'
    }, res => {
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
  onTab(e) {
    let index = e.detail.index;
    this.setData({
      tabInd: index
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
      'getActsNearby.distance': e.detail.value == 0 ? '' : (e.detail.value * 0.3 * 1000).toFixed(0),
      'distance': e.detail.value
    })
  },
  onReachBottom() {
    if (this.data.tabInd && !this.data.noData) {
      this.getParksData();
    } else if (this.data.tabInd == 0) {
      this.getData();
    }
  },
  onTabItemTap() {
    app.globalData.disableTab ? '' : wx.switchTab({
      url: '/pages/new/index/index',
    })
  },
  onShareAppMessage() {}
});