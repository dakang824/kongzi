let app = getApp(),
  http = require('../../../common/request.js');
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    c: '',
    imageurl: app.globalData.imageurl
  },
  input(e) {
    this.setData({
      c: e.detail.value
    });
  },
  submit() {
    let that = this,
      t = this.data.t;
    Dialog.confirm({
      title: '提示',
      cancelButtonText: '否',
      confirmButtonText: '是',
      message: t == 1 ? '您确定要提交此投诉吗？' : '您确定要提交此反馈吗？'
    }).then(() => {
      http.postReq("/community/user/", {
        cmd: t == 1 ? "addComplaint" : "addFeedBack",
        content: that.data.c
      }, res=> {
        res.status == 1 ? Dialog.alert({
          title: '温馨提示',
          message: t == 1 ? '提交成功！' : '感谢您的反馈信息，也感谢您对我们产品的支持！'
        }).then(() => {
          wx.navigateBack({
            delta: 1
          })
        }) : '';
      })
    }).catch(() => {

    });
  },
  onLoad(o) {
    o.t == 1 ? '' : wx.setNavigationBarTitle({
      title: '反馈',
    })
    this.setData(o);
  },
  onShareAppMessage() {}
})