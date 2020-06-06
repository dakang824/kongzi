import http from '../../common/request.js';
import Dialog from '../../dist/dialog/dialog';
Component({
  properties: {
    tabBar: {
      type: Object,
      value: {}
    },
    transparent: {
      type: Boolean,
      value: false
    },
  },
  data: {

  },
  methods: {
    jump(e) {
      let {
        url
      } = e.currentTarget.dataset;
      if (url == '/pages/tabBar/endorsing/index') {
        http.postReq("/community/agent/", {
          cmd: 'getAgentAccount',
          // from_id: options.from_id
        }, res => {
          res.status == 9 ? Dialog.alert({
            title: '温馨提示',
            message: res.msg,
            confirmButtonText: "我知道了",
            zIndex: 99999999,
          }).then(() => {
            wx.switchTab({
              url: '/pages/new/index/index',
            })
          }) : res.data.status == 0 ? wx.showModal({
            title: '温馨提示',
            content: '您的代言账户已被禁用，请联系客服解决。',
            cancelText: '退出',
            confirmText: '联系客服',
            success(res) {
              res.confirm ? wx.makePhoneCall({
                phoneNumber: app.globalData.servPhone
              }) : wx.navigateBack({
                delta: 1
              })
            }
          }) : res.data.status == 3 ? wx.navigateTo({
            url: '/pages/shopMall/shareGoods/main/main',
          }) : wx.switchTab({
            url
          });
        })
      } else {
        wx.switchTab({
          url,
          complete: res => {

          }
        })
      }
    }
  }
})