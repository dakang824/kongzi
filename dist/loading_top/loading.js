function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var queue = [],loading='';

function getContext() {
  var pages = getCurrentPages();
  return pages[pages.length - 1];
}

var Loading = function Loading(options) {
  options = _extends({}, Loading.currentOptions, options);
  return new Promise(function (resolve, reject) {
    var context = options.context || getContext();
    var dialog = context.selectComponent(options.selector);
    delete options.selector;
    if (dialog) {
      queue.push(dialog);
      loading = dialog;
    } else {
      console.warn('未找到 van-dialog 节点，请确认 selector 及 context 是否正确');
    }
  });
};

Loading.defaultOptions = {
  selector: '#loading',
};
Loading.start = function () {
  Loading();
  loading.start();
};
Loading.close = function () {
  loading.close();
};
Loading.setDefaultOptions = function (options) {
  Object.assign(Dialog.currentOptions, options);
};
Loading.resetDefaultOptions = function () {
  Loading.currentOptions = _extends({}, Loading.defaultOptions);
};
Loading.resetDefaultOptions();
export default Loading;