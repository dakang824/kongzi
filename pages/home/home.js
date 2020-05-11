let app = getApp(),
  utils = require('../../utils/util.js'),
  http = require('../../common/request.js');
Page({
  data: {
    autho: false,
    authoaddress:false,
    rootUrl: app.globalData.serverUrl,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    active: 0,
    show: false,
    indicator: 'rgba(255,255,255,.3)',
    indicatorActive: 'rgba(255,255,255,1)',
    currentValue: 30,
    toView: 'red',
    scrollTop: 100,
    ope_id: '',
    addressName: '',
    titLoading: true,
  },
  onPullDownRefresh() {
    this.data.titLoading = false;
    this.getData();
    wx.stopPullDownRefresh();
  },
  //采集顶部图片点击次数
  clickTopimg(e) {
    http.postReq("/community/user/", {
      cmd: 'clickTopImage',
      ad_id: e.currentTarget.dataset.id
    }, function(res) {
      console.log(res);
    })
  },
  autho() {
    let that = this;
    wx.getUserInfo({
      lang: 'zh_CN',
      success: res => {
        let data = res.userInfo;
        http.postReq("/community/user/", {
          cmd: 'modifyMyInfo',
          nickname: encodeURIComponent(data.nickName),
          gender: data.gender,
          avatarUrl: data.avatarUrl
        }, function(res) {
          that.setData({
            autho: false
          })
          that.onLoad();
        })
      }
    })
  },
  onShow() {
    let that=this;
    if (wx.getStorageSync('position').latitude) {
      this.getData();
    }
  },
  agreeAddress(){
    let that=this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          that.setData({ authoaddress: true })
        } else {
          that.setData({ authoaddress: false })
          that.onLoad();
        }
      }
    })
  },
  onLoad(e) {
    let that = this;
    this.login(function(){
      wx.getLocation({
        type: 'gcj02',
        success(res) {
          that.getloca(res);
        },
        fail(res) {
          wx.getSetting({
            success(res) {
              if (!res.authSetting['scope.userLocation']) {
                that.setData({ authoaddress: true })
              }
            },
            fail(res) {
              console.log('调用失败')
            }
          })
        }
      })

      if (e.market_id && e.source == 1) {
        http.postReq("/community/user/", {
          cmd: 'scanMarketQRGetUserOrdersInfo',
          market_id: e.market_id,
          source: e.source,
          user_id: wx.getStorageSync('userInfo').id
        }, function (res) {
          !res.hasPayOrders?wx.navigateTo({
            url: '/pages/order/order',
          }):'';
        })
      }
    });
  },
  login(fun) {
    let that = this;
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: app.globalData.serverUrl + 'community/user/',
          data: {
            cmd: 'login',
            code: res.code
          },
          method: 'post',
          success: function (res) {
            let data = res.data.data;
            if (!data.nickname && !data.pic_path) {
              that.setData({
                autho: true
              })
            }
            data.nickname = decodeURIComponent(data.nickname);
            res.data.status == 1 ? (app.globalData.userInfo = res.data.data, wx.setStorageSync('userInfo', res.data.data)) : Toast.fail(res.data.msg);
            fun();
          },
          fail: function (res) {
            Toast.fail(res.data.msg);
          }
        })
      }
    })
  },
  getloca(res){
    let that = this;
    if(!res.latitude){
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            that.setData({ authoaddress: true })
          }
        },
        fail(res) {
          console.log('调用失败')
        }
      })
    }else{
      wx.setStorageSync('position', {
        'latitude': res.latitude,
        'longitude': res.longitude
      })
      http.postReq("/community/user/", {
        cmd: 'addressEncode',
        latitude: res.latitude,
        longitude: res.longitude
      }, function (res) {
        wx.setStorageSync('addressName', res.data.formatted_addresses.recommend);
        wx.setStorageSync('address', res.data);
        that.getData();
      })
    }
  },
  getData() {
    let that = this;
    http.postReq("/community/user/", {
      cmd: 'homePageInit',
      ...wx.getStorageSync('position')
    }, function(res) {
      let data = res.data,
        name = ["小学辅导", "初中辅导", "高中辅导", "少儿英语", "幼儿早教", "国学教育", "语言培训", "美术培训", "音乐培训", "舞蹈培训", "体育运动", "书法培训", "棋类培训", "能力训练", "托班辅导", "其它"],
        arr = [], near=data.around_insts.sort(that.compare('mindis')).slice(0,5);
      for (let item of near) {
        item.maxdis = (item.maxdis / 1000).toFixed(1);
        item.mindis = (item.mindis / 1000).toFixed(1);
        for (let i = 0; i < 15; i++) {
          if ((item.category & (1 << i)) > 0) {
            arr.push(name[i]);
          }
        }
        item.category = arr;
        arr = [];
      }
      data['around_insts']=near;
      
      for (let item of data.act_recommend) {
        item.mindis = (item.mindis / 1000).toFixed(1);
        item.maxdis = (item.maxdis / 1000).toFixed(1)
        item.Stime = utils.dateFormat(item.startDiff);
        item.Etime = utils.dateFormat(item.endDiff);
      }
      that.setData({
        data: res.data,
        addressName: wx.getStorageSync('addressName'),
        ope_id: wx.getStorageSync("userInfo").id,
        titLoading: true
      })
    }, that.data.titLoading)
  },
  compare(property){
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
    }
  },
  onShareAppMessage() {}
});