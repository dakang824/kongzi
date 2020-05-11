let http = require('../../../../common/request.js'),
  app = getApp();
Page({
  data: {
    ...app.globalData,
    d:{status:0},
    show:false,
    email:'',
    logistics:false,
    disabled:false,
  },
  show(){
    this.setData({show:!this.data.show})
  },
  jump(){
   wx.navigateTo({
     url: '/pages/personal/welfare/welfare?success=1',
   })
  },
  copy(){
    wx.setClipboardData({
      data: this.data.no,
    })
  },
  onClose(){
    this.setData({logistics:!this.data.logistics})
  },
  postStatus(){
    let {order_id}=this.data.d;
    http.postReq("/community/order/", {
      cmd: 'getTrackingInfo',
      order_id: order_id
    }, res => {
      let d = JSON.parse(res.tracking),
        {
          list,
          company,
          no
        } = d.result,
        steps = [];
      for (let key of list) {
        steps.push({
          text: key.datetime,
          desc: key.remark
        })
      }
      steps.reverse();
      this.setData({
        logistics: !this.data.logistics,
        steps,
        company,
        no
      })
    })
  },
  deriveEmail(e){
    this.setData({email:e.detail.value})
  },
  sendGoEmail(){
    let {email}=this.data;
    if (email == "" || email == null) {
      wx.showToast({
        title: '邮箱地址不能为空',
        icon: "none"
      })
      return;
    } else if (!(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email))) {
      wx.showToast({
        title: '请填写正确的邮箱地址',
        icon: "none"
      })
      return;
    }
    this.setData({disabled:true})
    http.postReq("/community/pbcode/", {
      cmd: 'sendPublicBenefitEmail',
      apply_id:this.data.d.id,
      email
    }, res => {
     wx.showToast({
       title: '操作成功',
     })
     this.setData({disabled:false,show:false})
    })
  },
  onLoad(options) {
    http.postReq("/community/pbcode/", {
      cmd: 'getApplyPublicBenefitInfo',
    }, res => {
      let d=res.data[0];
     this.setData({d,m:d.create_time.split(' ')[0].split('-')})
    })
  },
  deleReg() {
    let that=this;
    http.request("account", {
      cmd: 'deleteInstRegister',
      reg_id:that.data.d.id,
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone
    })
  }
})