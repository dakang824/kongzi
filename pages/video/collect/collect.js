let app = getApp(),
  http = require('../../../common/request.js');
import Dialog from '../../../dist/dialog/dialog';
Page({
  data: {
    show: false,
    percent: 0,
    postData: {
      type: 1,
      page_no: 1,
      page_size: 10,
      cmd: 'getMyVideo2s'
    },
    url: app.globalData.serverUrl,
    collectData: [],
    likeData: [],
    dislikeData: []
  },
  toggleShow() {
    this.videoCtx.pause();
    this.setData({
      show: !this.data.show
    })
  },
  onDelete(e) {
    let {
      i,
      ind
    } = e.currentTarget.dataset, {
      postData
    } = this.data;
    Dialog.confirm({
      title: '温馨提示',
      message: '是否删除此条视频？'
    }).then(() => {
      http.postReq("/community/video2/", {
        cmd: postData.type == 1 ? "collectVideo2" : postData.type == 2 ? "likeVideo2" : postData.type == 3 ? "dislikeVideo2" : '',
        video_id: i.video_id
      }, res => {
        if (postData.type == 1) {
          let {
            collectData
          } = this.data;
          collectData.splice(ind, 1);
          this.setData({
            collectData
          })
        } else if (postData.type == 2) {
          let {
            likeData
          } = this.data;
          likeData.splice(ind, 1);
          this.setData({
            likeData
          })
        } else if (postData.type == 3) {
          let {
            dislikeData
          } = this.data;
          dislikeData.splice(ind, 1);
          this.setData({
            dislikeData
          })
        }
        this.updata(i.video_id);
      })
    }).catch(() => {});
  },
  timeupdate(e) {
    let {
      currentTime,
      duration
    } = e.detail, percent = Math.round(currentTime / duration * 10000) / 100;
    this.setData({
      percent,
    })
  },
  showVideo(e) {
    let b = e.currentTarget.dataset.i;
    b.video_url = encodeURIComponent(b.video_url);
    wx.navigateTo({
      url: `/pages/personal/collectVideo/collectVideo?type=${this.data.postData.type}&b=${JSON.stringify(b)}`,
    })
    // this.videoCtx = wx.createVideoContext('myVideo');
    // this.videoCtx.play();
  },
  onChange(e) {
    let {
      postData
    } = this.data;
    postData.type = e.detail.index + 1;
    postData.page_no = 0;
    this.setData({
      postData,
      collectData: [],
      likeData: [],
      dislikeData: []
    });
    this.getData();
  },
  getData() {
    let {
      postData
    } = this.data;
    http.postReq("/community/video2/", postData, res => {
      postData.type == 1 ? this.setData({
        collectData: this.data.collectData.concat(res.data.records)
      }) : postData.type == 2 ? this.setData({
        likeData: this.data.likeData.concat(res.data.records)
      }) : postData.type == 3 ? this.setData({
        dislikeData: this.data.dislikeData.concat(res.data.records)
      }) : '';
      this.setData({
        'postData.page_no': this.data.postData.page_no + 1,
        noData: res.data.records == 10
      })
    })
  },
  onLoad() {
    this.videoCtx = wx.createVideoContext('myVideo');
  },
  onShow() {
    this.setData({
      collectData: [],
      likeData: [],
      dislikeData: [],
      'postData.page_no':1
    });
    this.getData();
  },
  updata(i) {
    let {
      postData
    } = this.data, pages = getCurrentPages(), prepage = pages[pages.length - 2];
    let {
      data,
      oldData,
      videosArr
    } = prepage.data;
    for (let key of data) {
      if (key.video_id == i) {
        postData.type == 1 ? key.collected = 0 : postData.type == 2 ? (key.liked = 0, key.like_count = key.like_count - 1) : postData.type == 3 ? (key.disliked = 0, key.dislike_count = key.dislike_count - 1) : '';
        break;
      }
    }
    for (let key of oldData) {
      if (key.video_id == i) {
        postData.type == 1 ? key.collected = 0 : postData.type == 2 ? (key.liked = 0, key.like_count = key.like_count - 1) : postData.type == 3 ? (key.disliked = 0, key.dislike_count = key.dislike_count - 1) : '';
        break;
      }
    }
    for (let key of videosArr) {
      if (key.video_id == i) {
        postData.type == 1 ? key.collected = 0 : postData.type == 2 ? (key.liked = 0, key.like_count = key.like_count - 1) : postData.type == 3 ? (key.disliked = 0, key.dislike_count = key.dislike_count - 1) : '';
        break;
      }
    }
    prepage.setData({
      data,
      oldData,
      videosArr
    });
  },
  onUnload() {

  },
  onReachBottom() {
    this.data.noData ? this.getData() : '';
  },
  onShareAppMessage() {

  }
})