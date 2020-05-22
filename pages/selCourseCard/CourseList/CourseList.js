let http = require('../../../common/request.js'),
  app = getApp();
  import Util from '../../../utils/util.js';
Page({
  data: {
    fixed:false,
    selected: 0,
    show: false,
    loading: false,
    rootUrl: app.globalData.serverUrl,
   
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
    online: ['全部', '线上', '线下', '线上+线下'],
    active: 0,
    list: [{
      data: [],
      name: '全部',
      page_no:1,
      noData: false,
    },{
      data: [],
      name: '少儿英语',
      page_no:1,
      noData: false,
    },{
      data: [],
      name: '少儿编程',
      page_no:1,
      noData: false,
    }, {
      data: [],
      name: '思维训练', 
      page_no:1,
      noData: false,
    }, {
      data: [],
      name: '国学教育',
      page_no:1,
      noData: false,
    }, {
      data: [],
      name: '美术培训',
      page_no:1,
      noData: false,
    }, {
      data: [],
      name: '音乐培训',
      page_no:1,
      noData: false,
    }, {
      data: [],
      name: '舞蹈培训',
      page_no:1,
      noData: false,
    }, {
      data: [],
      name: '体育运动',
      page_no:1,
      noData: false,
    }, {
      data: [],
      name: '课外辅导',
      page_no:1,
      noData: false,
    }, {
      data: [],
      name: '其他培训',
      page_no:1,
      noData: false,
    }]
  },
  preClick() {
    wx.navigateBack({
      delta: 1
    })
  },
  TabChange(e) {
    let value=e.detail.index;
    this.setData({
      // 1 少儿英语，2 思维训练，3 国学教育，4 美术培训，5 音乐培训，6 舞蹈培训，7 体育运动，8 少儿编程，9 课外辅导，99 其他培训
      'postData.category': value ?(value==9?value:value==1?value:value==2?8:value==10?99:value-1): '',
      active:value,
    });
    this.getData();
  },
  OnInput(e) {
    this.setData({
     [`list[${this.data.active}].data[${e.currentTarget.dataset.i}].address`]: e.detail
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
      submitData,
      selected,
      select_course,active
    } = this.data, num = 0, age = submitData.age, ind = e.currentTarget.dataset.i;
    let list=this.data.list[active].data;
    if (list[ind].checked) {//取消选中项
      list[ind].checked = false;
      this.setData({
        [`list[${active}].data`]:list,
        selected: this.computerSelectCourse().length
      })
      return;
    } else if(list[ind].stock<=0){
      wx.showModal({
        title: '温馨提示',
        content: '该课程暂时没有名额。',
        showCancel: false,
        success(res) {}
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
        content: '您孩子的年龄不在课程学龄范围之内。',
        showCancel: false,
        success(res) {}
      })
      return;
    } else {
      for (let key of select_course) {
        if (key.course_id == list[ind].course_id) {
          wx.showModal({
            title: '温馨提示',
            content: '您已选过该课程。同一个孩子只允许选择一次；重复选择，机构可能会拒绝接待！您确定要继续吗？',
            success: res => {
              if (res.confirm) {
                list[ind].checked = !list[ind].checked;
                this.setData({
                  [`list[${active}].data`]:list,
                  selected: this.computerSelectCourse().length
                })
              }
            }
          })
          return;
        }
      }
    }

    list[ind].checked = !list[ind].checked;
    this.setData({
      [`list[${active}].data`]:list,
      selected: this.computerSelectCourse().length
    })
  },
  computerSelectCourse(){
    let {list}=this.data,arr=[];
    for(let key of list){
      for(let item of key.data){
        item.checked?arr.push(item):'';
      }
    }
    return arr;
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
    let {active}=this.data;
    this.setData({
      [`list[${active}].data`]:[], 
      [`list[${active}].page_no`]:1,
      [`list[${active}]noData`]:false,
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
      'postData.category': value ?(value==10?99:value): ''
    });
  },
  onClick(e){
    let {active}=this.data,{name,i}=e.currentTarget.dataset;
    this.setData({
      [`list[${active}].data[${i}].selectOption`]:name, 
    })
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
      postData,
      active
    } = this.data;
    http.postReq("/community/industry/", {
      ...postData,
      page_no:list[active].page_no
    }, res => {
      let data = res.data.records;
      if (data.length) {
        for (let item of data) {
          item.checked = false;
          item.selectOption='';
        }
        this.setData({
          [`list[${active}].data`]: list[active].data.concat(data),
          [`list[${active}].page_no`]: list[active].page_no + 1
        })
      }
      this.setData({
        [`list[${active}].noData`]: data.length == postData.page_size
      })
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
    this.data.list[this.data.active].noData ? this.getData() : '';
  },
  submit() {
    let {
      list
    } = this.data, arr = [], {
      submitData
    } = this.data;
    let t=this.computerSelectCourse();
    for (let key of t) {
      arr.push({
        course_name: key.course_name,
        course_id: key.course_id,
        address: key.address ? key.address : '',
        need_address: key.need_address,
        options:key.selectOption,
        selOptions:key.options.length
      }) 
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
          title:'请填写邮寄地址',
          icon: 'none'
        })
        return;
      }
      if(key.selOptions&&key.options==''){
        wx.showToast({
          title:'请选择课程选项',
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