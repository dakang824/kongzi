let app = getApp(),
  http = require('../../common/request.js');
import Util from '../../utils/util.js';
import Dialog from '../../dist/dialog/dialog';
//获取应用实例
var start;
Page({
  data: {
    showPage:false,
    overlay:false,
    hide:true,
    hideIndex:'',
    hidePage:true,
    arrData:[],
    indcurrent:0,
    data: [],
    circular: true,
    oldData: [],
    prenum: 0,
    indnum: 0,
    tabBar: app.globalData.tabBar,
    d: [],
    collect_count: 0,
    cache: false,
    show: false,
    isShare: false,
    isNeed: true,
    commentInfo: '',
    comment_page_no: 1,
    comments: [],
    page_no: 1,
    current: 0,
    videosArr: [],
    ...app,
    type: ['萌娃', '萌宠', '美食', '旅游', '教育'],
    typeInd:0,
    // videoArr:[{}],
    videoCtx: [],
    isPlay: false,
    percent: 0,
    pages: 0,
    page: 1,
    icons: '',
    showBtn: false,
    navCurrent: 0,
  },
  typeActive(e){
    let first=true;
    this.setData({ hide:false,showBtn:false,percent:0,typeInd: e.currentTarget.dataset.i,page_no:1,videosArr:[],oldData:[],data:[]});
    this.loadData(first);
    setTimeout(()=>{
      this.videoCtx = wx.createVideoContext('video0');
      this.videoCtx.play();
    },2000)
  },
  swiperItem(e){
    this.setData({ dy: e.detail.dy>0})
  },
  toggleShow() {
    this.setData({
      show: !this.data.show
    })
  },
  onBlur(e) {
    this.setData({
      keyBoardHeight: ''
    })
  },
  onFocus(e) {
    this.setData({
      keyBoardHeight: e.detail.height
    })
  },
  next(e) {
    (e.current == 1 && this.data.oldData.length == 0) ? '' : this.swiperChange1({
      detail: e
    });
  },
  pre(e) {
    if (this.data.oldData.length) {
      this.swiperChange1({
        detail: e
      })
    }
  },
  swiperChange(e){
    this.videoCtx.pause();
    this.setData({showBtn:false,percent:0,overlay:true})
    this.videoCtx = wx.createVideoContext(e.detail.currentItemId);
    this.videoCtx.play();
  },
  animationfinish(e) {
    let {
      current,
      data,
      dy
    } = this.data;
    dy ? this.next(e.detail) : this.pre(e.detail);
    data[e.detail.current].view_count = data[e.detail.current].view_count + 1;
    this.setData({
      percent: 0,
      data,
      overlay:false,
      indcurrent: e.detail.current,
    })
    http.postReq("/community/video2/", {
      cmd: "video2Play",
      video_id: data[e.detail.current].video_id
    }, res => {})
  },
  swiperChange2(e) {
    let {
      videosArr,
      current,
      d,
      data,
      oldData,
      prenum,
    } = this.data;
    // let video = 'video' + (e.detail.t ? e.detail.current : current ? 0 : 1);
    if (e.detail.t) {
      if (videosArr.length) {
        oldData.push(data.splice(current, 1)[0]); //把data里面的上一个放到oldData里面;
        //如果videosArr有数据,就从videosArr里面取第一个放到显示当前的上一个
        data.splice(current, 0, videosArr.shift());
        this.setData({
          oldData,
          data
        });
        videoCtx.play();
      } else {
        wx.showToast({
          title: '已加载全部',
          icon: 'none'
        });
      }
    } else {
      if (oldData.length) {
        //把data里面的上一个放到videosArr.第一个
        videosArr.unshift(data.splice(current ? 0 : 1, 1)[0]);
        //取oldData数据的最后一个放到现在显示的上一个
        data.splice(current ? 0 : 1, 0, oldData.pop());
        this.setData({
          videosArr,
          data,
          oldData
        });
        videoCtx.play();
      }
    }

    data[e.detail.current].view_count = data[e.detail.current].view_count + 1;
    this.setData({
      percent: 0,
      data,
      videosArr,
      current: e.detail.current
    });

    this.changeSubject(e.detail.current);
    
  },
  swiperChange1(e) {
    let {
      videosArr,
      current,
      data,
      oldData,
      dy,
    } = this.data, newcurrent = e.detail.current;
    if (dy) {
      let i = newcurrent == 1 ? 3 : newcurrent == 2 ? 0 : newcurrent == 3 ? 1 : newcurrent == 0 ? 2 : ''; 
      if (videosArr.length) {
        oldData.push(data.splice(i, 1)[0]); //把data里面的上一个放到oldData里面;
        //如果videosArr有数据,就从videosArr里面取第一个放到显示当前的上一个
        data.splice(i, 0, videosArr.shift());
        this.setData({
          data,
          oldData,
          current: newcurrent
        });
      } else {
        wx.showToast({
          title: '已加载全部',
          icon: 'none'
        });
      }
    } else{
      let t = current == 1 ? 3 : current == 2 ? 0 : current == 3 ? 1 :current == 0 ? 2 : ''; 
        //把data里面的上一个放到videosArr.第一个
      videosArr.unshift(data.splice(t, 1)[0]);
        //取oldData数据的最后一个放到现在显示的上一个
      data.splice(t, 0, oldData.pop());
      this.setData({
        data,
        videosArr,
        current: newcurrent
      });
    }
    this.setData({
      videosArr,
      oldData,
      showBtn:false,
    });
    this.changeSubject(newcurrent);
  },
  onLoad(o) {
    Util.editTabbar();
    if ('b' in o) {
      let d = JSON.parse(o.b),
        {
          data
        } = this.data;
      d.video_url = decodeURIComponent(d.video_url);
      data.push(d);
      this.setData({
        data,
        isShare: 'b' in o,
      });
    }
    this.setData({showPage:app.globalData.setting.showVideo2})
    let first = true;
    this.loadData(first);
  },
  onShow() {
    let { hidePage, indcurrent, globalData } = this.data, platform = globalData.systemInfo.platform;
    if(!hidePage){
      if (platform == "android") {
        this.setData({ hidePage: true, hideIndex: '', showBtn: false});
        setTimeout(()=>{
          this.videoCtx = wx.createVideoContext('video' + indcurrent);
          this.videoCtx.play();
        },1000)
      }else{
        this.setData({ hidePage: true,showBtn:false});
        this.videoCtx.play();
      }
    }

    http.postReq("/community/video2/", {
      type: 1,
      page_no: 1,
      page_size: 1000,
      cmd: 'getMyVideo2s'
    }, res => {
      this.setData({
        collect_count: res.data.records.length
      })
    })
  },
  videoOver(e) {
    console.log(e);
  },
  onReady() {
    this.videoCtx=wx.createVideoContext('video0');
    this.videoCtx.play();

    // let {videoCtx}=this.data;
    // for(var i=0;i<4;i++){
    //   videoCtx.push(wx.createVideoContext('video'+i));
    // }
    // videoCtx[0].play();
    // this.setData({videoCtx})

    // wx.getNetworkType({
    //   success(res) {
    //     res.networkType != 'wifi' ? Dialog.confirm({
    //       title: '温馨提示',
    //       message: '检测到您的网络为' + res.networkType + ',是否继续播放',
    //       confirmButtonText: "我知道了"
    //     }).then(() => {
    //       this.start();
    //     }).catch(() => {
    //       // on cancel
    //       }) : this.start();
    //   }
    // })
  },
  toLike() {
    let {
      data,
      indcurrent
    } = this.data;
    let liked = data[indcurrent].liked,
      like_count = data[indcurrent].like_count;
    data[indcurrent].like_count = liked ? like_count - 1 : like_count + 1;
    data[indcurrent].liked = !liked;
    this.setData({
      data
    })
    http.postReq("/community/video2/", {
      cmd: "likeVideo2",
      video_id: data[indcurrent].video_id
    }, res => {})
  },
  toDisLike() {
    let {
      data,
      indcurrent
    } = this.data;
    let disliked = data[indcurrent].disliked,
      dislike_count = data[indcurrent].dislike_count;
    data[indcurrent].dislike_count = disliked ? dislike_count - 1 : dislike_count + 1;
    data[indcurrent].disliked = !disliked;
    this.setData({
      data
    })
    http.postReq("/community/video2/", {
      cmd: "dislikeVideo2",
      video_id: data[indcurrent].video_id
    }, res => {})
  },
  toCollect() {
    let {
      data,
      indcurrent
    } = this.data;
    data[indcurrent].collected = !data[indcurrent].collected
    this.setData({
      data
    })
    http.postReq("/community/video2/", {
      cmd: "collectVideo2",
      video_id: data[indcurrent].video_id
    }, res => {
      this.onShow();
    })
  },
  onHide() {
    let { current, globalData } = this.data, platform=globalData.systemInfo.platform;
    this.videoCtx.pause();
    this.setData({ hidePage: false })
    if (platform == "android"){
      this.setData({hideIndex: current });
    }
  },
  showComment() {
    this.setData({
      comment_page_no: 1,
      show: true,
      comments:[]
    });
    let {
      data,
      indcurrent,
      comment_page_no
    } = this.data;
    http.postReq("/community/video2/", {
      cmd: "getVideo2Comments",
      video_id: data[indcurrent].video_id,
      page_no: comment_page_no,
      page_size: 6,
    }, res => {
      this.setData({
        comment_page_no: this.data.comment_page_no + 1,
        comments: res.data.records,
        commentsIsData: res.data.records.length == 6
      });
    })
  },
  scrollTolower(e) {
    let {
      data,
      indcurrent,
      comment_page_no,
      commentsIsData
    } = this.data;
    commentsIsData ? http.postReq("/community/video2/", {
      cmd: "getVideo2Comments",
      video_id: data[indcurrent].video_id,
      page_no: comment_page_no,
      page_size: 5,
    }, res => {
      this.setData({
        comments: this.data.comments.concat(res.data.records),
        show: true,
        comment_page_no: this.data.comment_page_no + 1,
        commentsIsData: res.data.records.length == 5
      });
    }) : '';
  },
  onSend: Util.throttle(function(e) {
    let {
      data,
      indcurrent
    } = this.data;
    http.postReq("/community/video2/", {
      cmd: "addVideo2Comment",
      video_id: data[indcurrent].video_id,
      content: encodeURIComponent(e.detail)
    }, res => {
      data[indcurrent].comment_count = data[indcurrent].comment_count + 1;
      this.setData({
        data,
        commentInfo: ''
      })
    })
  }),
  showCollect() {
    wx.navigateTo({
      url: '/pages/video/collect/collect',
    })
  },
  play() {
    if (this.data.isPlay) {
      this.videoCtx.play()
      this.setData({ showBtn:false})
    } else {
      this.videoCtx.pause();
      this.setData({ showBtn: true })
    }
  },
  bindPlay(e) {
    this.setData({
      isPlay: false
    })
  },
  bindPause(e) {
    this.setData({
      isPlay: true
    })
  },
  ended() {
    this.videoCtx.seek(0); //重新播放
  },
  loadData(first) {
    let that = this,
      {
        page_no,
        videosArr,
        isShare,
        d,
        data,
        typeInd
      } = this.data;
    http.postReq("/community/video2/", {
      cmd: "getVideo2s",
      page_no,
      type: typeInd,
      page_size: 20
    }, res => {
      let records = res.data.records;
      if(page_no==1){
        http.postReq("/community/video2/", {
          cmd: "video2Play",
          video_id:records[0].video_id
        }, res => { })
      }
      if (first) {
        let d = records.splice(0, (isShare ? 3 : 4));
        this.setData({
          data: data.concat(d)
        });
      }
      this.setData({
        videosArr: videosArr.concat(records),
        hide: true
      })
    })
  },
  changeSubject(current) {
    let {
      videosArr,
      page_no,
    } = this.data;
    // 自动加载
    // this.setData({isPlay:true})
    var diff = videosArr.length;
    if (diff <= 3) {
      this.setData({
        page_no: page_no + 1
      })
      this.loadData();
    }
  },
  // 视频播放时间更新
  timeupdate(e) {
    let {
      currentTime,
      duration
    } = e.detail, percent = Math.round(currentTime / duration * 100);
    this.setData({
      percent,
      isPlay:false
    })
  },
  onShareAppMessage(e) {
    let {
      data,
      indcurrent,
      globalData
    } = this.data, btnShare = (e.from == 'button'), user = wx.getStorageSync('userInfo');
    if (btnShare) {
      http.postReq("/community/video2/", {
        cmd: "sharedVideo2",
        video_id: data[indcurrent].video_id
      }, res => {
        data[indcurrent].share_count = data[indcurrent].share_count + 1;
        this.setData({
          data
        })
      })
    }

    if (globalData.systemInfo.platform == "android") {
      this.setData({ hideIndex: current, hidePage: false});
      this.videoCtx.pause();
    }
    let b = {
      ...data[indcurrent]
    };
    b.video_url = encodeURIComponent(b.video_url);

    return {
      title: btnShare ? user.nickname + '分享给你一个小视频' : '孔紫小视频',
      path: `/pages/video/video?from_id=${user.id}&b=${JSON.stringify(b)}`
    }
  }
})