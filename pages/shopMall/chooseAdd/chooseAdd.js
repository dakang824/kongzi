let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    dataList: [],
    serverUrl: APP.globalData.serverUrl,
    imgStr: "data/communityImage/",
  },
  onShow() {
    this.getMyPostAddress();
  },
  getMyPostAddress() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'getMyPostAddress',
    }, res => {
      wx.stopPullDownRefresh();
      for (let i = 0, len = res.data.length; i < len; i++) {
        res.data[i].isChoose = false;
        res.data[i].checked = false;
      }
      that.setData({
        dataList: res.data
      })
    })
  },
  chooseAddress(e) {
    let that = this,index = e.currentTarget.dataset.index;
    for (let i = 0, len = that.data.dataList.length; i < len; i++) {
      that.data.dataList[i].isChoose = (index == i);
    }

    that.setData({
      dataList: that.data.dataList
    })
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    let addList = {
      post_name: that.data.dataList[index].name,
      post_mobile: that.data.dataList[index].mobile,
      post_address: that.data.dataList[index].address
    }
    prevPage.set_addList(addList);
    wx.navigateBack({
      delta: 1,
    })
  },
  setDefault(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;

    wx.showModal({
      title: '温馨提示',
      content: '确认设为默认地址吗？',
      success(res) {
        if (res.confirm) {
          http.postReq("/community/product/", {
            cmd: 'modifyPostAddress',
            ope_id: wx.getStorageSync("userInfo").id,
            id: id,
            isdefault: 1,
          }, function(res) {
            setTimeout(() => {
              that.getMyPostAddress();
            }, 1300)
            wx.showToast({
              title: "设置成功",
              icon: "none"
            })
          })
        } else if (res.cancel) {
          that.data.dataList[index].checked = false;
          that.setData({
            dataList: that.data.dataList
          })
        }
      }
    })
  },
  del(e) {
    let that = this;
    wx.showModal({
      title: '温馨提示',
      content: '确认删除该地址吗？',
      success(res) {
        if (res.confirm) {
          http.postReq("/community/product/", {
            cmd: 'deleteMyPostAddress',
            ...e.currentTarget.dataset
          }, res => {
            that.getMyPostAddress();
          })
        }
      }
    })
  },

  onPullDownRefresh: function() {
    let that = this;
    that.getMyPostAddress()
  },
  onShareAppMessage() {}
})