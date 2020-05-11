let APP = getApp();
let http = require('../../../common/request.js');
Page({
  data: {
    dataList: [],
    serverUrl: APP.globalData.serverUrl, //服务器地址
    page_no: 1,
    morePage_no: 1,
    todayPage_no:1,
    noMore: false,
    index: 0,
    showChoose:false,
    showChooseBox:false,
    content:"",
    startTime:"",
    endTime:""
  },
  onLoad: function(options) {
    this.setData({
      startTime:this.fun_date(-30),
      endTime:this.getTime()
    })
    
    // this.getYestoday();
    this.getToday();
    this.setData({
      serverUrl: APP.globalData.serverUrl
    })
  },
  choose(){
    this.data.showChooseBox=!this.data.showChooseBox;
    this.setData({
      showChooseBox:this.data.showChooseBox
    })
  },
  chooseStartTime(e){
    this.setData({
      startTime:e.detail.value.replace(/-/g,".")
    })
  },
  chooseEndTime(e){
    this.setData({
      endTime:e.detail.value.replace(/-/g,".")
    })
  },
  searchBtn(){
    this.setData({
      showChooseBox:false,
      dataList:[],
    })
    this.serachMore();
  },
  reset(){
    this.setData({
      startTime:this.fun_date(-30),
      endTime:this.getTime(),
      showChooseBox:false
    })
  },
  //获取当前系统时间
  getTime(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    return year+"."+month+"."+day
  },
  //前7天
  
  fun_date(aa){
    var date1 = new Date(),
    time1=date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate();//time1表示当前时间
    var date2 = new Date(date1);
    date2.setDate(date1.getDate()+aa);
    var time2 = date2.getFullYear()+"."+(date2.getMonth()+1)+"."+date2.getDate();
    return time2
  },
  inputContent(e){
    this.setData({
      content:e.detail.value
    })
  },
  //切换tabs
  onChange(e) {
    let that = this;
    that.setData({
      index: e.detail.index,
      dataList:[],
      page_no:1,
      morePage_no:1,
      todayPage_no:1,
    })
    if (e.detail.index == 0) {//今日
      that.setData({
        showChoose:false,
        showChooseBox:false
      })
      that.getToday();
    } else if(e.detail.index==1) {//昨日
      that.setData({
        showChoose:false,
        showChooseBox:false
        
      })
      that.getYestoday();
    }else{//更多
      that.setData({
        showChoose:true,
        startTime:this.fun_date(-30),
        endTime:this.getTime(),
      })
      that.getMore();
    }
  },
  //查询今日开奖
  getToday(){
    let that = this;
    http.postReq("/community/award/", {
      cmd: "querytodayAwardDrawsHistory",
      ope_id: wx.getStorageSync("userInfo").id,
      page_no: that.data.todayPage_no,
      page_size: 20,
    }, function(res) {
      wx.stopPullDownRefresh();
      for (let i = 0, len = res.data.records.length; i < len; i++) {
        res.data.records[i].icon_path = that.data.serverUrl + res.data.records[i].icon_path
        for (let j = 0, len = res.data.records[i].winners_list.length; j < len; j++) {
          res.data.records[i].winners_list[j].pic_path = that.data.serverUrl + res.data.records[i].winners_list[j].pic_path;
        }
      }
      that.setData({
        dataList: that.data.dataList.concat(res.data.records),
        todayPage_no: that.data.todayPage_no + 1,
        noMore: res.data.records.length == 0
      })
    })
  },
  //查询昨日开奖
  getYestoday() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "queryYestodayAwardDraws",
      ope_id: wx.getStorageSync("userInfo").id,
      page_no: that.data.page_no,
      page_size: 20,
    }, function(res) {
      wx.stopPullDownRefresh();
      for (let i = 0, len = res.data.records.length; i < len; i++) {
        res.data.records[i].icon_path = that.data.serverUrl + res.data.records[i].icon_path
        for (let j = 0, len = res.data.records[i].winners_list.length; j < len; j++) {
          res.data.records[i].winners_list[j].pic_path = that.data.serverUrl + res.data.records[i].winners_list[j].pic_path;
        }
      }
      that.setData({
        dataList: that.data.dataList.concat(res.data.records),
        page_no: that.data.page_no + 1,
        noMore: res.data.records.length == 0
      })
    })
  },
  //更多中奖纪录
  getMore() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "queryAwardDrawsHistoy",
      ope_id: wx.getStorageSync("userInfo").id,
      page_no: that.data.morePage_no,
      page_size: 20,
      content:that.data.content,
      from:that.data.startTime.replace(/\./g,"-"),
      to:that.data.endTime.replace(/\./g,"-")
    }, function(res) {
      wx.stopPullDownRefresh();
      for (let i = 0, len = res.data.records.length; i < len; i++) {
        res.data.records[i].icon_path = that.data.serverUrl + res.data.records[i].icon_path
        for (let j = 0, len = res.data.records[i].winners_list.length; j < len; j++) {
          res.data.records[i].winners_list[j].pic_path = that.data.serverUrl + res.data.records[i].winners_list[j].pic_path;
        }
      }
      that.setData({
        dataList: that.data.dataList.concat(res.data.records),
        morePage_no: that.data.morePage_no + 1,
        noMore: res.data.records.length == 0,
        
      })
    })
  },
  
  serachMore(){
    let that = this;
    that.setData({
      morePage_no:1,
      dataList:[]
    })
    http.postReq("/community/award/", {
      cmd: "queryAwardDrawsHistoy",
      ope_id: wx.getStorageSync("userInfo").id,
      page_no: that.data.morePage_no,
      page_size: 20,
      content:that.data.content,
      from:that.data.startTime.replace(/\./g,"-"),
      to:that.data.endTime.replace(/\./g,"-")
    }, function(res) {
      wx.stopPullDownRefresh();
      for (let i = 0, len = res.data.records.length; i < len; i++) {
        res.data.records[i].icon_path = that.data.serverUrl + res.data.records[i].icon_path
        for (let j = 0, len = res.data.records[i].winners_list.length; j < len; j++) {
          res.data.records[i].winners_list[j].pic_path = that.data.serverUrl + res.data.records[i].winners_list[j].pic_path;
        }
      }
      that.setData({
        dataList: res.data.records,
        morePage_no: that.data.morePage_no + 1,
        noMore: res.data.records.length == 0,
        // content:"",
      })
    })
  },
  onClose(){
    this.setData({
      showChooseBox:false
    })
  },
  onPullDownRefresh: function() {
    let that=this;
    this.setData({
      page_no: 1,
      morePage_no: 1,
      todayPage_no:1,
      dataList: [],
      noMore: false,
    })
    if (this.data.index == 0) {
      this.getToday();
    } else if(this.data.index==1) {
      that.getYestoday();
    }else{
      that.getMore();
    }
  },
  onReachBottom: function() {
    let that = this;
    if (!this.data.noMore) {
      if (this.data.index == 0) {
        that.getToday();
      } else if(this.data.index==1) {
        that.getYestoday();
      }else{
        that.getMore();
      }
    }else{
      wx.showToast({
        title:"~没有更多数据~",
        icon:"none"
      })
    } 
  },
  onShareAppMessage(){}
})