let APP = getApp(),
  http = require('../../../common/request.js'),
  videoContext;
Page({
  data: {
    currentIndex: 0,
    show: false,
    dataList: [],
    url: APP.globalData.serverUrl,
    videoList: [],
    seconds: 3,
    timer: null,
    timer1: null, //3秒的倒计时
    timer2: null, //15秒的倒计时
    num: 0,
    randomNum: null,
    left: null,
    top: null,
    noData: true,
    indexCurrent: null,
    daojishi: 15,
    showFull: false,
    isFull: false, //是否是全屏模式
    showPlayIcom: true, //是否显示播放按钮
  },
  onLoad(o) {
    new Promise((resolve, reject) => {
      http.postReq("/community/award/", {
        cmd: 'querySignAds',
      }, res => {
        let arr = [];
        for (let key of res.data) {
          arr.push(key.video_path);
        }
        this.setData({
          dataList: res.data,
          noData: !(res.data.length == 0),
          videoList: this.data.videoList.concat(arr)
        })
        resolve(res.data);
      })
    }).then((e) => {
      http.postReq("/community/award/", {
        cmd: 'showSignAds',
        ad_id: e[0].id
      }, res => {
        this.setData({
          show_id: res.show_id,
          ad_id: e[0].id
        })
      })
    })
  },
  handleChange(e) {
    let {
      current
    } = e.detail, {
      dataList
    } = this.data;
    this.setData({
      currentIndex: current,
      showFull: false,
      daojishi: 15,
      showPlayIcom: true,
      ad_id: dataList[current].id,
    })
    clearInterval(this.data.timer2);
    http.postReq("/community/award/", {
      cmd: 'showSignAds',
      ad_id: dataList[current].id
    }, res => {
      let {
        show_id
      } = res;
      this.setData({
        show_id
      })
    })
    this.dataInit();
  },
  dataInit() {
    let that = this;
    clearInterval(that.data.timer);
    clearInterval(that.data.timer1);

    that.setData({
      seconds: 3,
      timer: null,
      timer1: null,
      num: 0,
      randomNum: null,
      left: null,
      top: null,
      show: false,
      daojishi: 15
    })
  },
  clickPlay(e) {
    let that = this;
    videoContext = wx.createVideoContext('video' + that.data.currentIndex, this) //这里对应的视频id
    videoContext.requestFullScreen({
      direction: 0
    });
    setTimeout(() => {
      videoContext.play();
    }, 800)
    this.daojishi();
    this.setData({
      isFull: true,
      showPlayIcom: false,
      showFull: true,
    })
    let {
      ad_id,
      show_id
    } = this.data;
    http.postReq("/community/award/", {
      cmd: 'viewSignAds',
      ad_id,
      show_id
    }, res => {
      this.setData({
        watch_id: res.watch_id
      })
      this.dataInit();
      this.Countdown();
      this.setData({
        randomNum: that.randomNum(10, 13)
      })
    })
  },

  //暂停播放
  bindpause() {
    let that = this;
    that.clearTimer();
    clearInterval(that.data.timer2);
  },
  //播放到末尾
  bindended() {
    let that = this
    clearInterval(that.data.timer2);
    videoContext.exitFullScreen(); //退出全屏
    that.setData({
      daojishi: 15,
      isFull: false,
      showPlayIcom: true,
      showFull: false,
      show: false
    })
  },
  //退出全屏
  backFull() {
    let that = this;
    videoContext.stop();
    videoContext.exitFullScreen();
    clearInterval(that.data.timer2);
    that.setData({
      isFull: false,
      showPlayIcom: true,
      showFull: false,
      show: false,
      timer2: null,
    })
    that.dataInit();
  },
  daojishi() {
    let that = this;
    let timer2 = setInterval(() => {
      if (that.data.daojishi == 0) {
        clearInterval(that.data.timer2);
        that.setData({
          show: false,
        })
      } else {
        --that.data.daojishi;
        that.setData({
          daojishi: that.data.daojishi
        })
      }
    }, 1000)
    that.setData({
      timer2
    })
  },
  Countdown() {
    let that = this;
    let timer = setTimeout(function () {
      that.setData({
        num: that.data.num + 1
      })
      if (that.data.num == that.data.randomNum) {
        that.setData({
          show: true,
          left: that.randomX(0, 210),
          top: that.randomY(0, 820)
        })
        let timer1 = setInterval(() => {
          if (that.data.seconds == 0) {
            clearInterval(that.data.timer);
            that.setData({
              show: false,
            })
          } else {
            console.log(--that.data.seconds);
            that.setData({
              seconds: that.data.seconds
            })
          }
        }, 1000)
        that.setData({
          timer1: timer1
        })
      }
      that.Countdown();
    }, 1000);
    this.setData({
      timer: timer
    })
  },
  clearTimer() {
    clearInterval(this.data.timer)
  },

  getTickets() {
    let that = this,
      {
        ad_id,
        show_id,
        watch_id
      } = this.data;
    http.postReq("/community/award/", {
      cmd: 'getTicketFromSignAds',
      ad_id,
      show_id,
      watch_id
    }, res => {
      wx.showToast({
        title: res.showMsg,
        icon: "none"
      })
      that.setData({
        show: false
      })
      for (let i = 0, len = that.data.dataList.length; i < len; i++) {
        if (that.data.ad_id == that.data.dataList[i].id) {
          that.data.dataList[i].get_tickets = 1;
          that.setData({
            dataList: that.data.dataList
          })

        }
      }
    })
  },
  bindfullscreenchange(e) {
    let that = this;
    if (e.detail.fullScreen) { //进入全屏

    } else { //退出全屏
      videoContext.stop();
      videoContext.exitFullScreen();
      clearInterval(that.data.timer2);
      that.setData({
        isFull: false,
        showPlayIcom: true,
        showFull: false,
        show: false,
        timer2: null,
      })
      that.dataInit();
    }
  },
  onChange(e) {
    this.setData({
      timeData: e.detail
    });
  },
  call(e) {
    let {
      mobile,
    } = e.target.dataset.i;
    if (mobile) {
      wx.makePhoneCall({
        phoneNumber: mobile,
        success: () => {
          let {
            ad_id,
            show_id
          } = this.data;
          http.postReq("/community/award/", {
            cmd: 'phoneSignAds',
            ad_id,
            show_id
          }, res => { })
        }
      })
    }
  },
  //长按扫码
  longPress() {
    let {
      ad_id,
      show_id
    } = this.data;
    http.postReq("/community/award/", {
      cmd: 'scanSignAds',
      ad_id,
      show_id
    }, res => { })
  },
  randomNum(minNum, maxNum) {
    return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
  },
  randomX(minNum, maxNum) {
    this.setData({
      left: parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
    })
  },
  randomY(minNum, maxNum) {
    this.setData({
      top: parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
    })
  },
  closeMask() {
    this.setData({
      show: false,
    })
  },
  onShareAppMessage() { }
})