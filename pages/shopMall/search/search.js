let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    dataList: [], //待抽奖数据
    serverUrl: APP.globalData.serverUrl, //服务器地址
    page_no:2,
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
    condition: "", //搜索内容
    award_type: "", //查询类型的id 使用‘，’隔开
    orderby: "1", //1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降
  },
  onLoad: function(options) {
    this.queryProducts();
  },
  
  inputContent(e) {
    this.setData({
      condition: e.detail
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
      orderby: "",
      page_no: 2,
      dataList: [],
    })
    this.queryProducts();

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
      orderby: "1",
      condition: "",
      dataList: [],
      page_no: 2,
    })
    this.queryProducts();
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
      condition: "",
      dataList: [],
      page_no: 2,
    })
    if (this.data.prizeSort) {
      this.setData({
        orderby: 7, //"1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降 6:热度升  7热度降
      })
    } else {
      this.setData({
        orderby: 6, //"1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降 6:热度升  7热度降
      })
    }
    this.queryProducts();
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
      condition: "",
      dataList: [],
      page_no: 2,
    })
    if (this.data.timeSort) {
      this.setData({
        orderby: 3, //"1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降 6:热度升  7热度降
      })
    } else {
      this.setData({
        orderby: 2, //"1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降 6:热度升  7热度降
      })
    }
    this.queryProducts();
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
      condition: "",
      dataList: [],
      page_no: 2,
    })
    if (this.data.countSort) {
      this.setData({
        orderby: 5, //"1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降 6:热度升  7热度降
      })
    } else {
      this.setData({
        orderby: 4, //"1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降 6:热度升  7热度降
      })
    }
    this.queryProducts();
  },
  queryProducts() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'queryProducts',
      page_no: 1,
      page_size: 10,
      condition: that.data.condition, //搜索内容
      orderby: that.data.orderby, //"1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降 6:热度升  7热度降
    }, function(res) {
      wx.stopPullDownRefresh();
        that.setData({
          dataList: res.data.records,
        });
      
    })
  },
  pullUp(){
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'queryProducts',
      page_no: that.data.page_no,
      page_size: 10,
      condition: that.data.condition, //搜索内容
      orderby: that.data.orderby, //"1:综合排序  2：最新升  3：最新降  4：价格升  5：价格降 6:热度升  7热度降
    }, function(res) {
      wx.stopPullDownRefresh();
      console.log(res);
      if (res.data.records.length == 0) {
        wx.showToast({
          title: "~没有更多数据~",
          icon: "none"
        })
      } else {
        that.setData({
          dataList: that.data.dataList.concat(res.data.records),
          page_no: that.data.page_no + 1
        });
      }
    })
  },
  goDetail(e) {
    let id = e.currentTarget.dataset.id;
    let status=e.currentTarget.dataset.status;
    let lefts=e.currentTarget.dataset.lefts;
    console.log("售罄");
    console.log(status);
    if(status==2||lefts==0){//一售罄
      wx.showToast({
        title:"该商品已售罄",
        icon:"none"
      })
      return
    }else{
      wx.navigateTo({
        url:"/pages/shopMall/detail/detail?id="+id
      })
    }
  },
  onClose() {
    this.setData({
      showChooseBox: false
    })
  },
  onPullDownRefresh: function() {
    let that = this;
    that.queryProducts();
  },
  onReachBottom: function() {
    
    this.pullUp();
  },
  onShareAppMessage() {}
})