// Copyright 2014 Tianyong Tang

var num2zh = (function(){
  var units = ['十', '百', '千', '万'];
  var zhs   = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  return function (num) {
    var str = String(num);
    var arr = [];

    for (var i = str.length - 1, pos = 0, skip = false; i >= 0; --i, ++pos) {
      if (pos === 4) {
        arr.push(units[3]);
        pos = 0;
      }

      var bit = parseInt(str[i], 10);

      if (bit !== 0) {
        arr.push(units[pos - 1], zhs[bit]);
        skip = false;
      } else if (pos > 0 && !skip || i === 0) {
        arr.push(zhs[bit]);
      }

      if (bit === 0) {
        skip = true;
      }
    }

    for (var j = 0, len = arr.length, times = 0; j < len; ++j) {
      if (arr[j] === '万') {
        times += 1;
        if (times % 2 === 0) {
          arr[j] = '亿';
          if (arr[j - 1] === '万') {
            delete arr[j - 1];
          }
        }
      }
    }

    arr.reverse();

    if (arr[0] === '一' && arr[1] === '十') {
      delete arr[0];
    }

    return arr.join('');
  };
}());
