let APP = getApp();
let http = require('../../../common/request.js');
import Util from '../../../utils/util.js';
Page({
  data: {
    fixed: false,
    start: false,
    awards_today: [],
    draw_second: null, //倒计时的秒数
    second: null,
    hourTime: "",
    minuteTime: "",
    secondTime: "",
    timer: null, //倒计时
    isTime: 0, //0-未到  1--已到
    imgStr: "data/communityImage/", //图片固定格式
    serverUrl: APP.globalData.serverUrl, //服务器地址
    page_no: 1,
    noMore: false,
    showNodata: false,

    showChooseBox: false,
    dataType1: [{
      title: "全部",
      type: ""
    }, {
      title: "天天奖",
      type: 1
    }, {
      title: "周大奖",
      type: 2
    }],
    dataType2: [{
      name: "全部",
      id: ""
    }],
    type1: 0,
    type2: 0,
    prizeSort: true,
    timeSort: true,
    countSort: true,
    show1: false,
    show2: false,
    show3: false,
    show4: true,
    award_name: "", //搜索内容
    award_type: "", //查询类型的id 使用‘，’隔开
    order_by: "", //1:奖品价值升 2：奖品价值降  3：集齐时间升 4：集齐时间降  5：开奖时间升  6开奖时间降
    draw_type: "", ////抽奖类型  1:天天奖  2：周大奖（特定奖）3：即开奖 
  },
  onPageScroll(e) {
    this.setData({
      fixed: e.scrollTop > this.data.top
    })
  },
  countDown(t) {
    let that = this,
      start = new Date(),
      end = new Date(t);
    this.setData({
      t: parseInt(end.getTime() - start.getTime())
    })
  },
  getNowTime(t) {
    let myDate = t ? new Date(new Date().getTime() + 24 * 60 * 60 * 1000) : new Date(),
      year = myDate.getFullYear(),
      month = myDate.getMonth() + 1,
      date = myDate.getDate();
    return (year + "-" + month + "-" + date)
  },
  onLoad(options) {
    this.countDown(this.getNowTime().replace(/-/g, "/") + ' 20:30:00');
    this.getTodayDate();
    this.getDrawTypes();
    Util.getElementTopHeight({
      that:this,
      id: "#fixed",
      success:(res) => {
        this.setData({
          top: res[0].top
        })
      }
    })
  },
  getDrawTypes() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getAwardTypes',
    }, res => {
      that.setData({
        dataType2: that.data.dataType2.concat(res.data)
      })
      for (let i = 0, len = that.data.dataType2.length; i < len; i++) {
        if (i == 0) {
          that.data.dataType2[0].isChoose = true;
        } else {
          that.data.dataType2[i].isChoose = false;
        }
      }
      that.setData({
        dataType2: that.data.dataType2
      })

    })
  },
  inputContent(e) {
    this.setData({
      award_name: e.detail
    })
  },
  onChange(e) {
    let t = e.detail,
      h = t.days * 24 + t.hours,
      m = t.minutes,
      s = t.seconds;
    this.setData({
      timeData: {
        hours: h < 10 ? '0' + h : h,
        minutes: m < 10 ? '0' + m : m,
        seconds: s < 10 ? '0' + s : s
      }
    });
    (h == 0 && m == 0 && s == 0) ? this.countDown(this.getNowTime(t).replace(/-/g, "/") + ' 20:30:00'): '';
  },
  getTodayDate() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getTodayAwardActMoreV21',
      page_no: that.data.page_no,
      page_size: 10,
      draw_type: that.data.draw_type,
      award_name: that.data.award_name, //搜索内容
      award_type: that.data.award_type, //查询类型的id 使用‘，’隔开
      order_by: that.data.order_by, //1:奖品价值升 2：奖品价值降  3：集齐时间升 4：集齐时间降  5：开奖时间升  6开奖时间降
    }, function(res) {
      let records = res.data.records;
      wx.stopPullDownRefresh();
      for (let key of records) {
        let day = Math.floor(Date.parse(new Date()) - Date.parse(key.draw_time.slice(0, 10).replace(/-/g, "/"))) / (24 * 3600 * 1000);
        key.day = -(Math.floor(day));
      }
      that.setData({
        awards_today: that.data.awards_today.concat(records),
        page_no: that.data.page_no + 1,
        noMore: records.length == 0,
      });
    })
  },
  choose() {
    this.data.showChooseBox = !this.data.showChooseBox;
    this.setData({
      showChooseBox: this.data.showChooseBox
    })
  },
  reset() {
    for (let i = 0, len = this.data.dataType2.length; i < len; i++) {
      if (i == 0) {
        this.data.dataType2[0].isChoose = true;
      } else {
        this.data.dataType2[i].isChoose = false;
      }
    }
    this.setData({
      showChooseBox: false,
      order_by: "",
      draw_type: "",
      award_type: "",
      dataType2: this.data.dataType2,
      type1: 0,
      page_no: 1,
      awards_today: []
    })
    this.getTodayDate();
  },
  serachMore() {
    this.searchBtn();
  },
  searchBtn() {
    this.setData({
      showChooseBox: false,
      prizeSort: true,
      timeSort: true,
      countSort: true,
      show1: false,
      show2: false,
      show3: false,
      show4: false,
      order_by: "",
      page_no: 1,
      awards_today: [],
    })
    this.getTodayDate();
  },
  choose1(e) {
    let index = e.target.dataset.index;
    this.setData({
      type1: index,
      draw_type: this.data.dataType1[index].type
    })
  },
  choose2(e) {
    let index = e.target.dataset.index;
    let that = this;
    let arr = [];
    if (index == 0) {
      for (let i = 0, len = this.data.dataType2.length; i < len; i++) {
        if (i == 0) {
          this.data.dataType2[i].isChoose = true;
        } else {
          this.data.dataType2[i].isChoose = false;
        }
      }
      this.setData({
        dataType2: this.data.dataType2,
        award_type: "",
      })
    } else {

      this.data.dataType2[index].isChoose = !this.data.dataType2[index].isChoose;
      if (this.data.dataType2.some(function(item, i, array) {
          return item.isChoose
        })) {
        this.data.dataType2[0].isChoose = false;
        for (let i = 1, len = this.data.dataType2.length; i < len; i++) {
          if (this.data.dataType2[i].isChoose) {
            arr.push(this.data.dataType2[i].no)
          }
        }
      } else {
        this.data.dataType2[0].isChoose = true;
        this.setData({
          award_type: "",
        })
      }
      this.setData({
        dataType2: this.data.dataType2,
        award_type: arr.join(','),
      })
    }
  },
  clickDefault() {
    this.setData({
      prizeSort: true,
      timeSort: true,
      countSort: true,
      show1: false,
      show2: false,
      show3: false,
      show4: true,
      award_name: "",
      order_by: "",
      page_no: 1,
      awards_today: [],
    })
    this.getTodayDate();
  },
  clickPrize() {
    this.data.prizeSort = !this.data.prizeSort;
    this.setData({
      prizeSort: this.data.prizeSort,
      timeSort: true,
      countSort: true,
      show1: true,
      show2: false,
      show3: false,
      show4: false,
      award_name: "",
      page_no: 1,
      awards_today: [],
    })
    if (this.data.prizeSort) {
      this.setData({
        order_by: 2,
      })
    } else {
      this.setData({
        order_by: 1,
      })
    }
    this.getTodayDate();
  },
  clickTime() {
    this.data.timeSort = !this.data.timeSort;
    this.setData({
      prizeSort: true,
      timeSort: this.data.timeSort,
      countSort: true,
      show1: false,
      show2: true,
      show3: false,
      show4: false,
      award_name: "",
      page_no: 1,
      awards_today: [],
    })
    if (this.data.timeSort) {
      this.setData({
        order_by: 4,
      })
    } else {
      this.setData({
        order_by: 3,
      })
    }
    this.getTodayDate();
  },
  clickCount() {
    this.data.countSort = !this.data.countSort;
    this.setData({
      prizeSort: true,
      timeSort: true,
      countSort: this.data.countSort,
      show1: false,
      show2: false,
      show3: true,
      show4: false,
      award_name: "",
      page_no: 1,
      awards_today: [],
    })
    if (this.data.countSort) {
      this.setData({
        order_by: 6,
      })
    } else {
      this.setData({
        order_by: 5,
      })
    }
    this.getTodayDate();
  },
  onClose() {
    this.setData({
      showChooseBox: false
    })
  },
  onPullDownRefresh: function() {
    let that = this;
    that.setData({
      awards_today: [],
      page_no: 1,
      noMore: false,
      award_type: "",
      award_name: "",
      order_by: "",
    })
    this.getTodayDate();
  },
  onReachBottom: function() {
    let that = this;
    this.getTodayDate();
  },
  onShareAppMessage() {}
})