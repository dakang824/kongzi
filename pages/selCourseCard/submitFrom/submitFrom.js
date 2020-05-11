let app = getApp(),
  http = require('../../../common/request.js');
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    columns: ['1岁', '2岁', '3岁', '4岁', '5岁', '6岁', '7岁', '8岁', '9岁', '10岁', '11岁', '12岁', '13岁', '14岁', '15岁', '其它'],
    ageInd: ' ',
    disabled: false,
    postData: {
      cmd: "selectCourses",
      card_code: '',
      courses: [],
      name: '',
      age: '',
      gender: '男',
      mobile: ''
    }
  },
  needMore() {
    Dialog.alert({
      title: '温馨提示',
      confirmButtonText:'我知道了',
      message: '您的孩子每上过一次选课后，标记上课时间，就可以获得1个新的选课机会。如果没有上课，请不要标记（虚假标记可能会导致账户被封！）。',
    }).then(() => {});
  },
  ageSelect(e) {
    let {
      i
    } = e.currentTarget.dataset, {
      columns
    } = this.data;
    let age = parseInt(columns[i]);
    age = isNaN(age) ? 0 : age;
    this.setData({
      'postData.age': age,
      ageInd: i
    })
    this.verify();
  },
  onLoad(e) {
    this.setData({
      'postData.card_code': e.card_code
    });
    this.getData();
  },
  onShow() {
    this.verify();
  },
  getData() {
    let {
      card_code
    } = this.data.postData;
    http.postReq("/community/industry/", {
      cmd: "getMyCardInfo",
      card_code
    }, res => {
      for (let key of res.data.select_course) {
        key.t = new Date(key.select_time.slice(0, 19).replace(/-/g, "/")).getTime();
      }
      let lately = res.data.select_course.sort((a, b) => {
        return b.t - a.t
      });
      this.setData({
        cards: res.data,
        'postData.limit_count': res.data.left_count,
        'postData.name':lately[0].name,
        'postData.mobile':lately[0].mobile,
        'postData.gender':lately[0].gender,
        'postData.age':lately[0].age,
        ageInd:lately[0].age-1>0?lately[0].age-1:0
      })
      this.verify();
    })
  },
  OnInput(e) {
    let {
      i
    } = e.currentTarget.dataset, {
      postData
    } = this.data;
    this.setData({
      [`postData.${i}`]: e.detail
    });
    this.verify();
  },
  next() {
    wx.navigateTo({
      url: `/pages/selCourseCard/CourseList/CourseList?d=${JSON.stringify(this.data.postData)}&code=${this.data.cards.code}`,
    })
  },
  onChange(e) {
    this.setData({
      'postData.gender': e.detail
    })
    this.verify();
  },
  verify() {
    let {
      name,
      age,
      mobile
    } = this.data.postData;
    this.setData({
      disabled: name !== '' && age !== '' && mobile !== ''
    })
  },
  onShareAppMessage() {

  }
})