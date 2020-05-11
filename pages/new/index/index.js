let APP = getApp(),
  {
    isNewUser,
    serverUrl,
    imageurl,
    ticket_count,
    my_count,
    servPhone,
    tabBar,
  } = APP.globalData;
import Util from '../../../utils/util.js';
import http from '../../../common/request.js';
Page({
  data: {
    show_courseOnline:0,
    uplineData:false,
    childNoData: false,
    childData: [],
    page_no: 1,
    getLoginMoney: false,
    show_virus: false,
    lineUp: [],
    lineDown: [],
    tabBar,
    login: {},
    isNeed: true,
    fixed: false,
    tabs: 1,
    init: 0, // 是否加载 0：未加载，1：已加载
    btnActive: 1,
    awards_today: [], //今日开奖数据
    awards_unDraw: null, //待抽奖数据
    serverUrl,
    isNewUser,
    ticket_count,
    my_count,
    imgUrl: imageurl,
    showMask: false, //遮罩层
    hasTickets: true, //是否领取抽奖券
    authoaddress: false,
    showDraw: false, //已中奖
    invalid: false, //活动失效
    current: 0,
    join_count: 0,
    lost_count: 0,
    win_count: 0,
    newUser: false,
    messageList: [],
    showbox: true,
    holiday: false,
    dayList: [{
      msg: "天天抽奖、好运不断，每晚锁定七点半"
    }, {
      msg: "天天抽奖、好运不断，每晚锁定七点半"
    }],
    boxNum: 1,
    getActsNearby: {
      cmd: 'getActsNearbyV22',
      distance: '',
      status: '',
      course_type: '',
      age_from: '',
      age_to: '',
      condition: '',
      latitude: '',
      longitude: '',
      page_size: 10,
      page_no: 1,
      course_online: 1
    },
    card: [{
        img: 'home_icon1.png',
        url: '/pages/nearby/nearby?tabInd=0',
        name: '教培优选'
      },
      {
        img: 'home_icon2.png',
        url: '/pages/bargain/tempfile/tempfile?type=2',
        name: '亲子玩乐'
      },
      {
        img: 'home_icon3.png',
        url: '/pages/bargain/tempfile/tempfile?type=3',
        name: '健康医疗'
      },
      {
        img: 'home_icon4.png',
        url: '/pages/bargain/tempfile/tempfile?type=4',
        name: '美食餐饮'
      },
      {
        img: 'home_icon5.png',
        url: '/pages/bargain/tempfile/tempfile?type=5',
        name: '学校排名'
      },
      //   {
      //     img: 'class.png',
      //     // url: '/pages/index/index',
      //     name: '教培优选'
      // },
      // {
      //   img: 'ticket.png',
      //   url: '/pages/shopMall/local/local',
      //   name: '本地玩乐'
      // },
      // {
      //   img: 'home_icon2.png',
      //   url: '/pages/nearby/nearby?tabInd=1',
      //   name: '亲子乐园'
      // },
      // {
      //   img: 'ticket.png',
      //   url: '/pages/nearby/nearby?tabInd=1',
      //   name: '儿童乐园'
      // },
      //  {
      //   img: 'foods.png',
      //   url: '/pages/shopMall/card/card?type=3',
      //   name: '亲子美食'
      // },
      // {
      //   img: 'foods.png',
      //   url: '/pages/shopMall/card/card?type=3',
      //   name: '附近餐馆'
      // },
      //  {
      //   img: 'youhui.png',
      //   url: '/pages/shopMall/card/card?type=1',
      //   name: '优惠卡券'
      // },
      // {
      //   img: 'prize1.png',
      //   url: '/pages/shopMall/goodThings/goodThings',
      //   name: '精选好物'
      // },
      // {
      //   img: 'ticket.png',
      //   url: '/pages/shopMall/mother/baby',
      //   name: '母婴代购'
      // }
    ]
  },
  closeNewUserMoney() {
    this.setData({
      getLoginMoney: false
    })
  },
  welfare_jump() {
    http.postReq("/community/pbcode/", {
      cmd: 'getApplyPublicBenefitInfo'
    }, res => {
      wx.navigateTo({
        url: res.data.length && (res.data[0].status === 1 || res.data[0].status === 2 || res.data[0].status === 0) ? '/pages/personal/welfare/status/status' : '/pages/personal/welfare/welfare',
      })
    })
  },
  tabsClick(e) {
    this.setData({
      tabs: e.currentTarget.dataset.index
    })
  },
  getMessage() {
    let that = this;
    that.setData({
      messageList: []
    })
    clearInterval(that.data.timer1);
    http.postReq("/community/award/", {
      cmd: "getjoinDrawMessages",
    }, res => {
      if (that.data.boxNum == 1) {
        let timer2 = setTimeout(() => {
          that.setData({
            messageList: res.data,
            showbox: false,
          })
          res.data.length ? that.setData({
            boxNum: 2
          }) : '';
        }, 5000);
        that.setData({
          timer2
        })
      } else {
        that.setData({
          messageList: res.data,
        })
      }
    })
    that.showMessage();
  },
  showMessage() {
    let that = this;
    let timer1 = setInterval(() => {
      that.getMessage();
    }, 35000)
    that.setData({
      timer1
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: servPhone,
    })
  },
  swiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },
  onLoad(options) {
    Util.editTabbar();
    wx.getStorage({
      key: 'homeInit',
      success: res => {
        this.setData({
          ...options,
          ...res.data
        });
      }
    })
    Util.getElementTopHeight({
      that: this,
      id: "#tabs",
      success: res => {
        let {
          top
        } = res[0];
        this.setData({
          top
        })
        options && 'tabs' in options ? wx.pageScrollTo({
          scrollTop: top,
          duration: 300
        }) : '';
      }
    })
    this.homePageInit();
    // 验证是否授权地理位置，在初始化首页数据
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        res.latitude ? this.homePageInit() : wx.showToast({
          title: '无法获取您的位置信息',
          icon: 'none'
        });
      },
      fail: res => {
        wx.getSetting({
          success: res => {
            res.authSetting['scope.userLocation'] ? this.homePageInit() : this.setData({
              authoaddress: true
            });
          }
        })
      }
    })
  },
  agreeAddress() {
    let that = this;
    wx.getSetting({
      success(res) {
        let d = res.authSetting['scope.userLocation'];
        that.setData({
          authoaddress: !d
        })
        d ? that.onLoad() : '';
      }
    })
  },
  clickAds(e) {
    http.postReq("/community/user/", {
      cmd: 'clickAds',
      ad_id: e.currentTarget.dataset.i,
    }, res => {})
  },
  swiperJump(e){
    let {url}=e.currentTarget.dataset,start=url.indexOf('?'),t=JSON.parse('{"' + url.substr(start+1).replace(/&/g, '","').replace(/=/g, '":"')+ '"}');
    'id' in t&&t.id==''?'':wx.navigateTo({
      url,
    })
  },
  swiperSwitch(e) {
    this.setData({
      btnActive: e.currentTarget.dataset.i
    });
  },
  homePageInit() {
    let that = this;
    new Promise((resolve, reject) => {
      http.postReq("/community/user/", {
        cmd: "homePageInitV20",
        ...wx.getStorageSync('position')
      }, res => {
        try {
          wx.stopPullDownRefresh();
          let arr = [],
            len = res.awards_unDraw.length,
            n = 3,
            lineNum = len % 3 === 0 ? len / 3 : Math.floor((len / 3) + 1);

          for (let i = 0; i < lineNum; i++) {
            arr.push(res.awards_unDraw.slice(i * n, i * n + n));
          }
          for (let key of res.awards_today) {
            key.draw_time ? key.draw_second = parseInt(new Date(key.draw_time.slice(0, 19).replace(/-/g, "/")).getTime() - new Date().getTime()) : '';
          }
          this.getMessage()
          this.isPrize();
          let {
            awards_today,
            ad1,
            show_courseOnline
          } = res;
          this.setData({
            awards_today,
            ad1,
            show_courseOnline,
            awards_unDraw: arr,
            show_virus: res.show_virus
          })
          wx.getStorageSync('position') === '' ? APP.getAddress(() => {
            that.setData({
              province: wx.getStorageSync('address').ad_info.province
            })
          }) : '';
          resolve();
        } catch (e) {
          resolve();
        }
      })
    }).then(() => {
      if ('loginMsg' in wx.env) {
        let d = wx.env.loginMsg;
        that.setData({
          login: d,
          ticket_count: d.ticket_count,
          my_count: d.my_count,
          isNewUser: d.isNewUser,
          holiday: 'notify' in d,
          getLoginMoney:false,
          // d.get_bonus.get_bonus == 0
        })
        if (d.status == 5) {
          APP.globalData.disableTab = false;
        }
        //是新用户
        if (APP.globalData.isNewUser) {
          that.setData({
            newUser: true,
          });
          APP.globalData.isNewUser = false
        };

        APP.globalData.isNewUser
      }
    }).then(() => {
      http.postReq("/community/user/", {
        cmd: "getHomeRecommend1",
      }, res => {
        that.setData({
          recom1: res.recom1,
          ope_id: wx.getStorageSync('userInfo').id,
        })

        let {
          awards_today,
          awards_unDraw,
          recom1,
          ad1
        } = this.data;

        wx.setStorage({
          key: 'homeInit',
          data: {
            recom1,
            ad1
          },
        })
      })

      // http.postReq("/community/user/", {
      //   cmd: "getHomeRecommend2",
      // }, res => {
      //   that.setData({
      //     recom2: res.recom2
      //   })
      // })
      // http.postReq("/community/user/", {
      //   cmd: "getHomeRecommend3",
      // }, res => {
      //   that.setData({
      //     recom3: res.recom3,
      //     province: wx.getStorageSync('address').ad_info.province,
      //   })
      // })
    })
  },
  getChildData() {
    let {
      page_no,
      childData
    } = this.data;
    http.postReq("/community/product/", {
      cmd: 'queryProductsWithType',
      condition: '',
      type: 1,
      page_no,
      page_size: 10,
    }, res => {
      page_no == 1 ? childData = [] : '';
      this.setData({
        childData: childData.concat(res.data.records),
        childNoData: res.data.records.length != 10
      });
    })
  },
  onReady() {
    let {
      getActsNearby
    } = this.data, data = {
      ...getActsNearby
    };
    data.course_online = 0;
    this.getCourseData(getActsNearby);
    // this.getCourseData(data);//线下课程
    this.getChildData();
  },
  getCourseData(d) {
    let {
      lineUp,
      lineDown,
      getActsNearby
    } = this.data;
    http.postReq("/community/user/", d, res => {
      let data = res.data.records;
      for (let key of data) {
        key.top_pic = key.pic_path;
        key.type = key.course_type == 4 ? 2 : 1;
        key.prod_no = key.no;
        key.prod_id = key.inst_id;
        key.price = key.act_price;
        key.name = key.title;
      }
      d.course_online == 1 ? this.setData({
        lineUp: lineUp.concat(data),
        uplineData: data.length != getActsNearby.page_size
      }) : this.setData({
        lineDown: lineDown.concat(data)
      });
    })
  },
  know() {
    http.postReq("/community/user/", {
      cmd: "confirmNotify",
      open_id: wx.getStorageSync('userInfo').open_id
    }, res => {
      delete wx.env.loginMsg.notify;
      this.setData({
        holiday: false
      })
    })
  },
  getTickets() {
    http.postReq("/community/award/", {
      cmd: "getDrawTicket",
    }, res => {
      this.setData({
        hasTickets: false
      })
    })
  },
  isPrize() {
    http.postReq("/community/award/", {
      cmd: "getMyJoinAwardResultRecord",
    }, res => {
      let {
        join_count,
        lost_count,
        win_count
      } = res;
      this.setData({
        showDraw: res.show == 1,
        join_count,
        lost_count,
        win_count,
      })
    })
  },
  iKnow() {
    let that = this;
    http.postReq("/community/award/", {
      cmd: "changeUserDrawWindowShowStatus",
    }, res => {})
  },
  closeMask() {
    this.setData({
      showMask: false
    })
  },
  closeDraw() {
    this.setData({
      showDraw: false
    })
  },
  closeShowDraw() {
    this.iKnow();
    this.setData({
      showDraw: false,
    })
  },
  closeNewUser() {
    this.setData({
      isNewUser: false,
    })
    wx.env.loginMsg.isNewUser = false;
  },
  onShow() {
    let login = this.data.login;
    Object.keys(login).length && login.status != 5 ? this.homePageInit() : '';
    wx.getStorageSync('b') === '' ? '' : wx.removeStorageSync('b');
  },
  onPullDownRefresh() {
    this.data.login.status == 5 ? '' : this.homePageInit();
    this.setData({
      lineUp: [],
      childNoData: false,
      uplineData:false,
      childData: [],
      page_no: 1,
      'getActsNearby.page_no':1
    });
    this.onReady();
    this.getChildData();
  },
  onReachBottom() {
    let {
      tabs,
      page_no,
      getActsNearby
    } = this.data;
    if (tabs == 6) {
      this.setData({
        page_no: page_no + 1
      })
      this.getChildData();
    } else if (tabs == 4) {
      let {getActsNearby} = this.data;
      getActsNearby.page_no += 1;
      this.getCourseData(getActsNearby);
      this.setData({
        getActsNearby
      })
    }
  },
  onShareAppMessage() {
    return {
      title: '推荐给你，好玩！有趣！有用！',
      path: `/pages/new/index/index?from_id=${wx.getStorageSync('userInfo').id}`
    }
  },
  onHide() {
    clearInterval(this.data.timer1);
    clearTimeout(this.data.timer2);
  },
  onUnload() {
    clearInterval(this.data.timer1);
    clearTimeout(this.data.timer2);
  },
  onPageScroll(e) {
    this.setData({
      fixed: e.scrollTop > this.data.top
    })
  },
})