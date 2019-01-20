const getAverageColor = (function iife() {
  function loadImage(src, loadCb) {
    var image = new Image();
    image.onload = function onImageLoad() {
      loadCb(image);
    }
    image.src = src;
    return image;
  }

  function getPiexlCoor(x, y, w, imgData) {
    const p = x * 4 + y * 4 * w;
    return {
      r: imgData[p],
      g: imgData[p + 1],
      b: imgData[p + 2],
      a: imgData[p + 3]
    };
  }

  function sampleColor(imgData, w, h, ratio = 10) {
    let x = 0;
    let y = 0;
    let sampleArr = [];
    while (x < w - 1) {
      while (y < h - 1) {
        let rgba = getPiexlCoor(x, y, w, imgData);
        sampleArr.push(rgba);

        y += ratio;
        y = y >= h ? h - 1 : y;
      }
      y = 0;
      x += ratio;
      x = x >= w ? x - 1 : x;
    }
    return sampleArr;
  }

  function averageRGBA(colorArr) {
    let rAll = 0;
    let gAll = 0;
    let bAll = 0;
    let length = colorArr.length;
    for (let i = 0; i < length; i++) {
      let item = colorArr[i];
      rAll += item.r;
      gAll += item.g;
      bAll += item.b;
    }
    return {
      r: parseInt(rAll / length),
      g: parseInt(gAll / length),
      b: parseInt(bAll / length)
    };
  }

  function createRGB(rgb) {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  /**
   * 获取图片的平均色值
   * @param  {String}   src   图片路径，不能跨域
   * @param  {Function} wMax  回调函数，参数1: 色值，参数2: canvas
   * @param  {Number}   wMax  图片绘制的宽度，越大获取的值越精确，但也更加耗时，默认：300
   * @param  {Number}   ratio 颜色的采样率，越大获取的值越精确，但也更加耗时，默认：10
   */
  function getAverageColor(src = '', cb, wMax = 300, ratio = 10) {
    loadImage(src, function onLoadImage(img) {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const canvasW = wMax;
      const canvasH = imgHeight / imgWidth * wMax;

      var canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight, 0, 0, canvasW, canvasH);

      const imgData = ctx.getImageData(0, 0, canvasW, canvasH).data;
      const sampleArr = sampleColor(imgData, canvasW, canvasH, ratio);
      const avgRGB = averageRGBA(sampleArr);

      cb && cb(createRGB(avgRGB), canvas);
    });
  }
  return getAverageColor;
})();

const gallary = (function iife() {
  const $layer = document.querySelector('.img-layer');
  const $layerBg = document.querySelector('.img-layer__bg');
  let swiper = null;
  let srcSet = [];

  function paint(index) {
    getAverageColor(srcSet[index], function onGetColor(color) {
      $layerBg.style.backgroundColor = color;
    });
  }

  function attachEvent() {
    $layerBg.addEventListener('click', function handleLayerBgClick() {
      toggleClass($layer, 'img-layer--show');
    }, false);
  }

  function create(set = []) {
    srcSet = set;
    attachEvent();
    return {
      toggle() {
        toggleClass($layer, 'img-layer--show');
        if (!swiper) {
          swiper = new Swiper({
            onCreate: paint,
            selector: '.img-layer__slider'
          });
          swiper.on(paint);
        }
      },

    };
  }

  return create;
})();