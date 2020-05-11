let http = require('../../../common/request.js'),
  app = getApp();
Page({
  data: {
    selected: 0,
    show: false,
    loading: false,
    rootUrl: app.globalData.serverUrl,
    noData: false,
    postData: {
      cmd: 'queryCardCourses',
      type: '',
      category: '',
      online: '',
      condition: '',
      page_size: 10,
      page_no: 1
    },
    submitData: {
      cmd: "selectCourses",
      card_code: '',
      courses: [],
      name: '',
      age: 1,
      gender: '男',
      mobile: ''
    },
    activeStatus: ["全部", "体验课", "短课包", "正式课"],
    category: ['全部', '少儿英语', '思维训练', '国学教育', '美术培训', '音乐培训', '舞蹈培训', '体育运动', '少儿编程', '课外辅导','其他培训'],
    online: ['全部', '线上', '线下', '线上+线下'],
    list: []
  },
  preClick() {
    wx.navigateBack({
      delta: 1
    })
  },
  OnInput(e) {
    let {
      list
    } = this.data, {
      i
    } = e.currentTarget.dataset;
    list[i].address = e.detail;
    this.setData({
      list: list
    })
  },
  getSelCourse() {
    let {
      card_code
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: "getMyCardInfo",
      card_code
    }, res => {
      this.setData({
        select_course: res.data.select_course
      })
    })
  },
  checkedChange(e) {
    let {
      list,
      submitData,
      selected,
      select_course
    } = this.data, num = 0, age = submitData.age, ind = e.currentTarget.dataset.i;
    if(list[ind].checked){
      list[ind].checked = false;
      for (let key of list) {
        key.checked ? num++ : '';
      }
      this.setData({
        list,
        selected: num
      })
      return;
    }else if (submitData.limit_count <= selected) {
      wx.showToast({
        title: '所选课程不能大于' + submitData.limit_count + '个',
        icon: 'none'
      })
      return;
    } else if (!(age >= list[ind].min_age && age <= list[ind].max_age)) {
      wx.showModal({
        title: '温馨提示',
        content: '所选课程的年龄，不在您孩子的年龄范围之内',
        showCancel: false,
        success(res) {}
      })
      return;
    } else {
      for (let key of select_course) {
        if (key.course_id == list[ind].course_id) {
          wx.showModal({
            title: '温馨提示',
            content: '您已经选过该课程，是否再次选择。',
            success:res=>{
              if (res.confirm) {
                list[ind].checked = !list[ind].checked;
                for (let key of list) {
                  key.checked ? num++ : '';
                }
                this.setData({
                  list,
                  selected: num
                })
              }
            }
          })
          return;
        }
      }
    }

    list[ind].checked = !list[ind].checked;
    for (let key of list) {
      key.checked ? num++ : '';
    }
    this.setData({
      list,
      selected: num
    })
  },
  search(e) {
    this.setData({
      'postData.condition': e.detail
    })
  },
  setSearchValue(e) {
    this.onPullDownRefresh();
  },
  onPullDownRefresh() {
    this.setData({
      list: [],
      'postData.page_no': 1,
      noData: false,
      show: false
    })
    this.getData();
    wx.stopPullDownRefresh();
  },
  clearSearch(e) {
    this.setData({
      'postData.condition': ''
    });
    this.getData();
  },
  reset() {
    let {
      postData
    } = this.data;
    postData.type = '';
    postData.category = '';
    postData.online = '';
    postData.condition = '';
    postData.page_no = 1;
    this.setData({
      postData,
      show: false
    });
    this.onPullDownRefresh();
  },
  typeChange(e) {
    let {
      value
    } = e.currentTarget.dataset;
    this.setData({
      'postData.type': value ? value : ''
    });
  },
  categoryChange(e) {
    let {
      value
    } = e.currentTarget.dataset;
    this.setData({
      'postData.category': value ? value : ''
    });
  },
  onlineChange(e) {
    let {
      value
    } = e.currentTarget.dataset;
    this.setData({
      'postData.online': value ? value : ''
    });
  },
  getData() {
    let {
      list,
      postData
    } = this.data, {
      page_no
    } = postData;
    http.postReq("/community/industry/", postData, res => {
      let data = res.data.records;
      if (data.length) {
        for (let item of data) {
          item.checked = false;
        }
        this.setData({
          list: list.concat(data),
          noData: data.length == postData.page_size,
          'postData.page_no': page_no + 1
        })
      }
    })
  },
  getHeight(ele, fun) {
    var tabsHeight = '';
    wx.createSelectorQuery().select(ele).boundingClientRect(function (rect) {
      fun(rect)
    }).exec();
    return tabsHeight;
  },
  onLoad(e) {
    this.getHeight('#headTopNav', r => {
      this.setData({
        scrollHeight: app.globalData.systemInfo.screenHeight - (app.globalData.Custom.height + app.globalData.Custom.top + r.height + 60),
        submitData: JSON.parse(e.d)
      })
    })
  },
  onShow() {
    this.getData();
    this.getSelCourse();
  },
  onChange(event) {
    let ind = event.detail.index;
    this.setData({
      'getActsNearby.course_type': ind ? ind : ''
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
  onReachBottom() {
    this.data.noData ? this.getData() : '';
  },
  submit() {
    let {
      list
    } = this.data, arr = [], {
      submitData
    } = this.data;
    for (let key of list) {
      key.checked ? arr.push({
        course_name: key.course_name,
        course_id: key.course_id,
        address: key.address ? key.address : '',
        need_address: key.need_address
      }) : '';
    }
    if (arr.length == 0) {
      wx.showToast({
        title: '请选择课程',
        icon: 'none'
      })
      return;
    }
    for (let key of arr) {
      if (key.need_address && key.address == '') {
        wx.showToast({
          title: '请填写课程名字为：' + key.course_name + '的地址',
          icon: 'none'
        })
        return;
      }
    }
    submitData.courses = arr;
    http.postReq("/community/industry/", submitData, res => {
      wx.showToast({
        title: '提交成功',
        mask: true,
        duration: 2000
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 2
        })
      }, 2000)
    })
  },
  onShareAppMessage() {}
});