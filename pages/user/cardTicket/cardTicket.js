let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
import Util from '../../../utils/util.js';
Page({
  data: {
    isNeed:true,
    serverUrl:APP.globalData.serverUrl,
    imgUrl: APP.globalData.imageurl,
    status:"",//""-全部 0-未使用 1-使用中 2-转赠中 3-已使用 4-已过期
    dataList:[],
    type:""
  },
  onLoad: function (options) {
    let that = this;
  },
  getData(){
    http.postReq("/community/coupon/", {
      cmd: 'getMyCouponsForAccountPage',
      status:this.data.status,
    }, res=> {
      wx.stopPullDownRefresh();
      this.setData({
        dataList:res.data
      })
    })
  },
  onChange(e) {
    let that=this;
    let index=e.detail.index;
    switch(index) {
      case 0:
        that.setData({
          status:""
        })
        that.getData();
        break;
      case 1:
        that.setData({
          status:"0"
        })
        that.getData();
        break;
      case 2:
        that.setData({
          status:"1"
        })
        that.getData();
        break;
      case 3:
        that.setData({
          status:"3"
        })
        that.getData();
        break;
      default:
        that.setData({
          status:"4"
        })
        that.getData();
    }
   
  },
  onReady: function () {

  },
  onShow: function () {
    let that=this;
    that.getData();
  },
  cancelSend(e){
    let that=this;
    let id=e.currentTarget.dataset.id;
    http.postReq("/community/coupon/", {
      cmd: 'cancelTransferCoupon',
      item_id:id
    }, function (res) {
      wx.showToast({
        title:"取消成功",
        icon:"none"
      })
      that.getData();
    })
  },

  onPullDownRefresh: function () {
    let that=this;
    that.setData({
      dataList:[]
    })
    that.getData();
  },
 
  preventD(){},
  goDetail(e){
    let id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url:"/pages/shopMall/cardDetail/cardDetail?id="+id+"&type="+this.data.type
    })
   
  },
  onShareAppMessage(e) {
    let that = this, { id, nickname, pic_path } = wx.getStorageSync("userInfo");
    if (e.from === 'button') {
      let { name, top_pic, list_pic, prod_type, prod_id, prod_no } = e.target.dataset.i;
      http.postReq("/community/coupon/", {
        cmd: "transferMyCoupon",
        id: e.target.dataset.id
      }, res=> {
        that.getData();
      })
      console.log(`/pages/user/cardSend/cardSend?id=${e.target.dataset.id}&cardname=${name}&top_pic=${top_pic}&name=${encodeURIComponent(nickname)}&pic_path=${pic_path}&from_id=${id}&prod_type=${prod_type}&prod_id=${prod_id}&prod_no=${prod_no}`);
      return {
        title: nickname + '分享给你一张' + name + ',请注意查收',
        path: `/pages/user/cardSend/cardSend?id=${e.target.dataset.id}&cardname=${name}&top_pic=${top_pic}&name=${encodeURIComponent(nickname)}&pic_path=${pic_path}&from_id=${id}&prod_type=${prod_type}&prod_id=${prod_id}&prod_no=${prod_no}`,
        imageUrl: this.data.serverUrl+top_pic
      }
    }else{
      return {
        path: `/pages/user/cardTicket/cardTicket&from_id=${id}`,
      }
    }
  }
})