let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    isNeed: true,
    dataList: null,
    id: null,
    page_no:2,
  },
  onLoad: function(options) {
    this.getMyTickets();
  },
  //查询我的抽奖券
  getMyTickets() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "getMyDrawTicketV20",
      ope_id: wx.getStorageSync("userInfo").id,
      page_no:1,
      page_size:10,
    }, function(res) {
      wx.stopPullDownRefresh()
      for (let i = 0, len = res.data.records.length; i < len; i++) {
        res.data.records[i].new_get_time = res.data.records[i].get_time.slice(0, 10).replace(/-/g, ".");
        res.data.records[i].new_valid_time = res.data.records[i].valid_time.slice(0, 10).replace(/-/g, ".");
      }
      that.setData({
        dataList: res.data.records
      })
    })
  },
  //上拉加载
  pullUp(){
    let that = this;
    http.postReq("/community/award/", {
      cmd: "getMyDrawTicketV20",
      ope_id: wx.getStorageSync("userInfo").id,
      page_no:that.data.page_no,
      page_size:10,
    }, function(res) {
      wx.stopPullDownRefresh()
      for (let i = 0, len = res.data.records.length; i < len; i++) {
        res.data.records[i].new_get_time = res.data.records[i].get_time.slice(0, 10).replace(/-/g, ".");
        res.data.records[i].new_valid_time = res.data.records[i].valid_time.slice(0, 10).replace(/-/g, ".");
      }
      if(res.data.records.length==0){
        wx.showToast({
          title:"没有更多抽奖券了",
          icon:"none"
        })
      }else{

        that.setData({
          dataList: that.data.dataList.concat(res.data.records),
          page_no:that.data.page_no+1
        })
      }
    })
  },
  //是否过期 3天以内为过期
  isValid(nowTime) {
    let timestamp = new Date().getTime();
    console.log("当前系统时间的时间戳"+timestamp);
    let date = new Date(nowTime.slice(0, 19)).getTime() - timestamp;
    let days = Math.floor(date / (24 * 3600 * 1000));
    console.log(days);
    if (days < 3 && days > 0) {
      return true
    } else {
      return false
    }
  },
  onPullDownRefresh: function() {
    this.getMyTickets();
    this.setData({
      page_no:2
    })
  },
  onReachBottom: function() {
    this.pullUp();
  },
  cancelForward(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    http.postReq("/community/award/", {
      cmd: "cancelTransferAwardTickets",
      ope_id: wx.getStorageSync("userInfo").id,
      item_id: id
    }, function(res) {
      that.getMyTickets();
    })
  },
  onShareAppMessage: function(res) {
    let that = this, { nickname, id, pic_path } = wx.getStorageSync("userInfo");
    if (res.from === 'button') {
      http.postReq("/community/award/", {
        cmd: "transferMyAwardTickets",
        ope_id: id,
        id: res.target.dataset.id
      }, function(res) {
        that.getMyTickets();
      })
      console.log(`/pages/getPrize/ticketDetail/ticketDetail?id=${res.target.dataset.id}&get_time=${res.target.dataset.gettime}&valid_time=${res.target.dataset.validtime}&name=${encodeURIComponent(nickname)}&pic_path=${pic_path}&from_id=${id}`);
      return {
        title: nickname+'送你一张抽奖券,中奖了别忘了我哦！',
        path: `/pages/getPrize/ticketDetail/ticketDetail?id=${res.target.dataset.id}&get_time=${res.target.dataset.gettime}&valid_time=${res.target.dataset.validtime}&name=${encodeURIComponent(nickname)}&pic_path=${pic_path}&from_id=${id}`,
        imageUrl: APP.globalData.imageurl + 'get_tickets.png',
      }
    }else{
      return {
        path: `/pages/getPrize/ticketList/ticketList&from_id=${id}`,
      }
    }
  },
})