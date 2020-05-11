let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    isdefault: false,
    name: "", //姓名
    mobile: "", //收件电话
    address: "", //收件地址,
    all: true,
    id: null,
    type: 0,
  },
  onLoad: function(options) {
    let that = this;
    that.setData(options)
    options.type == 3 ? wx.setNavigationBarTitle({
      title: '修改地址'
    }) : '';
    if (options.type == 1) { //修改
      that.setData({
        isdefault: options.isdefault == 1,
      })
    }
  },
  onChange({
    detail
  }) {
    // 需要手动对 isdefault 状态进行更新
    this.setData({
      isdefault: detail
    });
  },
  //输入姓名
  childName(e) {
    let that = this;
    that.setData({
      name: e.detail,
    })
  },
  //输入收件电话
  childPhone(e) {
    this.setData({
      mobile: e.detail,
    })
  },
  //收件地址
  childAddress(e) {
    this.setData({
      address: e.detail
    })
  },
  sure() {
    let that = this,
      {
        type,
        name,
        mobile,
        address,
        id
      } = that.data;
    if (name == "") {
      wx.showToast({
        title: "请输入收货人姓名",
        icon: "none"
      })
      return
    }
    if (mobile == "") {
      wx.showToast({
        title: "请输入手机号码",
        icon: "none"
      })
      return
    }
    if (address == "") {
      wx.showToast({
        title: "请输入详细地址",
        icon: "none"
      })
      return
    }
    let postData = {
      name,
      mobile,
      address,
      id,
      isdefault: that.data.isdefault ? "1" : "0", //1--默认
      cmd: type == 0 ? 'addPostAddress' : type == 3 ? 'modifyOrderAddress' : 'modifyPostAddress',
    }
    type == 3 ? (postData.order_id = this.data.id, postData.post_name = name, postData.post_mobile = mobile, postData.post_address = address) : '';
    http.postReq(`/community/${type == 3 ? 'order' : 'product'}/`, postData, res => {
      setTimeout(() => {
        wx.navigateBack();
      }, 1300)
      wx.showToast({
        title: (type == 3 || type == 1 ? '修改' : "添加") + '成功',
        icon: "none"
      })
    })
  },
  onShareAppMessage() {}
})