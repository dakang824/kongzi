let app = getApp(),http = require('../../../common/request.js');
Page({
  data: {
    columns: ['1岁', '2岁', '3岁', '4岁', '5岁', '6岁', '7岁', '8岁', '9岁', '10岁', '11岁', '12岁', '13岁', '14岁', '15岁', '其它'],
    ageInd:' ',
    disabled:false,
    postData:{
      cmd: "selectCourses",
      card_code:'',
      courses:[],
      name:'',
      age:'',
      gender:'男',
      mobile:''
    }
  },
  ageSelect(e){
    let {i}=e.currentTarget.dataset,{columns}=this.data;
    let age=parseInt(columns[i]);
    age=isNaN(age)?0:age;
    this.setData({'postData.age':age,ageInd:i})
    this.verify();
  },
  onLoad(e) {
    this.setData({'postData.card_code':e.card_code});
    this.getData();
  },
  onShow(){
    this.verify();
  },
  getData() {
    let {card_code}=this.data.postData;
    http.postReq("/community/industry/", {
      cmd: "getMyCardInfo",
      card_code
    }, res => {
      this.setData({cards:res.data,'postData.limit_count':res.data.left_count})
    })
  },
  OnInput(e){
   let {i}=e.currentTarget.dataset,{postData}=this.data;
    this.setData({[`postData.${i}`]:e.detail});
    this.verify();
  },
  next() {
      wx.navigateTo({
        url: `/pages/selCourseCard/CourseList/CourseList?d=${JSON.stringify(this.data.postData)}&code=${this.data.cards.code}`,
      })
  },
  onChange(e){
    this.setData({'postData.gender':e.detail})
    this.verify();
  },
  verify(){
    let {name,age,mobile}=this.data.postData;
    this.setData({disabled:name!==''&&age!==''&&mobile!==''})
  },
  onShareAppMessage() {

  }
})