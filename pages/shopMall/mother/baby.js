import Loading from '../../../dist/loading_top/loading';
import http from '../../../common/request';
Page({
  data: {
    dataList: [],
    ...getApp().globalData,
    page_no: 2,
    noMore: false,
    active: 0,
    showChooseBox: false,
    prizeSort: true,
    timeSort: true,
    countSort: true,
    postData: {
      page_no: 1,
      condition: '', //搜索内容
      orderby: '1', //1:综合  2：热度升  3：热度降  4：最新升  5：最新降 6：价格升  7：价格降
      noData:true,
    }
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
  initData() {
    this.setData({
      dataList: [],
      'postData.orderby': '',
      'postData.condition': '',
      'postData.page_no': 1,
    })
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
    }
    this.getData();
  },
  getData() {
    http.postReq("/community/product/", {
      cmd: 'queryProductsWithType',
      ...this.data.postData,
      page_size: 10,
    }, res => {
      wx.stopPullDownRefresh();
      if (res.data.records.length) {
        // for (let i = 0, len = res.data.records.length; i < len; i++) {
        //   res.data.records[i].seconds = that.timestamp(res.data.records[i].end_time)
        // }
        this.setData({
          dataList: this.data.dataList.concat(res.data.records),
          'postData.page_no': this.data.postData.page_no + 1,
          'postData.noData': res.data.records.length==10
        });
      } else {
        wx.showToast({
          title: "~没有更多数据~",
          icon: "none"
        })
      }
    })
  },
  //日期转时间戳--得到多少秒
  timestamp(time) {
    return (new Date(time.slice(0, 19).replace(/-/g, '/')).getTime() - Date.parse(new Date()))
  },
  onPullDownRefresh() {
    this.initData();
    this.getData();
  },
  onReachBottom() {
    this.getData();
  },
  onPageScroll(e) {
    this.setData({
      fixed: e.scrollTop > this.data.top
    })
  },
  onShareAppMessage() {}
})