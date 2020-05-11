class loading {
  constructor(page, key, setting) {
    this.page = page;
    this.key = key;
    this.onLoad = setting.onLoad;
    this.onEnd
    this.onStart

    this.onStart();
    this.onLoad();
  }

  onStart() {
    var x = 0;
    var y = 1;
    this.timerInter = setInterval(() => {
      x += 1 / (Math.pow(2, y));
      y++;
      this.page.setData({
        loading: {
          x,
          y,
        }
      });
    }, 100);
  }

  onLoad() {
    
  }

  onRealod() {
    this.onStart();
    this.onLoad();
  }

  onEnd() {
    clearInterval(this.timerInter);
    this.page.setData({
      loading: {
        x: 5,
      }
    });
    setTimeout(() => {
      this.page.setData({
        loading: {
          isHide: true,
        }
      });
    }, 300);

    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    animation.translateX(0).opacity(1).step()

    this.page.setData({
      animationData: animation.export()
    })
  }
}

module.exports = loading;