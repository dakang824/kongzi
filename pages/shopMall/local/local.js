import http from '../../../common/request';
Page({
  data: {
    dataList: [], //待抽奖数据
    serverUrl: getApp().globalData.serverUrl,
    noMore: false,
    active: 0,
    showChooseBox: false,
    prizeSort: true,
    timeSort: true,
    countSort: true,
    postData: {
      page_no: 1,
      condition: '', //搜索内容
      orderby: '1' //1:综合  2：热度升  3：热度降  4：最新升  5：最新降 6：价格升  7：价格降
    }
  },
  initData() {
    this.setData({
      dataList: [],
      'postData.orderby': '',
      'postData.condition': '',
      'postData.page_no': 1,
    })
  },
  onLoad() {
    this.getData();
  },
  inputContent(e) {
    this.setData({
      'postData.condition': e.detail
    })
  },
  serach() {
    this.setData({
      dataList: [],
      'postData.page_no': 1
    })
    this.getData();
  },
  tabsClick(e) {
    this.initData();
    let {
      i
    } = e.currentTarget.dataset;
    this.setData({
      active: i
    });
    if (i == 1) {
      let prizeSort = !this.data.prizeSort;
      this.setData({
        prizeSort,
        countSort: true,
        timeSort: true,
        'postData.orderby': prizeSort ? 3 : 2
      });
    } else if (i == 2) {
      let timeSort = !this.data.timeSort;
      this.setData({
        timeSort,
        prizeSort: true,
        countSort: true,
        'postData.orderby': timeSort ? 5 : 4
      });
    } else if (i == 3) {
      let countSort = !this.data.countSort;
      this.setData({
        countSort,
        timeSort: true,
        prizeSort: true,
        'postData.orderby': countSort ? 7 : 6
      });
    } else if (i == 0) {
      this.setData({
        countSort: true,
        timeSort: true,
        prizeSort: true,
        'postData.orderby': 1
      });
    }
    this.getData();
  },
  getData() {
    http.postReq("/community/coupon/", {
      cmd: 'queryFunTicket',
      ...this.data.postData,
      page_size: 10,
    }, res => {
      wx.stopPullDownRefresh();
      if (res.data.records.length) {
        for (let key of res.data.records) {
          key.seconds = (new Date(key.end_time.slice(0, 19).replace(/-/g, '/')).getTime() - Date.parse(new Date()));
        }
        this.setData({
          dataList: this.data.dataList.concat(res.data.records),
          'postData.page_no': this.data.postData.page_no + 1
        });
      } else {
        wx.showToast({
          title: "~没有更多数据~",
          icon: "none"
        })
      }
    })
  },
  onPullDownRefresh() {
    this.initData();
    this.getData();
  },
  onReachBottom() {
    this.getData();
  },
  onShareAppMessage() {}
})