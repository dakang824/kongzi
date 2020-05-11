let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    wait_data: [], //待抽奖数据
    serverUrl: APP.globalData.serverUrl, //服务器地址
    page_no:1,
    noMore: false,
    active: 0,
    draw_type: "", ////抽奖类型  1:天天奖  2：周大奖（特定奖）3：即开奖 
    showChooseBox: false,
    dataType1: [{
      title: "全部",
      type: ""
    }, {
      title: "即开奖",
      type: 3
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
    order_by: "", //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
  },
  onLoad: function(options) {
    this.waitPrizeDate();
    this.getDrawTypes();
  },
  getDrawTypes() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: 'getAwardTypes',
    }, function(res) {
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
  onChange(event) {
    this.setData({
      checked: event.detail
    });
  },
  initData() {
    this.setData({
      award_name: "",
      order_by: "",
      award_type: "",
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
      type1: 0
    })
    this.waitPrizeDate();
  },
  inputContent(e) {
    this.setData({
      award_name: e.detail
    })
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
      wait_data: [],
    })
    this.waitPrizeDate();

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
      order_by: "",
      award_name: "",
      wait_data: [],
      page_no: 1,
    })
    this.waitPrizeDate();
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
      wait_data: [],
      page_no: 1,
    })
    if (this.data.prizeSort) {
      this.setData({
        order_by: 2, //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
      })
    } else {
      this.setData({
        order_by: 1, //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
      })
    }
    this.waitPrizeDate();
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
      wait_data: [],
      page_no: 1,
    })
    if (this.data.timeSort) {
      this.setData({
        order_by: 4, //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
      })
    } else {
      this.setData({
        order_by: 3, //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
      })
    }
    this.waitPrizeDate();
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
      wait_data: [],
      page_no: 1,
    })
    if (this.data.countSort) {
      this.setData({
        order_by: 6, //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
      })
    } else {
      this.setData({
        order_by: 5, //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
      })
    }
    this.waitPrizeDate();
  },
  waitPrizeDate() {
    let that = this, { latitude, longitude}=wx.getStorageSync('position');
    http.postReq("/community/award/", {
      cmd: 'getUndrawAwardActMore',
      page_no: that.data.page_no,
      page_size: 10,
      latitude,
      longitude,
      draw_type: that.data.draw_type,
      award_name: that.data.award_name, //搜索内容
      award_type: that.data.award_type, //查询类型的id 使用‘，’隔开
      order_by: that.data.order_by, //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
    }, function(res) {
      wx.stopPullDownRefresh();
      if (res.data.records.length == 0) {
        wx.showToast({
          title: "~没有更多数据~",
          icon: "none"
        })
      } else {
        that.setData({
          wait_data: that.data.wait_data.concat(res.data.records),
          page_no: that.data.page_no + 1
        });
      }
    })
  },
  //去抽奖详情
  goDetail(e) {
    let options = e.currentTarget.dataset;

    wx.navigateTo({
      url: "/pages/new/luckyDetail/luckyDetail?award_id=" + options.awardid + "&tickets=" + options.tickets + "&draw_id=" + options.drawid + "&draw_type=" + options.drawtype
    })
  },
  onClose() {
    this.setData({
      showChooseBox: false
    })
  },
  onPullDownRefresh: function() {
    let that = this;
    that.setData({
      page_no:1,
      wait_data:[]
    })
    that.waitPrizeDate();
  },
  onReachBottom: function() {
   
    this.waitPrizeDate();
  },
  onShareAppMessage() {}
})