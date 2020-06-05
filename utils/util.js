import tabBarTpl from '../utils/template.js';
const dateFormat = second => {
  var dd, hh, mm, ss;
  second = typeof second === 'string' ? parseInt(second) : second;
  if (!second || second < 0) {
    return;
  }
  //天
  dd = second / (24 * 3600) | 0;
  second = Math.round(second) - dd * 24 * 3600;
  //小时
  hh = second / 3600 | 0;
  second = Math.round(second) - hh * 3600;
  //分
  mm = second / 60 | 0;
  //秒
  ss = Math.round(second) - mm * 60;
  if (Math.round(dd) < 10) {
    dd = dd > 0 ? '0' + dd : '';
  }
  if (Math.round(hh) < 10) {
    hh = '0' + hh;
  }
  if (Math.round(mm) < 10) {
    mm = '0' + mm;
  }
  if (Math.round(ss) < 10) {
    ss = '0' + ss;
  }
  return {
    dd: dd,
    hh: hh,
    mm: mm,
    ss: ss
  };
}

function getTime(second) {
  var date = new Date(second),
    v = '';
  v += date.getFullYear() + '-'
  if ((date.getMonth() + 1) <= 9) {
    v += "0" + (date.getMonth() + 1);
  } else {
    v += date.getMonth() + 1;
  }
  if (date.getDate() <= 9) {
    v += "-0" + date.getDate();
  } else {
    v += '-' + date.getDate();
  }
  if (date.getHours() <= 9) {
    v += " 0" + date.getHours();
  } else {
    v += ' ' + date.getHours();
  }
  if (date.getMinutes() <= 9) {
    v += ":0" + date.getMinutes();
  } else {
    v += ':' + date.getMinutes();
  }
  v += ':' + date.getSeconds();
  return v;
}

function getElementTopHeight(args) {
  wx.createSelectorQuery().in(args.that).select(args.id).boundingClientRect().exec(res => {
    args.success(res);
  });
}

function urlEncode(param, key, encode) {
  if (param == null) return '';
  var paramStr = '';
  var t = typeof (param);
  if (t == 'string' || t == 'number' || t == 'boolean') {
    paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
  } else {
    for (var i in param) {
      var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
      paramStr += urlEncode(param[i], k, encode)
    }
  }
  return paramStr;
}

function getNowTime(t) {
  let myDate = t ? new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * t) : new Date(),
    year = myDate.getFullYear(),
    month = myDate.getMonth() + 1,
    date = myDate.getDate();
  return (year + "-" + month + "-" + date)
}

function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 5000
  }
  let _lastTime = null
  return function () {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments) //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}

function qcshare() {
  wx.onAppRoute(data => {
    let view = getCurrentPages()[getCurrentPages().length - 1],
      query = JSON.parse(JSON.stringify(view.__displayReporter.query));
    delete query.from_id;
    if (view && view.data.isNeed) {
      return;
    } else {
      view.onShareAppMessage = function () {
        return {
          path: `/${view.route}?from_id=${wx.getStorageSync('userInfo').id}${urlEncode(query)}`,
        };
      }
    }
  })
}

function sharePage(title, imageUrl) {
  let view = getCurrentPages()[getCurrentPages().length - 1],
    query = JSON.parse(JSON.stringify(view.__displayReporter.query));
  delete query.from_id;
  if (view) {
    return {
      title,
      imageUrl,
      path: `/${view.route}?from_id=${wx.getStorageSync('userInfo').id}${urlEncode(query)}`,
    };
  }
}

function uploadImg(fn) {
  wx.showLoading({
    title: '上传中...',
  });
  let that = this;
  wx.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: ((res) => {
      wx.uploadFile({
        url: that.globalData.serverUrl + "inst2/miniProgram/",
        filePath: res.tempFilePaths[0],
        name: 'file',
        formData: {
          cmd: 'uploadInstImage'
        },
        success(res) {
          fn(JSON.parse(res.data));
          wx.hideLoading();
        }
      })
    }),
    fail: ((res) => {
      wx.hideLoading();
    })
  })
}

function subscribeMessage(config) {
  wx.requestSubscribeMessage({
    tmplIds: config.tmplIds,
    success: res => {
      config.success();
    }
  })
}

function saveAddress(res, f) {
  wx.request({
    url: `${getApp().globalData.serverUrl}community/user/`,
    data: {
      cmd: 'addressEncode',
      ...res
    },
    method: 'post',
    success(res) {
      let d = res.data.data;
      wx.setStorageSync('addressName', d.address);
      wx.setStorageSync('province', d.address_component.province|| d.address_component.ad_level_1);
      wx.setStorageSync('address', d);
      f();
    }
  })
}

function saveImg(path, fn) {
  wx.downloadFile({
    url: path,
    success(res) {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success(data) {
          wx.showToast({
            title: '已保存到相册',
            icon: 'none'
          })
          fn();
        },
        fail(err) {
          wx.getSetting({
            success(res) {
              if (!res.authSetting['scope.writePhotosAlbum']) {
                wx.showModal({
                  title: '温馨提示',
                  content: '是否授开启,保存图片',
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success(res) {
                          res.authSetting['scope.writePhotosAlbum'] ? wx.showToast({
                            title: '授权成功，重新保存吧',
                            icon: 'none'
                          }) : wx.showToast({
                            title: '授权失败',
                            icon: 'none'
                          });
                        }
                      })
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                })
              }
            }
          })
        }
      })
    }
  })
}
function setTar(){
  let _tabbar = getApp().globalData.tabBar;
  let _currentPages = getCurrentPages();
  let _this = _currentPages[_currentPages.length - 1];
  let _pagePath = _this.route;
  (_pagePath.indexOf('/') != 0) && (_pagePath = '/' + _pagePath);
  for (let i in _tabbar.list) {
    _tabbar.list[i].active = false;
    (_tabbar.list[i].pagePath == _pagePath) && (_tabbar.list[i].active = true);
  }
  _this.setData({
    tabBar: _tabbar
  });
}
function editTabbar() {
  let {
    setting,
    serverUrl
  } = getApp().globalData;
  if ('showVideo2' in setting) {
    setTar();
  } else {
    new Promise((resolve, reject) => {
      wx.request({
        url: `${serverUrl}community/user/`,
        method: 'post',
        data: {
          cmd: 'getSystemSettings'
        },
        success: res => {
          getApp().globalData.setting = res.data.data;
          resolve(res.data.data);
        }
      })
    }).then((res) => {
      let {setting,tabBar}=getApp().globalData;
      if(setting.showVideo2){
        // tabBar.list.splice(1,0,{
        //   "active": false,
        //   "pagePath": "/pages/video/video",
        //   "iconPath": "/imgs/child.png",
        //   "selectedIconPath": "/imgs/child_active.png",
        //   "text": "萌娃"
        // }) 
        getApp().globalData.tabBar=tabBar;
      }
      // if(setting.showVideo2==0){
      //   tabBar.list.splice(1,1);
      //   getApp().globalData.tabBar=tabBar;
      // }
      setTar();
    })

  }
}

module.exports = {
  dateFormat,
  throttle,
  saveImg,
  urlEncode,
  getNowTime,
  qcshare,
  uploadImg,
  saveAddress,
  sharePage,
  subscribeMessage,
  getElementTopHeight,
  getTime,
  setTar,
  editTabbar
}