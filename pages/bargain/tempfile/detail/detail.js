let http = require('../../../../common/request.js'),
  app = getApp();
Page({
  data: {
    ...app.globalData
  },
  jump(e) {
    wx.navigateTo({
      url: `/pages/bargain/tempfile/previewImage/previewImage?imgs=${JSON.stringify(this.data.imgs)}&index=${e.currentTarget.dataset.i}`,
    })
  },
  onLoad(e) {
    http.postReq("/community/local/", {
      cmd: "getLocalDetail",
      local_id: e.id
    }, res => {
      let arr = [], d = res.data;
      for (let key of d.intro_pics) {
        arr.push(key.path);
      }
      d.labels = d.labels.split('，');
      this.setData({
        d,
        imgs: arr,
        distance: e.distance,
      });
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.d.phone
    })
  },
  copy() {
    wx.setClipboardData({
      data: this.data.d.address,
      success(res) {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },
  onShareAppMessage() {

  }
})