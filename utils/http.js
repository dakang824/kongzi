const APP = getApp();
function getHttp(url, data, callback) {

  url = APP.globalData.serverUrl + url;

  wx.request({
    url,
    data,
    method: 'POST',
    header: {
      'content-type': 'application/json'
    },
    success: function(res) {

      if (res.data.status === 1) {
        callback(res.data);
      } else {
        myAlert("网络请求失败", false);
      }
    },
    fail: function() {
      // wx.hideLoading();
      myAlert("网络请求失败", false);
    }
  });
}



function myAlert(content, showCancel) {
  wx.showModal({
    title: '提示',
    mask: true,
    confirmColor: "#849DE8",
    showCancel,
    content,
  })
}


module.exports = {
  getHttp,
  myAlert,

}