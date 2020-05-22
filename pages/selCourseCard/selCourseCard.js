let app = getApp(),
  http = require('../../common/request.js');
  import Util from '../../utils/util';
Page({
  data: {
    hiddenPage:true,
    hasCard: 0,
    url: app.globalData.serverUrl,
    imageurl: app.globalData.imageurl,
    show: false,
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime()-1000*60*60*24*360,
    currentDate: new Date().getTime(),
    card_code:''
  },
  onLoad(e) {
    this.setData({
      card_code: e.card_code
    })
    this.getData();
  },
  showTime(e) {
    let {
      cardid,
      courseid
    } = e.currentTarget.dataset;
    this.setData({
      cardid,
      courseid,
      show: true
    })
  },
  cancel(){
    this.setData({show:false})
  },
  markCourse(e) {
    let {
      cardid,
      courseid
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: "markCourseArrive",
      card_id:cardid,
      course_id:courseid,
      arrive_time:Util.getTime(e.detail).slice(0,16)
    }, res => {
      this.cancel();
      this.getData();
    })
  },
  onShow() {
    this.getData();
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  go() {
    let {
      card_code,
      cards
    } = this.data;
    wx.navigateTo({
      url: `/pages/selCourseCard/submitFrom/submitFrom?card_code=${card_code||cards.code}`,
    })
  },
  getData() {
    let {
      card_code
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: "getMyCardInfo",
      card_code
    }, res => {
      if(res.hasCard){
        let cardNumber=res.data.code;
        this.setData({
          cardNumber:[cardNumber.slice(0,3),cardNumber.slice(3,6),cardNumber.slice(6,9),cardNumber.slice(9)],
          cards: res.data,
          hasCard: res.hasCard,
        });
      }
      this.setData({hiddenPage:false})
    })
  },
  onPullDownRefresh() {
    this.getData();
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {

  }
})