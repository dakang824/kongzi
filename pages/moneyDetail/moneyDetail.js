import Notify from '../../dist/notify/notify';
let http = require('../../common/request.js');
import Util from '../../utils/util.js';
Page({
  data: {
    all: {
      start: '',
      end: ''
    },
    profit: {
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
    recharge: {
      start: '',
      end: ''
    },
    subsidy: {
      start: '',
      end: ''
    },
    refund: {
      start: '',
      end: ''
    },
    postData: {
      cmd: 'queryCashDetail',
      type: '',
      from: '',
      to: ''
    }
  },

  timeChange(e) {
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
        'profit.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 4) {
      if (this.compareDate(e.detail.value, this.data.profit.start)) {
        this.setData({
          'profit.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    } else if (id == 5) {
      this.setData({
        'cash.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 6) {
      if (this.compareDate(e.detail.value, this.data.cash.start)) {
        this.setData({
          'cash.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    } else if (id == 7) {
      this.setData({
        'consumet.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 8) {
      if (this.compareDate(e.detail.value, this.data.consumet.start)) {
        this.setData({
          'consumet.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    } else if (id == 9) {
      this.setData({
        'recharge.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 10) {
      if (this.compareDate(e.detail.value, this.data.recharge.start)) {
        this.setData({
          'recharge.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    } else if (id == 11) {
      this.setData({
        'subsidy.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 12) {
      if (this.compareDate(e.detail.value, this.data.subsidy.start)) {
        this.setData({
          'subsidy.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    } else if (id == 13) {
      this.setData({
        'refund.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 14) {
      if (this.compareDate(e.detail.value, this.data.refund.start)) {
        this.setData({
          'refund.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    } else if (id == 15) {
      this.setData({
        'allBack.start': e.detail.value,
        'postData.from': e.detail.value
      });
    } else if (id == 16) {
      if (this.compareDate(e.detail.value, this.data.allBack.start)) {
        this.setData({
          'allBack.end': e.detail.value,
          'postData.to': e.detail.value
        });
      }
    }

    this.loadData();
  },
  onChange(e) {
    this.setData({
      'postData.type': e.detail.index ? e.detail.index : ''
    })
    if (e.detail.index == 1) {
      this.setData({
        'postData.from': this.data.profit.start,
        'postData.to': this.data.profit.end
      })
    } else if (e.detail.index == 2) {
      this.setData({
        'postData.from': this.data.cash.start,
        'postData.to': this.data.cash.end
      })
    } else if (e.detail.index == 3) {
      this.setData({
        'postData.from': this.data.consumet.start,
        'postData.to': this.data.consumet.end
      })
    } else if (e.detail.index == 4) {
      this.setData({
        'postData.from': this.data.refund.start,
        'postData.to': this.data.refund.end
      })
    } else if (e.detail.index == 5) {
      this.setData({
        'postData.from': this.data.recharge.start,
        'postData.to': this.data.recharge.end
      })
    } else if (e.detail.index == 6) {
      this.setData({
        'postData.from': this.data.subsidy.start,
        'postData.to': this.data.subsidy.end
      })
    } else if (e.detail.index ==7) {
      this.setData({
        'postData.from': this.data.allBack.start,
        'postData.to': this.data.allBack.end
      })
    }else if (e.detail.index == 0) {
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
  onLoad: function(e) {
    this.setData({
      totalMoney: e.totalMoney,
      w_amount: wx.getStorageSync('userInfo').w_amount
    })
  },
  loadData() {
    let that = this;
    http.postReq("/community/user/", that.data.postData, function(res) {
      for (let item of res.data) {
        item.time = item.time.slice(0, 19)
      }
      if (that.data.postData.type == 1) {
        that.setData({
          profitData: res.data
        })
      } else if (that.data.postData.type == 2) {
        that.setData({
          cashData: res.data
        })
      } else if (that.data.postData.type == 3) {
        that.setData({
          consume: res.data
        })
      } else if (that.data.postData.type == 4) {
        that.setData({
          refundData: res.data
        })
      } else if (that.data.postData.type == 5) {
        that.setData({
          cashData: res.data
        })
      } else if (that.data.postData.type == 6) {
        that.setData({
          subsidyData: res.data
        })
      } else if (that.data.postData.type == 7) {
        that.setData({
          allBackData: res.data
        })
      } else {
        that.setData({
          allData: res.data
        })
      }
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
      profit: {
        start: preMonth,
        end: nowTime
      },
      cash: {
        start: preMonth,
        end: nowTime
      },
      consumet: {
        start: preMonth,
        end: nowTime
      },
      recharge: {
        start: preMonth,
        end: nowTime
      },
      subsidy: {
        start: preMonth,
        end: nowTime
      },
      refund: {
        start: preMonth,
        end: nowTime
      },
      allBack:{
        start: preMonth,
        end: nowTime
      },
    })
    this.loadData();
  },
  compareDate(d1, d2) {
    let is = false;
    if (((new Date(d1.replace(/-/g, "\/"))) > (new Date(d2.replace(/-/g, "\/"))))) {
      is = true;
    } else {
      Notify('日期范围错误，请重新选择!');
    }
    return is;
  },
  onShareAppMessage(){}
})