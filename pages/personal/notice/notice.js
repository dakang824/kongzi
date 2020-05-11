import Util from '../../../utils/util.js';
Page({
  data: {
    checked: true,
    d: [{
      name: '新人奖到账通知',
      value: 'rPkqqsP2iMbFq-lUQ35qK-RgxLLrOqj_Wd7Sv_pR47Y',
      istrue: false
    }, {
      name: '优惠券到账通知',
        value: 'KSGIvoChaApKEb1g9_Vw-zYVGO4D3OloiC1Wc6n0PcM',
      istrue: false
    }, {
      name: '代言收益到账通知',
      value: 'bblbHuIHOy0RMwJvAAzqXBEJnmm0e8RSbb9_wL4cYfo',
      istrue: false
    }, {
      name: '订单发货通知',
      value: 'QFmfs8NOR6KQ5P9wRsTKdffpi_O8PtCldGN6rqdixvU',
      istrue: false
    }]
  },
  onChange(e){
    let { i } = e.currentTarget.dataset;
    i.istrue?'':Util.subscribeMessage({
      tmplIds: [i.value],
      success:res=> {
        this.onLoad();
      }
    })
  },
  onLoad() {
    wx.getSetting({
      withSubscriptions: true,
      success:res=> {
        let items=res.subscriptionsSetting.itemSettings,{d}=this.data;
        for(let item in items){
          for (let key of d) {
            item == key.value && items[item] == 'accept' ? key.istrue=true:'';
          }
        }
        this.setData({d})
      }
    })
  },
  onShareAppMessage() {

  }
})