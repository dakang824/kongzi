const app = getApp();
module.exports = {
  request: (data) => {
    data.ope_id ? '' : data.ope_id = wx.getStorageSync("userInfo").id;
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.serverUrl + 'community/user/',
        data: data,
        method: 'post',
        success: (res) => {
          wx.hideLoading();
          if (res.data.status == 1) {
            resolve(res)
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    })
  }
}

