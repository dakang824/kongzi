import Dialog from '../../dist/dialog/dialog';
let http = require('../../common/request.js'),
  utils = require('../../utils/util.js'),
  app = getApp(),
  setTime = null;
Page({
  data: {
    imgUrl: app.globalData.serverUrl,
    CustomBar: app.globalData.CustomBar,
    active: 0,
    postData: {
      act_type: '',
    },
    id: 2
  },
  onChange(event) {
    let ind = event.detail.index;
  },
  delect(e) {
    let data = e.currentTarget.dataset,
      that = this;
    Dialog.confirm({
      message: '您确定要删除该收藏活动吗?'
    }).then(() => {
      http.postReq("/community/user/", {
        cmd: 'collectActs',
        inst_id: data.inst_id,
        act_no: data.act_no,
        type: 0,
      }, function(res) {
        that.getData();
      })
    }).catch(() => {
      // on cancel
    });
  },
  countDown(t) {
    let that = this;
    var start = new Date(); //开始时间
    var end = new Date(t); //结束时间，可以设置时间
    var result = parseInt((end.getTime() - start.getTime()) / 1000); //计算出豪秒
    var d = parseInt(result / (24 * 60 * 60)); //用总共的秒数除以1天的秒数
    var h = parseInt(result / (60 * 60) % 24); //精确小时，用去余
    var m = parseInt(result / 60 % 60); //剩余分钟就是用1小时等于60分钟进行趣余
    return {
      dd: d < 10 ? d < 0 ? 0 : '0' + d : d,
      hh: h < 10 ? h < 0 ? '00' : '0' + h : h,
      mm: m < 10 ? m < 0 ? '00' : '0' + m : m,
    }
  },
  //得到数据
  getData() {
    clearInterval(setTime);
    let that = this,
      start = [],
      doing = [],
      end = [],
      type = this.data.postData.act_type;
    http.postReq("/community/user/", that.data.postData, function(res) {
      let data = res.data,
        i = 0;
      if (data.length) {
        for (let item of data) {
          item.act_type ? item.type = item.act_type : '';
          // item.time = utils.dateFormat(item.endDiff);
          item.time = that.countDown(item.end_time.slice(0, 19).replace(/-/g, "/"));
          item.start_time = item.start_time.slice(0, 10);
          item.end_time = item.end_time.slice(0, 10);
          item.id = that.data.id;
          if (that.data.id == 1) {
            var dis = item.distance.split('-');
            item.distance = (dis[0] / 1000).toFixed(1) + "~" + (dis[1] / 1000).toFixed(1)
          }
        }
        for (let item of data) {
          let dd = item.time ? item.time.dd : 0;
          if (item.status == 1) {
            start.push(item);
          } else if (item.status == 2 && (dd >= 2)) {
            doing.push(item);
          } else {
            end.push(item);
          }
        }
        that.setData({
          'list.all': data,
          'list.start': start,
          'list.doing': doing,
          'list.end': end
        })
      } else {
        that.setData({
          'list.all': '',
          'list.start': '',
          'list.doing': '',
          'list.end': ''
        })
      }
    })
  },
  onLoad: function(e) {
    // 设置标题
    wx.setNavigationBarTitle({
      title: e.type == 1 ? '活动参与' : e.type == 2 ? '活动收藏' : ''
    })
    this.setData({
      scrollHeight: app.globalData.systemInfo.screenHeight - 110,
      ope_id: wx.getStorageSync("userInfo").id,
    })
    if (e.type == 1) { //活动参与
      let { latitude, longitude } = wx.getStorageSync('position')
      this.setData({
        'postData.cmd': 'getMyActs',
        'postData.latitude': latitude,
        'postData.longitude': longitude,
        id: e.type,
      })
      this.getData();
    } else if (e.type == 2) { //活动收藏
      this.setData({
        'postData.cmd': 'queryMyCollectActsV2',
        id: e.type
      })
      this.getData();
    }
  },
  onShareAppMessage() {}
})