let http = require('../../../../common/request.js');
import Util from '../../../../utils/util.js';
Page({
  data: {
    all: {
      start: '',
      end: ''
    },
    cash: {
      start: '',
      end: ''
    },
    consumet: {
      start: '',
      end: ''
    },
    postData: {
      cmd: 'getAgentAccountRecords',
      type: '',
      from: '',
      to: '',
      page_no: 1,
      page_size: 20
    },
    allData: [],
    cashData: [],
    consume: []
  },

  timeChange(e) {
    this.initData();
    let id = e.currentTarget.dataset.id;
    if (id == 1) {
      this.setData({
        'all.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 2) {
      if (this.compareDate(e.detail.value, this.data.all.start)) {
        this.setData({
          'all.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    } else if (id == 3) {
      this.setData({
        'cash.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 4) {
      if (this.compareDate(e.detail.value, this.data.cash.start)) {
        this.setData({
          'cash.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    } else if (id == 5) {
      this.setData({
        'consumet.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 6) {
      if (this.compareDate(e.detail.value, this.data.consumet.start)) {
        this.setData({
          'consumet.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    }

    this.loadData();
  },
  initData() {
    this.setData({
      allData: [],
      cashData: [],
      consume: [],
      'postData.page_no': 1
    })
  },
  onChange(e) {
    this.initData();
    this.setData({
      'postData.type': e.detail.index ? e.detail.index - 1 : '',
    })
    if (e.detail.index == 1) {
      this.setData({
        'postData.from': this.data.cash.start,
        'postData.to': this.data.cash.end
      })
    } else if (e.detail.index == 2) {
      this.setData({
        'postData.from': this.data.consumet.start,
        'postData.to': this.data.consumet.end
      })
    } else if (e.detail.index == 0) {
      this.setData({
        'postData.from': this.data.all.start,
        'postData.to': this.data.all.end
      })
    }
    this.loadData();
  },
  scroll(e) {
    this.setData({
      fixed: e.detail.isFixed
    })
  },
  onLoad(e) {
    wx.hideShareMenu();
    let s, d;
    try {
      s = JSON.parse(e.s);
      d = JSON.parse(e.d);
    } catch (s) {
      s = JSON.parse(decodeURIComponent(e.s));
      d = JSON.parse(decodeURIComponent(e.d));
    }

    this.setData({
      s,
      d
    });
  },
  loadData() {
    let that = this,
      {
        type
      } = this.data.postData;
    http.postReq("/community/agent/", that.data.postData, function(res) {
      // res.data.records.length ? '' : wx.showToast({
      //   title: '已加载完毕',
      //   icon: 'none'
      // })
      if (type === 0) {
        that.setData({
          cashData: that.data.cashData.concat(res.data.records)
        })
      } else if (type == 1) {
        that.setData({
          consume: that.data.consume.concat(res.data.records)
        })
      } else {
        that.setData({
          allData: that.data.allData.concat(res.data.records)
        })
      }
      wx.stopPullDownRefresh();
    }, true)
  },
  onReady: function() {
    let nowTime = Util.getNowTime(),
      preMonth = Util.getNowTime(-30);
    this.setData({
      'postData.from': preMonth,
      'postData.to': nowTime,
      nowTime: nowTime,
      all: {
        start: preMonth,
        end: nowTime
      },
      consumet: {
        start: preMonth,
        end: nowTime
      },
      cash: {
        start: preMonth,
        end: nowTime
      }
    })
    this.loadData();
  },
  compareDate(d1, d2) {
    let is = false;
    if (((new Date(d1.replace(/-/g, "\/"))) > (new Date(d2.replace(/-/g, "\/"))))) {
      is = true;
    } else {
      wx.showToast({
        title: '日期范围错误!',
        icon: 'none'
      });
    }
    return is;
  },
  onReachBottom() {
    this.setData({
      'postData.page_no': this.data.postData.page_no + 1
    })
    this.loadData();
  },
  onPullDownRefresh() {
    this.initData();
    this.loadData();
  },
  onShareAppMessage() {}
})