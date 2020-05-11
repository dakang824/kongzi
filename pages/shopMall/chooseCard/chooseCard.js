let APP = getApp();
let http = require('../../../common/request.js');
import Loading from '../../../dist/loading_top/loading';
Page({
  data: {
    dataList: null,
    id: null,
    total_price: null,
    tip: "暂未选择卡券"
  },
  onLoad: function(options) {
    this.setData({ ...options
    });
    this.getMyCoupon();
  },

  getMyCoupon() {
    let that = this,
      {
        prod_type,
        prod_id,
        prod_no
      } = this.data;
    http.postReq("/community/product/", {
      cmd: 'getMyCoupon',
      prod_type: prod_type ? prod_type : 0,
      prod_id,
      prod_no
    }, res => {
      wx.stopPullDownRefresh();
      for (let i = 0, len = res.data.length; i < len; i++) {
        if (res.data[i].user_coupon_id == that.data.id) {
          res.data[i].valid_from = res.data[i].valid_from.slice(0, 10).replace(/-/g, ".");
          res.data[i].valid_to = res.data[i].valid_to.slice(0, 10).replace(/-/g, ".");
          res.data[i].isChoose = true;
        } else {

          res.data[i].valid_from = res.data[i].valid_from.slice(0, 10).replace(/-/g, ".");
          res.data[i].valid_to = res.data[i].valid_to.slice(0, 10).replace(/-/g, ".");
          res.data[i].isChoose = false;
        }
      }
      that.setData({
        dataList: res.data
      })
    })
  },
  sure() {
    let that = this;
    that.chooseCard();
  },
  chooseCard(e) {
    let that = this,
      {
        id,
        index,
        value,
        type,
        balance,
        name
      } = e.currentTarget.dataset;
    let use_limit = e.currentTarget.dataset.uselimit;
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];

    if (id == this.data.id) {
      let dataList = this.data.dataList;
      dataList[index].isChoose = false;
      this.setData({
        dataList
      })
      prevPage.set_discount({});
      wx.navigateBack({
        delta: 1,
      })
      return;
    };
    that.setData({
      tip: "已选择" + name
    })
    if (type == 4) {
      if (balance == 0) {
        console.log("不可以用");
      } else {
        that.data.dataList[index].isChoose = !that.data.dataList[index].isChoose;
        that.setData({
          dataList: that.data.dataList
        })

        let discountList = {
          value: value,
          type: type, //1-代金券 2-折扣券，
          id: id,
          hasCard: 1, //表示已经选择了卡券
          balance: balance, //购物卡的余额
        }

        prevPage.set_discount(discountList);
        wx.navigateBack({
          delta: 1,
        })
      }
    } else {
      if (Number(use_limit) == 0) {
        that.data.dataList[index].isChoose = !that.data.dataList[index].isChoose;
        that.setData({
          dataList: that.data.dataList
        })
        let discountList = {
          value: value,
          type: type, //1-代金券 2-折扣券，
          id: id,
          hasCard: 1, //表示已经选择了卡券
          balance: balance, //购物卡的余额
        }

        prevPage.set_discount(discountList);
        wx.navigateBack({
          delta: 1,
        })
      } else {
        if (that.data.total_price < use_limit) {
          console.log("不可以用");
        } else {
          that.data.dataList[index].isChoose = !that.data.dataList[index].isChoose;
          that.setData({
            dataList: that.data.dataList
          })
          let discountList = {
            value: value,
            type: type, //1-代金券 2-折扣券，
            id: id,
            hasCard: 1, //表示已经选择了卡券
            balance: balance, //购物卡的余额
          }

          prevPage.set_discount(discountList);
          wx.navigateBack({
            delta: 1,
          })
        }
      }
    }
  },

  onPullDownRefresh: function() {
    let that = this;
    that.getMyCoupon();
  },
  onShareAppMessage() {}
})