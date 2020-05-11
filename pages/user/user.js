let APP = getApp(),
  http = require('../../common/request.js'), { imageurl, tabBar } = APP.globalData;
import Dialog from '../../dist/dialog/dialog';
import Util from '../../utils/util';

Page({
  data: {
    showMask: false, //遮罩层
    hasTickets: true, //是否领取抽奖券
    taskList: null,
    userInfo: null,
    url: APP.globalData.serverUrl,
    imageurl,
    tabBar,
    show: false,
  },
  jump: Util.throttle(function (e) {
    let {
      i,
      url
    } = e.currentTarget.dataset;
    if (i == 1) {
      this.data.userInfo.nickname ? http.postReq("/community/agent/", {
        cmd: 'getAgentAccount',
      }, res => {
        if (res.status == 9) {
          Dialog.alert({
            title: '温馨提示',
            message: res.msg,
            confirmButtonText: "我知道了"
          }).then(() => {});
        } else {
          wx.navigateTo({
            url: res.data.status == 3 ? '/pages/shopMall/shareGoods/main/main' : url,
          })
        }
      }) : this.setData({
        show: true
      })
    } else {
      wx.navigateTo({
        url
      })
    }
  }),
  onLoad() {
    Util.editTabbar();
    this.setData({
      showMask: false,
      userInfo: wx.getStorageSync("userInfo"),
    });
    new Promise((resolve, reject) => {
      http.postReq("/community/user/", {
        cmd: 'getMyTicketCardInfo',
      }, res => {
        this.setData({
          cardInfo: res
        });
        resolve();
      })
    }).then(() => {
      http.postReq("/community/user/", {
        cmd: "getMyStudents",
      }, res => {
        this.setData({
          childrens: res.data.reverse()
        })
      })
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: APP.globalData.servPhone,
    })
  },
  onShow() {
    this.setData({
      showMask: false,
      userInfo: wx.getStorageSync('userInfo')
    })
    this.onLoad();
  },
  getInfo() {
    wx.getUserInfo({
      success:res=> {
        let {
          nickName,
          avatarUrl,
          gender
        } = res.userInfo, that = this;
        http.postReq("/community/user/", {
          cmd: 'modifyMyInfo',
          nickname: nickName,
          avatarUrl,
          gender
        }, res => {
          APP.login(that, () => {
            that.onShow();
          });
        })
      },
    })
  },
  getTickets() {
    this.doTasks();
  },
  closeMask() {
    this.setData({
      showMask: false
    })
  },
  getTasks() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "getSignTicketTask",
    }, res => {
      if (res.data.length) {
        that.setData({
          showMask: true,
          taskList: res.data,
        })
      }
    })
  },
  doTasks() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "doTicketTask",
      task_id: that.data.taskList[0].task_id,
      ...wx.getStorageSync("position")
    }, res => {
      that.data.taskList[0].is_get = 1;
      that.setData({
        taskList: that.data.taskList
      })
    })
  },
  onPullDownRefresh() {
    let that = this;
    APP.login(this, () => {
      that.onLoad();
      wx.stopPullDownRefresh();
    })
  },
  onTabItemTap() {
    APP.globalData.disableTab ? '' : wx.switchTab({
      url: '/pages/new/index/index',
    })
  },
  onShareAppMessage() {}
})