import Util from '../../utils/util.js';
let http = require('../../common/request.js');
Component({
  externalClasses: ['box-shadow'],
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    money: {
      type: Object,
    },
  },
  data: {
    ...getApp().globalData,
    disabled:false,
  },
  ready() {
    
  },
  methods: {
    jump() {
      wx.navigateTo({
        url: '/pages/shopMall/shareGoods/shareGoods',
      })
    },
    onClick() {
      let data = wx.env.loginMsg,money=this.data.money;
      this.setData({ disabled: true});
      new Promise((resolve, reject) => {
        Util.subscribeMessage({
          tmplIds: ['rPkqqsP2iMbFq-lUQ35qK-RgxLLrOqj_Wd7Sv_pR47Y'],
          success() {
            resolve();
          }
        })
      }).then(() => {
        http.postReq("/community/user/", {
          cmd: 'getBonus',
          ...data.get_bonus
        }, res => {
          wx.showModal({
            title: '温馨提示',
            showCancel: false,
            content: (money.toast_text).toFixed(2) || (money.bonusAmount / 100).toFixed(2) + '元已经存入您的平台账户，请查收',
          })
          this.triggerEvent('close');
          wx.env.loginMsg.get_bonus.get_bonus=1;
          this.setData({ disabled: false });
        })
      });
    }
  }
})