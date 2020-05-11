import Dialog from '../../dist/dialog/dialog';
let http = require('../../common/request.js'),
  app = getApp();
Page({
  data: {
    searchValue: '',
    history: [],
    addressName: '',
    cityArea: '选择市区',
    init: 0, // 是否加载 0：未加载，1：已加载
  },
  delAll(){
    let that=this;
    Dialog.confirm({
      message: '确定全部删除吗？'
    }).then(() => {
      for (let item of that.data.history) {
        http.postReq("/community/user/", {
          cmd: 'deleteHidtoryAddress',
          address_id: item.id
        }, function (res) {

        })
      }
      that.onLoad();
    });
  },
  onInput(e){
    console.log(e);
  },
  onSearch(e) {
    let that = this, address = '上海市' + that.data.cityArea+e.detail
    http.postReq("/community/user/", {
      cmd: 'addressDecode',
      address: address
    }, res=>{
      let position = {
        latitude: res.latitude,
        longitude: res.longitude
      };
      http.postReq("/community/user/", {
        cmd: 'addHidtoryAddress',
        address: e.detail
      }, res=> {
        wx.setStorageSync('addressName', e.detail);
        wx.setStorageSync('position', position);
        http.postReq("/community/user/", {
          cmd: 'addressEncode',
          latitude: position.latitude,
          longitude: position.longitude
        }, res=> {
          wx.setStorageSync('address', res.data);
          that.black();
        })
      })
    })
  },
  selectHistory() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'getHidtoryAddress'
    }, function(res) {
      that.setData({
        history: res.data
      })
    })
  },
  historyClick(e) {
    let that=this;
    http.postReq("/community/user/", {
      cmd: 'addressDecode',
      address: '上海市' + that.data.cityArea+e.target.dataset.name
    }, function (res) {
      let position = {
        latitude: res.latitude,
        longitude: res.longitude
      };
      wx.setStorageSync('addressName', e.target.dataset.name);
      wx.setStorageSync('position', position);
      http.postReq("/community/user/", {
        cmd: 'addressEncode',
        latitude: position.latitude,
        longitude: position.longitude
      }, function (res) {
        wx.setStorageSync('address', res.data);
        that.black();
      })
    })
  },
  black(){
    wx.navigateBack({
      delta: 1,
    })
  },
  onLoad(e) {
    var that = this;
    new Promise((resolve, reject) => {
      wx.getStorageSync('position') === '' ? app.getAddress(() => { resolve() }) : resolve();
    }).then(() => {
      this.setData({
        address: wx.getStorageSync('addressName'),
        cityArea: wx.getStorageSync('address').address_component.district
      })
      that.selectHistory();
    })
  },
  refresh() {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        wx.setStorageSync('position', { 'latitude': res.latitude, 'longitude': res.longitude })
        http.postReq("/community/user/", {
          cmd: 'addressEncode',
          latitude: res.latitude,
          longitude: res.longitude
        }, function (res) {
          wx.setStorageSync('addressName', res.data.formatted_addresses.recommend);
          wx.setStorageSync('address', res.data);
          that.onLoad();
        })
      }
    })
  },
  onClose(event) {
    const {
      position,
      instance
    } = event.detail, that = this;
    switch (position) {
      case 'left':
      case 'cell':
        instance.close();
        break;
      case 'right':
        Dialog.confirm({
          message: '确定删除吗？'
        }).then(() => {
          instance.close();
          http.postReq("/community/user/", {
            cmd: 'deleteHidtoryAddress',
            address_id: event.target.dataset.id
          }, function(res) {
            that.selectHistory();
          })
        });
        break;
    }
  },
  onUnload(){
    var pages = getCurrentPages();
    if (pages.length > 1) {
      var prePage = pages[pages.length - 2];
      prePage.onLoad()
    }
  },
  onShareAppMessage(){}
});