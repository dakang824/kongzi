let http = require('../../common/request.js');
import Toast from '../../dist/toast/toast';
import Notify from '../../dist/notify/notify';
import Dialog from '../../dist/dialog/dialog';
Page({
  data: {
    cashMoney: '',
    nowMoney: 0
  },
  allCash() {
    this.setData({
      cashMoney: this.data.nowMoney ? this.data.nowMoney : ''
    })
  },
  onClickIcon() {
    this.setData({
      cashMoney: ''
    })
  },
  changeMoney(e) {
    this.setData({
      cashMoney: e.detail
    })
  },
  onLoad(e) {
    this.setData({
      nowMoney: wx.getStorageSync('userInfo').w_amount / 100
    });
  },
  cash() {
    let money = this.data.cashMoney * 100,
      that = this;
    Dialog.confirm({
      title: '温馨提示',
      message: '拉满x个新用户，提现金额将自动转入您的微信零钱。一旦开始将不能取消！您确定要继续吗？',
    }).then(() => {
      http.postReq("/community/user/", {
        cmd: 'cashApply',
        amount: money
      }, res => {
        res.msg?Dialog.alert({
          title: '温馨提示',
          message: res.msg,
        }).then(() => {
          wx.redirectTo({
            url: `/pages/new/CashNewUser/CashNewUser?cash_id=${res.data.id}&money=${money / 100}`,
          })
        }):'';
      })
    }).catch(() => {});
  },
  onShareAppMessage() {}
})