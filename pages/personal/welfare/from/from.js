let http = require('../../../../common/request.js');
Page({
  data: {
    postData:{
      checked:false,
      name:'',
      tea_count:'',
      stu_count:'',
      address:'',
      contact:'',
      mobile:''
    },
    showModal:false,
    disabled:false,
    ...getApp().globalData
  },
  showModal(){
    this.setData({ showModal:true})
  },
  hideModal(){
    this.setData({ showModal:false})
  },
  input(e){
    let {i}=e.currentTarget.dataset,{value}=e.detail,{postData}=this.data;
    this.setData({[`postData.${i}`]:value})
    this.verify();
  },
  onChange(e){
    this.setData({'postData.checked':e.detail})
  },
  verify(){
    let {name,tea_count,stu_count,address,contact,mobile}=this.data.postData;
    this.setData({disabled:name!==''&&tea_count!==''&&stu_count!==''&&address!==''&&contact!==''&&mobile!==''})
  },
  sumit(){
    let {checked}=this.data.postData;
    if(!checked){
      wx.showToast({
        title: '请勾选同意按钮',
        icon:'none'
      })
      return;
    }
    http.postReq("/community/pbcode/", {
      cmd: 'applyPublicBenefit',
      ...this.data.postData
    }, res => {
      wx.redirectTo({
        url: '/pages/personal/welfare/status/status',
      })
    })
  },
  onShareAppMessage() {

  }
})