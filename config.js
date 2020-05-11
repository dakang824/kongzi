function back() {
  return wx.navigateBack({
    delta: 1
  });
}

module.exports = {
  back: back
};