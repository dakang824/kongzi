let app = getApp(),
  http = require('../../common/request.js');
import Util from '../../utils/util';
import Loading from '../../dist/loading_top/loading';
Page({
  data: {
    show_review:false,
    alreadyTotal:0,
    hiddenPage: true,
    hasCard: 0,
    url: app.globalData.serverUrl,
    imageurl: app.globalData.imageurl,
    show: false,
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 360,
    currentDate: new Date().getTime(),
    card_code: ''
  },
  goComment(e) {
    let {
      user_id,
      card_id,
      course_id,
      course_name,
      inst_id,
      course_type,
    } = e.currentTarget.dataset.i;
    let d={user_id,
      card_id,
      course_id,
      course_name,
      inst_id,
      course_type};
    wx.navigateTo({
      url: `/pages/praise/submitComment/index?d=${encodeURI(JSON.stringify(d))}`,
    })
  },
  onLoad(e) {
    this.setData({
      card_code: e.card_code
    })
    this.getData();
  },
  applyMoney(e) {
    let {
      i
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/selCourseCard/applyMoney/index?card_id=${i.card_id}&course_id=${i.course_id}&inst_id=${i.inst_id}`,
    })
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
  cancel() {
    this.setData({
      show: false
    })
  },
  markCourse(e) {
    let {
      cardid,
      courseid
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: "markCourseArrive",
      card_id: cardid,
      course_id: courseid,
      arrive_time: Util.getTime(e.detail).slice(0, 16)
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
    Loading.start();
    let {
      card_code
    } = this.data;
    http.postReq("/community/industry/", {
      cmd: "getMyCardInfo",
      card_code
    }, res => {
      if (res.hasCard) {
        let cardNumber = res.data.code,alreadyTotal=0;
        for(let key of res.data.select_course){
          key.status==2?alreadyTotal=alreadyTotal+1:'';
        }
        this.setData({
          cardNumber: [cardNumber.slice(0, 3), cardNumber.slice(3, 6), cardNumber.slice(6, 9), cardNumber.slice(9)],
          cards: res.data,
          hasCard: res.hasCard,
          alreadyTotal,
          enable_review:res.sysSetting.enable_review,
          show_review:res.sysSetting.show_review,
        });
      }
      this.setData({
        hiddenPage: false
      })
      Loading.close();
    })
  },
  onPullDownRefresh() {
    this.getData();
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {

  }
})