import Util from '../../utils/util.js';
let http = require('../../common/request.js');
Component({
  properties: {
    shareImg: {
      type: Boolean,
      value: false,
    },
    fixed: {
      type: Boolean,
      value: false,
    },
    type: {
      type: Number,
    },
    prod_id: {
      type: Number,
    },
    prod_no: {
      type: Number,
    },
    qrPath: {
      type: String,
    },
    sharePic: {
      type: String,
      value: ''
    },
  },
  data: {
    url: getApp().globalData.serverUrl
  },
  ready() {
    // setTimeout(() => {
    //   let that = this,
    //     {
    //       type,
    //       prod_id,
    //       prod_no
    //     } = this.data;
    //   this.data.fixed ? http.postReq("/community/user/", {
    //     cmd: 'getProductSharePic',
    //     type,
    //     prod_id,
    //     prod_no
    //   }, res => {
    //     res.share_pic ? that.setData({
    //       sharePic: res.share_pic,
    //       qrPath: res.share_pic
    //     }) : '';
    //   }) : ''
    // }, 1500)
  },
  methods: {
    onLoad(e) {
      
    },
    downLoadImg() {
      let that = this;
      Util.saveImg(that.data.url + that.data.qrPath, () => {})
    },
    onClose() {
      this.setData({
        shareImg: false
      })
    },
    showShare() {
      let that = this,
        {
          type,
          prod_id,
          prod_no
        } = this.data;
      http.postReq("/community/user/", {
        cmd: 'getProductSharePic',
        type,
        prod_id,
        prod_no
      }, res => {
        res.share_pic ? that.setData({
          sharePic: res.share_pic,
          qrPath: res.share_pic
        }) : '';
        this.setData({
          shareImg: true
        })
      })
    }
  }
})