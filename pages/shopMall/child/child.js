let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    dataList: [], 
    serverUrl: APP.globalData.serverUrl, //服务器地址
    page_no:2,
    noMore: false,
    active: 0,
    showChooseBox: false,
    dataType1: [{
      title: "全部",
      age_from:"",
      age_to:""
    }, {
      title: "0-3岁",
      age_from:"0",
      age_to:"3"
    }, {
      title: "4-6岁",
      age_from:"4",
      age_to:"6"
    }, {
      title: "7-9岁",
      age_from:"7",
      age_to:"9"
    },{
      title: "10-12岁",
      age_from:"10",
      age_to:"12"
    },{
      title: "13岁以上",
      age_from:"13",
      age_to:"80"
    }],
    dataType2: [{
      name: "全部",
      gender:""
    },{
      name: "男孩",
      gender:"M"
    },{
      name: "女孩",
      gender:"F"
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
    order_by: "", //1:奖品价值升 2：奖品价值降  3：上架时间升 4：上架时间降  5：集齐差数升  6集齐差数降
    age_from:"",
    age_to:"",
    gender:"",//性别  F 女，M 男
    cat_name:"精选",
  },
  onLoad() {
    this.queryProductsWithType();
  },
  onChange(e) {
    this.setData({
      cat_name: e.detail.title,
      page_no:2,
      dataList:[]
    });
    this.queryProductsWithType();
  },
  choose() {
    this.setData({
      showChooseBox: !this.data.showChooseBox
    })
  },
  reset() {
    this.setData({
      showChooseBox: false,
      gender:"",
      age_from:"",
      age_to:"",
      type1: 0,
      type2:0,
      page_no:2,
    })
    this.queryProductsWithType();
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
      page_no: 2,
      dataList: [],
    })
    this.queryProductsWithType();
  },
  choose1(e) {
    let index = e.target.dataset.index;
    this.setData({
      type1: index,
      age_from:this.data.dataType1[index].age_from,
      age_to:this.data.dataType1[index].age_to
    })
  },
  choose2(e) {
    let that = this;
    let index = e.target.dataset.index;
    this.setData({
      type2: index,
      gender:this.data.dataType2[index].gender
    })
  },


  queryProductsWithType() {
    let that = this;
    http.postReq("/community/product/", {
      cmd: 'queryProductsWithType',
      condition: that.data.condition, //搜索内容
      type:"1",//1:儿童馆  0：家长馆
      page_no: 1,
      page_size: 10,
      // cat_name:that.data.cat_name,
      // gender:that.data.gender,//性别  F 女，M 男
      // age_from:that.data.age_from,
      // age_to:that.data.age_to,
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
      cmd: 'queryProductsWithType',
      condition: that.data.condition, //搜索内容
      type:"1",//1:儿童馆  0：家长馆
      page_no: that.data.page_no,
      page_size: 10,
      // cat_name:that.data.cat_name,
      // gender:that.data.gender,//性别  F 女，M 男
      // age_from:that.data.age_from,
      // age_to:that.data.age_to,
    }, function(res) {
      wx.stopPullDownRefresh();
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
    wx.navigateTo({
      url:"/pages/shopMall/detail/detail?id="+id
    })
  },
  onClose() {
    this.setData({
      showChooseBox: false
    })
  },
  onPullDownRefresh() {
    this.reset();
  },
  onReachBottom() {
    this.pullUp();
  },
  onShareAppMessage() {}
})