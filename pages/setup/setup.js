const ajax = require('../../utils/ajax.js'),app = getApp();
import Notify from '../../dist/notify/notify';
Page({
  data: {
    navigationBarTitleText: '',
    childname: '',
    childsex: '',
    childage: '',
    sexid: 2,
    name: '',
    age: '',
    ishidden: 'hidden',
    dis_status: true,
  },
  onLoad: function(options) {
    if (options.d) {
      var d = JSON.parse(options.d);
      this.setData({
        name: d.name,
        sexid: d.gender == 'm' ? 1 : d.gender == 'f' ? 0 : 0,
        age: d.age,
        childname: d.name,
        childage: d.age,
        childsex: d.gender,
        d: d
      });
      (d.name && d.gender && d.gender) ? this.setData({
        dis_status: false,
      }): this.setData({
        dis_status: true
      })
      wx.setNavigationBarTitle({
        title: '修改孩子'
      })
    }else{
      this.setData({
        navigationBarTitleText: options.title
      })
    }
  },
  onShareAppMessage() {},

  goback() {
    wx.navigateBack({
      delta: 1,
    })
  },

  inputcomplete(e) {
    if (e.currentTarget.dataset.id == 1) {
      let pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？0-9]");
      if (pattern.test(e.detail.value)) {
        let name = this.data.name;
        Notify('禁止输入特殊字符');
        this.setData({
          name: name.slice(0, name.length)
        })
        return;
      } else {
        this.setData({
          name: e.detail.value
        })
      }

      this.setData({
        childname: e.detail.value
      })
    } else {
      this.setData({
        childage: e.detail.value
      })
    }

    if (this.data.childname != '' && this.data.childage != '' && this.data.childsex != '') {
      this.setData({
        dis_status: false
      })
    } else {
      this.setData({
        dis_status: true
      })
    }
  },

  /*孩子性别*/

  sexchange(e) {
    if (e.currentTarget.dataset.id == 1) {
      this.setData({
        sexid: e.currentTarget.dataset.id,
        childsex: 'm'
      })
    } else {
      this.setData({
        sexid: e.currentTarget.dataset.id,
        childsex: 'f'
      })
    }

    if (this.data.childname != '' && this.data.childage != '' && this.data.childsex != '') {
      this.setData({
        dis_status: false
      })
    } else {
      this.setData({
        dis_status: true
      })
    }
  },


  /* 添加孩子 */
  addchild() {
    if(this.data.d){
      var d=this.data.d;
      ajax.request({
        cmd: 'modifyStudent',
        ope_id: d.user_id,
        stu_no: d.no,
        gender: this.data.childsex,
        age: this.data.childage,
        name: this.data.childname
      }).then(res => {
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];
        prevpage.onShow()
        wx.navigateBack({
          delta: 1,
        })
      })
    }else{
      if (this.data.childage < 100) {
        ajax.request({
          cmd: 'addStudent',
          gender: this.data.childsex,
          age: this.data.childage,
          name: this.data.childname
        }).then(res => {
          console.log(res)
          let pages = getCurrentPages();
          let prevpage = pages[pages.length - 2];
          prevpage.onShow()
          wx.navigateBack({
            delta: 1,
          })
        })
      } else {
        this.setData({
          ishidden: 'visible'
        })
      }
    }
  }
})