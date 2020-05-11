let APP = getApp();
let http = require('../../../common/request.js');
Page({
  data: {
    serverUrl:APP.globalData.serverUrl,//服务器地址
    id:null,
    active:true,
    index:1,
    type:0, // time:""//0:三个月  1：一周  2：一个月   3：半年
   
    time:0,//0：全部  1：课程  2：抽奖  3：门票
    typeTitle:"全部",
    timeTitle:"时间",
    showMask:false,
    showDetail:false,
    showDel:false,
    detailList:null,
    delType:null,//2：抽奖  3：门票
    award_status:null,//0--活动已下线
    list:[],
    options:null,
    listType:[{name:'全部',checked:true,type:0},{name:'课程',checked:false,type:1},{name:'抽奖',checked:false,type:2},{name:'门票',checked:false,type:3}],
    listTime:[{name:'最近一周',checked:false,time:1},{name:'最近一个月',checked:false,time:2},{name:'最近3个月',checked:true,time:0},{name:'最近半年',checked:false,time:3}]
  },
  onLoad: function (options) {
    let that=this;
    that.setData({
      list:that.data.listType,
    })
    that.getData();
    // setInterval(() => {
    //   for(let i=0,len=that.data.dataList.length;i<len;i++){
    //     if(that.data.dataList[i].collect_type==1){
    //       res.data[i].daojishi=that.formatSeconds(res.data[i].end_time);
    //     }
    //   }
    // }, 60000);
  },

  onReady: function () {
    // let arr=[1,2,3];
    // console.log(arr.splice(0,1));
  },
  onShow: function () {

  },
  choose(e){
    console.log(e);
    let that=this;
    let index=e.currentTarget.dataset.index;
    that.data.showMask=!that.data.showMask;
    if(index==1){
      that.setData({
        list:that.data.listType,
        // showMask:true,
        showMask:that.data.showMask
      })
    }else{
      that.setData({
        list:that.data.listTime,
        // showMask:true,
        showMask:that.data.showMask
      })
    }
    that.setData({
      index:index,
      
    })
    
  },
  chooseType(e){
    let that=this;
    let index=e.currentTarget.dataset.index;
    if(that.data.index==1){
      that.data.typeTitle=that.data.list[index].name;
      that.data.type=that.data.list[index].type;
      for(let i=0,len=this.data.list.length;i<len;i++){
        if(index==i){
          that.data.list[index].checked=true;
        }else{
          that.data.list[i].checked=false;
        }
      }
      that.setData({
        typeTitle:that.data.typeTitle,
        type:that.data.type
      })
    }else{
      that.data.timeTitle=that.data.list[index].name;
      that.data.time=that.data.list[index].time;
      for(let i=0,len=this.data.list.length;i<len;i++){
        if(index==i){
          that.data.list[index].checked=true;
        }else{
          that.data.list[i].checked=false;
        }
      }
      that.setData({
        timeTitle:that.data.timeTitle,
        time:that.data.time
      })
    }
    that.setData({
      list:that.data.list,
      showMask:false,
    })
    that.getData();
  },
  getData(){
    let that=this;
    http.postReq("/community/award/",{
      cmd:'getMyCollects',
      ope_id:wx.getStorageSync("userInfo").id,
      // time:""//0:三个月  1：一周  2：一个月   3：半年
      // type:""//0：全部  1：课程  2：抽奖  3：门票
      time:that.data.time,
      type:that.data.type,
      ...wx.getStorageSync("position")
    },function(res){
      wx.stopPullDownRefresh()
      if(res.data.length){
        for (let i = 0, len = res.data.length; i < len; i++) {
          if (res.data[i].collect_type == 3) {//表示是门票
            res.data[i].mindis = (res.data[i].mindis / 1000).toFixed(1);
            res.data[i].maxdis = (res.data[i].maxdis / 1000).toFixed(1);
          }
          if(res.data[i].collect_type == 1){
            res.data[i].mindis = (res.data[i].mindis / 1000).toFixed(1);
            res.data[i].max_dis = (res.data[i].max_dis / 1000).toFixed(1);
            if(res.data[i].type==4){
              res.data[i].category=res.data[i].category.splice(0,4);
            }
          }
        }
      }
      that.setData({
        dataList:res.data
      });
      console.log(that.data.dataList);
    })
  },
  closeMask(){
    this.setData({
      showMask:false,
      showDetail:false,

    });
  },
  seeMore(e){
    let that=this;
    console.log(e);
    let award_id=e.currentTarget.dataset.id;
    let award_status=e.currentTarget.awardstatus;
    this.setData({
      showDetail:true,
      award_status:award_status
    })
   //收藏抽奖活动 场次详情
    http.postReq("/community/award/",{
      cmd:'collectAwardDetail',
      ope_id:wx.getStorageSync("userInfo").id,
      award_id:award_id,
    },function(res){

      for(let i=0,len=res.data.length;i<len;i++){
        res.data[i].new_draw_time=res.data[i].draw_time.slice(0,16);
        res.data[0].start_time=res.data[0].start_time.slice(0,10).replace(/-/g,".");
        res.data[0].end_time=res.data[0].end_time.slice(0,10).replace(/-/g,".");
      }
      that.setData({
        detailList:res.data
      })
      console.log(res.data);
    })
  },
  //取消收藏抽奖活动
  delDraw(award_id){
    let that=this;
    http.postReq("/community/award/",{
      cmd:"cancelCollectAward",
      award_id:award_id,
    },function(res){
    })
  },
  //取消门票收藏
  delTicket(park_id){
    let that=this;
    http.postReq("/community/ticket/",{
      cmd:"collectParkTickets",
      ope_id:wx.getStorageSync("userInfo").id,
      pticket_id:park_id
    },function(res){
      
    })
  },
  //取消课程收藏
  delClass(act_no,inst_id){
    let that=this;
    http.postReq("/community/user/",{
      cmd:"collectActs",
      act_no:act_no,
      inst_id:inst_id,
      type:0
    },function(res){
      
      
    })
  },
  closeShowDel(){
    this.setData({
      showDel:false,
    })
  },
  openShowDel(){
    if(this.data.delType==2){//1-课程 2：抽奖  3：门票
      this.delDraw(this.data.id);
      this.getData();
    }else if(this.data.delType==3){
      this.delTicket(this.data.id);
      this.getData();
    }else{
      this.delClass(this.data.options.actno,this.data.options.id,this.data.options.type);
      this.getData();
    }
    this.setData({
      showDel:false
    })
  },
  delData(e){
    let delType=e.currentTarget.dataset.type;
    let options=e.currentTarget.dataset;
    this.setData({
      showDel:true,
      delType:delType,
      id:e.currentTarget.dataset.id,
      options:options
    })
  },
  enterDetail(e){
    let options = e.currentTarget.dataset, item=options.item;
    let that=this;
    if(options.type==1){////collect_type 1：课程  2：抽奖  3：门票
      wx.navigateTo({
        url: item.type !== 4 ? "/pages/bargain/active/bargain?act_no=" + item.act_no + "&inst_id=" + item.inst_id + "&ope_id=" + wx.getStorageSync('userInfo').id + "&from_id=0&source=31" : "/pages/bargain/bargain?act_no=" + item.act_no + "&inst_id=" + item.inst_id + "&ope_id=" + wx.getStorageSync('userInfo').id+"&from_id=0&source=31",
      })
    }else if(options.type==2){
      
      this.setData({
        showDetail:true,
        
      })
      //收藏抽奖活动 场次详情
      http.postReq("/community/award/",{
        cmd:'collectAwardDetail',
        ope_id:wx.getStorageSync("userInfo").id,
        award_id:options.awardid,
      },function(res){

        for(let i=0,len=res.data.length;i<len;i++){
          res.data[i].new_draw_time=res.data[i].draw_time.slice(0,16).replace(/-/g,".");
          res.data[0].start_time=res.data[0].start_time.slice(0,10).replace(/-/g,".");
          res.data[0].end_time=res.data[0].end_time.slice(0,10).replace(/-/g,".");
        }
        that.setData({
          detailList:res.data
        })
        console.log(res.data);
      })
    }else if(options.type==3) {
      wx.navigateTo({
        url:"/pages/ticket/indexTicketDetail/indexTicketDetail?id="+options.id+"&park_id="+options.parkid
      })
    }
  },
  drawDetail(e){
    let options = e.currentTarget.dataset;
    wx.navigateTo({
        url:"/pages/new/luckyDetail/luckyDetail?award_id="+options.awardid+"&draw_id="+options.drawid
      })
  },
   //倒计时函数
   formatSeconds(time) {
    // console.log(new Date("2019-11-08 23:59:59.0".slice(0,19)).getTime())
    let timestamp=new Date().getTime();////当前系统时间的时间戳
    let endstamp= new Date(time.slice(0,19).replace(/-/g,"/")).getTime();//结束时间的时间戳
    let value=endstamp-timestamp;
    var secondTime = parseInt(value/1000);// 秒
    var dayTime=0;//天
    var minuteTime = 0;// 分
    var hourTime = 0;// 小时
    if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if(minuteTime > 60) {
            //获取小时，获取分钟除以60，得到整数小时
            hourTime = parseInt(minuteTime / 60);
            //获取小时后取佘的分，获取分钟除以60取佘的分
            minuteTime = parseInt(minuteTime % 60);
            if(hourTime > 24){
              //大于24小时
              dayTime = parseInt(hourTime / 24);
              hourTime = parseInt(hourTime % 24);
            }
        }
    }
    if(secondTime<10){
      secondTime="0"+secondTime;
    }
    if(minuteTime<10){
      minuteTime="0"+minuteTime;
    }
    if(hourTime<10){
      hourTime="0"+hourTime;
    }
    if(dayTime<10){
      dayTime="0"+dayTime;
    }
    // this.setData({
    //   hourTime:hourTime,
    //   minuteTime:minuteTime,
    //   secondTime:secondTime
    // })
    // console.log("倒计时了"+hourTime+":"+minuteTime+":"+secondTime);
    return {dayTime,hourTime,minuteTime,secondTime}
  },
  onPullDownRefresh: function () {
    let that=this;
    that.getData();
  },
  onShareAppMessage() {}
})