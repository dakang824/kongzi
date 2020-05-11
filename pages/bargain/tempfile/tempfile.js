let http = require('../../../common/request.js'),
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
    parks: [],
    show: false,
    loading1: false,
    titLoading: true,
    addressName: '',
    rootUrl: app.globalData.serverUrl,
    distance: 0,
    isFixed: false,
    postData: {
      cmd: "queryLocals",
      type: 2,
      latitude: '',
      longitude: '',
      age_from: '',
      age_to: '',
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
    list: [],
    page_no: 1,
    age_from: '',
    age_: ''
  },
  onLoad(e) {
    this.setData({
      'postData.type': Number(e.type)
    });
    wx.setNavigationBarTitle({
      title: e.type == 2 ? '亲子玩乐' : e.type == 3 ? '健康医疗' : e.type == 4 ? '美食餐饮' : e.type == 5 ? '公私学校' : '',
    });
  },
  setSearchValue(e) {
    let that = this;
    if (this.data.tabInd == 0) {
      this.setData({
        list: [],
        'postData.page_no': 1,
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
      'postData.condition': ''
    });
    this.data.tabInd ? this.getParksData() : this.getData();
  },
  confirm() {
    if (this.data.tabInd == 0) {
      this.setData({
        list: [],
        show: false,
        noData1: false,
        'postData.page_no': 1,
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
        'postData.age_from': '',
        'postData.age_to': '',
        'postData.distance': 0,
        'postData.condition': '',
        'postData.page_no': 1,
        'postData.page_size': 7,
        distance: 0,
        show: false,
        age: age,
      });
    }
    this.confirm();
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
      'postData.age_from': value[0],
      'postData.age_to': value[1]
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
  errorImg(e) {
    let {list} = this.data;
    list[e.target.dataset.i].list_pic = '';
    this.setData({
      list
    });
  },
  search(e) {
    this.setData({
      'postData.condition': e.detail
    })
  },
  getData() {
    let d = this.data.postData;
    d.distance == 0 ? delete d.distance:'';
    http.postReq("/community/local/", d, res => {
      let list = res.data.records,
        page_no = this.data.postData.page_no;
      if (list.length) {
        for(let key of list){
          key.labels = key.labels.split('，')
        }
        page_no == 1 ? this.setData({
          list: []
        }) : '';
        this.setData({
          list: this.data.list.concat(list),
          loading1: false,
          titLoading: true,
          noData1: !(list.length == 7),
          'postData.page_no': page_no + 1
        })
      } else {
        this.setData({
          noData1: true
        });
      }
    }, this.data.titLoading)
  },
  getHeight(ele, fun) {
    var tabsHeight = '';
    wx.createSelectorQuery().select(ele).boundingClientRect(rect => {
      fun(rect)
    }).exec();
    return tabsHeight;
  },
  onInit(e) {
    let that = this;
    new Promise((resolve, reject) => {
      wx.getStorageSync('position') === '' ? app.getAddress(() => {
        resolve()
      }) : resolve();
    }).then(() => {
      this.setData({
        'postData.latitude': wx.getStorageSync('position').latitude,
        'postData.longitude': wx.getStorageSync('position').longitude,
        addressName: wx.getStorageSync('addressName'),
        province: wx.getStorageSync('address').ad_info.province,
        loading1: true,
        titLoading: false,
        page_no: 1,
        parks: [],
        noData: false,
        'postData.age_from': '',
        'postData.age_to': '',
        'postData.distance': 0,
        'postData.condition': '',
        'postData.page_no': 1,
        'postData.page_size': 7,
        distance: 0,
        show: false,
        list: [],
        age1: this.data.age
      });
      this.getHeight('#headTopNav', r => {
        that.setData({
          scrollHeight: app.globalData.systemInfo.screenHeight - (app.globalData.Custom.height + app.globalData.Custom.top + r.height + 60)
        })
      })
      this.data.tabInd == 1 ? this.getParksData() : this.getData();
    })
  },
  scroll(e) {
    this.setData({
      isFixed: e.detail.isFixed
    });
  },
  onChange(event) {
    let ind = event.detail.index;
    this.setData({
      'postData.act_type': ind ? ind : ''
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
      'postData.distance': e.detail.value == 0 ? '' : (e.detail.value * 0.3 * 1000).toFixed(0),
      'distance': e.detail.value
    })
  },
  onReachBottom() {
    this.getData();
  },
  onShareAppMessage() {}
});