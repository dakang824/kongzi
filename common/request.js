var url = getApp().globalData.serverUrl,
  rootDocment = url.substring(0, url.length - 1);
// import Loading from '../dist/loading_top/loading';
function postReq(url, data, cb, showLoading) {
  // Loading.start();
  showLoading ? '' : wx.showNavigationBarLoading();
  new Promise((resolve, reject) => {
    if (!data.ope_id) {
      let id = wx.getStorageSync("userInfo").id;
      id ? (data.ope_id = id, resolve(data)) : getApp().login(true, () => {
        data.ope_id = wx.getStorageSync("userInfo").id;
        resolve(data);
      })
    } else {
      resolve(data);
    }
  }).then((data) => {
    wx.request({
      url: rootDocment + url,
      header: {
        'Accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': data.ope_id,
      },
      data: data,
      method: 'post',
      success(res) {
        if (res.data.status == 1 || res.data.status == 9 || res.data.status == 8) {
          return typeof cb == "function" && cb(res.data);
        } else if (res.data.status == 5) {
          wx.showModal({
            title: '温馨提示',
            content: res.data.msg,
            showCancel: false
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail(res) {
        error('网络请求失败', res)
      },
      complete(res) {
        // Loading.close();
        wx.hideNavigationBarLoading();
      }
    })
  })
}
function error(msg, err) {
  wx.request({
    url: rootDocment + '/community/user/',
    header: {
      'Accept': 'application/json',
      'content-type': 'application/json',
    },
    data: {
      cmd: 'uploadErrorInfo',
      error_info: JSON.stringify(err),
      ope_id: wx.getStorageSync("userInfo").id,
      msg: msg,
    },
    method: 'post',
    success: function(res) {

    }
  })
}
module.exports = {
  postReq: postReq,
}