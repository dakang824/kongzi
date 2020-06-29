let http = require('../../../common/request.js'),
  app = getApp();
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    showImg: false,
    show: false,
    disable: false,
    data: {},
    medias: [],
    imgUrl: app.globalData.imageurl,
    postData: {
      cmd: 'reviewCardInst',
      env_score: 0,
      tea_score: 0,
      eff_score: 0,
      ser_score: 0,
      content: '',
      medias: []
    },
    fileList: [],
    d: [{
      name: '学习效果',
      value: 'eff_score',
    }, {
      name: '师资背景',
      value: 'tea_score',
    }, {
      name: '上课环境',
      value: 'env_score',
    }, {
      name: '服务态度',
      value: 'ser_score',
    }]
  },
  closeView(){
    this.setData({showImg:false})
  },
  delect() {
    Dialog.confirm({
      title: '温馨提示',
      message: '是否确定删除！',
    }).then(() => {
      http.postReq("/review/front/", {
        cmd: 'deleteInstReview',
        review_id: this.data.data.review_id
      }, res => {
        this.setData({
          'data.status':3
        })
      })
    }).catch(() => {
      // on cancel
    });
  },
  preview(e) {
    let imgs = [...this.data.postData.medias];
    for (let key of imgs) {
      key.type = key.media_type;
      key.path = key.url;
    }
    this.setData({
      showImg: true,
      current: e.detail.index,
      imgs
    })
  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    for (let key of file) {
      this.uploadFile(key);
    }
  },
  uploadFile(file) {
    wx.uploadFile({
      url: app.globalData.serverUrl + 'review/front/',
      filePath: file.tempFilePath,
      name: 'file',
      formData: {
        cmd: 'uploadReviewMedia',
        media_type: ('thumbTempFilePath' in file) ? 1 : 0
      },
      success: res => {
        let {
          postData,
          fileList = []
        } = this.data, d = JSON.parse(res.data).data, medias = postData.medias;
        medias.push(d);
        fileList.push({
          ...file,
          // url: app.globalData.serverUrl+d.url,
          url: ('thumbTempFilePath' in file) ? file.thumbTempFilePath : file.tempFilePath
        });
        this.setData({
          fileList,
          'postData.medias': medias
        });
        this.verify();
      },
    });
  },
  onLoad(options) {
    let {
      postData
    } = this.data, d = JSON.parse(decodeURI(options.d));
    Object.assign(postData, d)
    this.setData({
      'd[2].name': d.online == 0 ? '上课体验' : '上课环境',
      'postData.user_id': wx.getStorageSync('userInfo').id,
    })
    http.postReq("/review/front/", {
      cmd: 'getMyReview',
      user_id: wx.getStorageSync('userInfo').id,
      ...d
    }, res => {
      wx.stopPullDownRefresh();
      if ('id' in res.data) {
        let {
          env_score,
          tea_score,
          eff_score,
          ser_score,
          content
        } = res.data;
        Object.assign(postData, {
          env_score,
          tea_score,
          eff_score,
          ser_score,
          content
        })
        let fileList = JSON.parse(JSON.stringify(res.pics)),
          arr = [];
        for (let key of fileList) {
          arr.push({
            media_type: key.type,
            url: key.path
          });
          key.url = app.globalData.serverUrl + key.path;
          key.type = key.type == 0 ? 'image' : 'video';
        }
        postData.medias = arr;
        this.setData({
          fileList,
          medias: fileList,
          data: res.data,
          show: 'audit_status' in res.data
        })
      }
      this.setData({
        postData,
        options
      })

      this.verify();
    })
  },
  onReady() {
    this.verify();
  },
  input(e) {
    this.setData({
      'postData.content': e.detail
    })
    this.verify();
  },
  onChange(e) {
    let {
      i
    } = e.currentTarget.dataset;
    this.setData({
      [`postData.${i}`]: e.detail * 2
    })
    this.verify();
  },
  delete(e) {
    let {
      fileList,
      postData
    } = this.data, medias = postData.medias;
    fileList.splice(e.detail.index, 1);
    medias.splice(e.detail.index, 1);
    this.setData({
      medias,
      fileList
    })
    this.verify();
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servPhone,
    })
  },
  save() {
    let {
      postData,
      data,
    } = this.data;
    'id' in data ? postData.review_id = data.id : '';
    let d = {
      ...postData
    };

    http.postReq("/review/front/", d, res => {
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 2000)
    })
  },
  verify() {
    let d = this.data.postData,
      disable = d.env_score !== 0 && d.tea_score !== 0 && d.eff_score !== 0 && d.ser_score !== 0 && d.content !== '' && d.medias.length !== 0;
    this.setData({
      disable
    })
    return disable;
  },
  onPullDownRefresh() {
    this.onLoad(this.data.options);
  },
  submit() {
    let {
      postData,
      data
    } = this.data;
    if ('id' in data) {
      if (data.audit_status == 2) {
        postData.reset_submit = 1;
      }
      postData.review_id = data.id;
      postData.submit = 1;
    } else {
      postData.submit = 1;
    }

    http.postReq("/review/front/", postData, res => {
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 2000)
    })
  },
  onShareAppMessage() {

  }
})