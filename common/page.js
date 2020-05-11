export default function(options = {}) {
  return Page({
    onShareAppMessage() {
      return {
        title: ''
      };
    },
    onClickLeft(){
      return wx.navigateBack({
        delta: 1
      });
    },
    ...options
  });
}
