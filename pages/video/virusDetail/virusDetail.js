import F2 from '../../../components/f2canvas/lib/f2';
let http = require('../../../common/request.js');
let runChart = null,
  chart = null,
  app = getApp();

function initData(canvas, width, height, run) {
  runChart = new F2.Chart({
    el: canvas,
    width,
    height,
    animate: false
  });
  runChart.source(run, {
    date: {
      type: 'timeCat',
      tickCount: 4,
      mask: 'MM-DD'
    },
    steps: {
      tickCount: 4
    }
  });
  runChart.scale('value', {
    tickCount: 7
  });
  runChart.tooltip({
    showItemMarker: false,
    showCrosshairs: true,
    background: {
      radius: 2,
      padding: [3, 5]
    },
    onShow(ev) {
      const items = ev.items;
      items[0].name = '';
      items[0].value = items[0].origin.date+'  '+items[0].origin.type + ':' + items[0].origin.value;
    }
  });
  runChart.legend({
    custom: false,
    position: 'top',
    align: 'right',
    itemWidth: null,
  });
  runChart.line().position('date*value').color('type');
  runChart.point().position('date*value').color('type');
  runChart.interaction('pan');
  runChart.render();
  return runChart;
}
function initChart(canvas, width, height) {
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApp().globalData.serverUrl}data/virus.json`,
      success: res => {
        let d = res.data.data.history.reverse(),
          run = [];
        for (let i=0;i<d.length;i++) {
          run.push({
            date: d[i].date,
            type: "新增确诊",
            value: i == 0 ? d[i].confirmedNum:d[i].confirmedNum-d[i-1].confirmedNum
          });
          run.push({
            date: d[i].date,
            type: "新增疑似",
            value: d[i].suspectedIncr
          })
        }
        resolve(run);
      }
    })
  }).then((run) => {
    F2.Global.setTheme({
      colors: [
        '#fa2335',
        '#DAA100',
      ],
      pixelRatio: 2,
    });
    initData(canvas, width, height, run);
  })
}
function initChart1(canvas, width, height) {
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApp().globalData.serverUrl}data/virus.json`,
      success: res => {
        let d = res.data.data.history.reverse(),
          run = [];
        for (let key of d) {
          run.push({
            date: key.date,
            type: "治愈",
            value: key.curesNum
          });
          run.push({
            date: key.date,
            type: "死亡",
            value: key.deathsNum
          })
        }
        resolve(run);
      }
    })
  }).then((run) => {
    F2.Global.setTheme({
      colors: [
        '#59BABE',
        '#444444',
      ],
      pixelRatio: 2,
    });
    initData(canvas, width, height, run);
  })
}
function initChart2(canvas, width, height) {
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApp().globalData.serverUrl}data/virus.json`,
      success: res => {
        let d = res.data.data.history.reverse(),
          run = [];
        for (let key of d) {
          run.push({
            date: key.date,
            type: "确诊",
            value: key.confirmedNum
          });
          run.push({
            date: key.date,
            type: "疑似",
            value: key.suspectedNum
          })
        }
        resolve(run);
      }
    })
  }).then((run) => {
    F2.Global.setTheme({
      colors: [
        '#fa2335',
        '#DAA100',
      ],
      pixelRatio: 2,
    });
    initData(canvas, width, height, run);
  })
}

Page({
  data: {
    // opts: {
    //   onInit: initChart
    // },
    // opts1: {
    //   onInit: initChart1
    // },
    // opts2: {
    //   onInit: initChart2
    // },
    activeName: '1',
    ...getApp().globalData
  },
  onChange(event) {
    this.setData({
      activeName: event.detail
    });
  },
  onLoad() {
    let { serverUrl } = getApp().globalData;
    wx.request({
      url: `${serverUrl}data/virus_total.json`,
      success: res => {
        let d = res.data.newslist[0].desc;
        this.setData({
          d: d.quanguoTrendChart,
        });
      }
    })
    wx.request({
      url: `${serverUrl}data/virus_city.json`,
      success: res => {
        this.setData({
          list: res.data.newslist
        });
      }
    })
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  }
});