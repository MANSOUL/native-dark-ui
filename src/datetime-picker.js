const datetimePicker = (function iife() {
  const formatArr = ['y-m-d-h-mm', 'y-m-d', 'h-mm'];
  const htmlArr = [createSlide('year'), createSlide('month'), createSlide('date'), createSlide('hour'), createSlide('minute')];
  let $pickerWrapper = null;
  let $pickerMask = null;
  let $picker = null;
  let $yearContent = null;
  let $monthContent = null;
  let $dateContent = null;
  let $hourContent = null;
  let $minuteContent = null;
  let created = false;
  let datetimeArr = [null, null, null, null, null];
  let triggerCallback = [];
  let dateSlider = null;

  function append($container, content) {
    if (content.nodeType) {
      $container.appendChild(content);
    } else {
      $container.insertAdjacentHTML('beforeend', content);
    }
  }

  function appendStyle(position) {
    let content = `
        .datetime-wrapper {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          justify-content: center;
          align-items: ${position};
          display: none;
          z-index: 1000;
        }
        .datetime-wrapper--show {
          display: flex;
        }
        .datetime-mask {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-color: rgba(0, 0, 0, 0.1);
          z-index: 0;
        } 
        .datetime-mask--fade-in {
          animation-name: dtsfadein;
          animation-duration: 200ms;
          animation-fill-mode: forwards;
        } 
        @keyframes dtsfadein {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .datetime-mask--fade-out {
          animation-name: dtsfadeout;
          animation-duration: 200ms;
          animation-fill-mode: forwards;
        } 
        @keyframes dtsfadeout {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .datetime {
          position: relative;
          display: flex;
          width: 100%;
          height: 238px;
          overflow: hidden;
          background-color: #fff;
          font-size: 13px;
          z-index: 2;
        }
        .datetime--slide-up {
          animation-name: dtslideup;
          animation-duration: 400ms;
          animation-fill-mode: forwards;
        }
        @keyframes dtslideup {
          0% {
            transform: translate3d(0, 100%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .datetime--slide-down {
          animation-name: dtslidedown;
          animation-duration: 400ms;
          animation-fill-mode: forwards;
        }
        @keyframes dtslidedown {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, 100%, 0);
          }
        }
        .datetime__slide {
          position: relative;
          flex-shrink: 0;
          flex-grow: 1;
        }
        .datetime__mask {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0, rgba(255, 255, 255, 0.4) 40%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0) 60%, rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 255, 1) 100%);
          z-index: 3;
        }
        .datetime__content {
          height: 100%;
          transition-property: transform;
          will-change: transform;
        }
        .datetime__slideitem {
          height: 34px;
          line-height: 34px;
          text-align: center;
        }
        .datetime__slideitem--hidden {
          visibility: hidden;
        }
        .datetime__indicator {
          position: absolute;
          top: 102px;
          height: 34px;
          width: 100%;
          border-top: 0.5px solid rgba(0, 0, 0, 0.1);
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
        }
      `;
    let $style = document.createElement('style');
    $style.textContent = content;
    append(document.head, $style);
  }

  function format2Index(fi) {
    switch (fi) {
      case 0:
        return [0, 1, 2, 3, 4];
      case 1:
        return [0, 1, 2];
      case 2:
        return [3, 4];
    }
  }

  function createPicker(html) {
    return `
        <div class="datetime-wrapper">
          <div class="datetime-mask">
          </div>
          <div class="datetime">
            ${html}
          </div>
        </div>
        `;
  }

  function createSlide(className) {
    return `
        <div class="datetime__slide">
          <div class="datetime__mask"></div>
          <div class="datetime__indicator"></div>
          <div class="datetime__content ${className}">
          </div>
        </div>
        `;
  }

  function createSlideItem(content) {
    return `<div class="datetime__slideitem">${content}</div>`;
  }

  function createRangeHTML(begin, end, ext = '') {
    let html = '';
    for (let i = begin; i <= end; i++) {
      html += createSlideItem(`${i}${ext}`);
    }
    return html;
  }

  function appendYear() {
    if (!$yearContent) {
      return;
    }
    let date = new Date();
    let begin = 1990;
    let year = date.getFullYear();
    append($yearContent, createRangeHTML(begin, year, '年'));
  }

  function appendMonth() {
    if (!$monthContent) {
      return;
    }
    append($monthContent, createRangeHTML(1, 12, '月'));
  }

  function appendDate() {
    if (!$dateContent) {
      return;
    }
    append($dateContent, createRangeHTML(1, 31, '日'));
  }

  function hiddenDateSlide(year, month) {
    if (!$dateContent) {
      return;
    }
    let date = new Date(year, month, 0);
    let d = date.getDate();
    dateSlider && dateSlider(31 - d);
    let $slides = Array.prototype.slice.call($dateContent.children);
    $slides.map(($item, index) => {
      if (index < d) {
        $item.classList.remove('datetime__slideitem--hidden');
      } else {
        $item.classList.add('datetime__slideitem--hidden');
      }
    });
  }

  function appendHour() {
    if (!$hourContent) {
      return;
    }
    append($hourContent, createRangeHTML(0, 23, '时'));
  }

  function appendMinute() {
    if (!$minuteContent) {
      return;
    }
    append($minuteContent, createRangeHTML(0, 59, '分'));
  }

  function querySlide() {
    $pickerWrapper = document.querySelector('.datetime-wrapper');
    $pickerMask = document.querySelector('.datetime-mask');
    $picker = document.querySelector('.datetime');
    $yearContent = document.querySelector('.datetime__content.year');
    $monthContent = document.querySelector('.datetime__content.month');
    $dateContent = document.querySelector('.datetime__content.date');
    $hourContent = document.querySelector('.datetime__content.hour');
    $minuteContent = document.querySelector('.datetime__content.minute');
  }

  function trigger(datetimeIndex) {
    const handleYMChange = function (datetime, index) {
      if (index !== 0 && index !== 1) {
        return;
      }
      hiddenDateSlide(datetime[0], datetime[1]);
    }
    handleYMChange(datetimeArr.filter(v => v !== null), datetimeIndex);
    let datetime = datetimeArr.filter(v => v !== null);
    triggerCallback.map(cb => cb(datetime));
    return datetime.join('-');
  }

  function translateSlide($slide, offset) {
    $slide.style.transitionDuration = '0s';
    $slide.style.transform = `translate3d(0, ${offset}px, 0)`;
  }

  function transitionSlide($slide, offset, duration = 0.4) {
    $slide.style.transitionDuration = `${duration}s`;
    $slide.style.transform = `translate3d(0, ${offset}px, 0)`;
  }

  function obtainCurrentSlideItem(offset, itemHeight) {
    let index = Math.abs(Math.round(offset / itemHeight));
    return index * (offset / Math.abs(offset));
  }

  function slideContent($slide, datetimeIndex, defaultIndex = 0) {
    if (!$slide) {
      return;
    }
    let sy = 0;
    let py = 0;
    let pt = 0;
    const $parent = $slide.parentNode;
    const iHeight = 34; //$slide.clientHeight / 7;
    let maxY;
    let minY;
    let maxIndex;
    let minIndex;
    let nextOffset = (-defaultIndex + 3) * iHeight;
    let prev = 0;
    let currentIndex = 0; // slide__item 在 slides中的索引
    const getBounadryVal = function (offset = 0) {
      maxY = iHeight * 3;
      minY = -$slide.children.length * iHeight + iHeight * (4 + offset);
      maxIndex = 3;
      minIndex = -$slide.children.length + (4 + offset);

      if (currentIndex >= $slide.children.length - offset && offset > prev) {
        currentIndex = $slide.children.length - offset - 1;
        nextOffset = (-currentIndex + 3) * iHeight;
        setVal(-currentIndex);
        translateSlide($slide, nextOffset);
      }
      prev = offset;
    };
    const getNextOffset = function (offset) {
      if (offset < minY) {
        return minY;
      } else if (offset > maxY) {
        return maxY;
      }
      return offset;
    };
    const getIndex = function (index) {
      if (index < minIndex) {
        return minIndex - 3;
      } else if (index > maxIndex) {
        return maxIndex - 3;
      }
      return index - 3;
    };
    const setVal = function (index) {
      currentIndex = index = Math.abs(getIndex(index));
      let val = Number($slide.children[index].textContent.match(/\d+/));
      datetimeArr[datetimeIndex] = val;
    };
    getBounadryVal();
    setVal(-defaultIndex + 3);
    translateSlide($slide, nextOffset);
    $parent.addEventListener('touchstart', function handleTouchStart(e) {
      e.preventDefault();
      sy = py = e.touches[0].clientY;
      pt = e.timeStamp;
    });
    $parent.addEventListener('touchmove', function handleTouchMove(e) {
      e.preventDefault();
      let y = e.changedTouches[0].clientY;
      nextOffset = nextOffset + (y - py);
      py = y;
      nextOffset = getNextOffset(nextOffset);
      translateSlide($slide, nextOffset);
    });
    $parent.addEventListener('touchend', function handleTouchEnd(e) {
      let y = e.changedTouches[0].clientY;
      let t = e.timeStamp;
      let r = (y - sy) / (t - pt);
      let index = obtainCurrentSlideItem(nextOffset, iHeight);
      if (Math.abs(r) > 0.3) {
        index += Math.ceil(r / 0.2);
        nextOffset = getNextOffset(index * iHeight);
        let d = Math.abs(r) * 0.5;
        transitionSlide($slide, nextOffset, d);
      } else {
        nextOffset = index * iHeight;
        transitionSlide($slide, nextOffset);
      }
      setVal(index);
      console.log(trigger(datetimeIndex));
    });
    return getBounadryVal;
  }

  function dom(fi) {
    let date = new Date();
    let indexArr = format2Index(fi);
    let html = htmlArr.filter(function (item, index) {
      return indexArr.indexOf(index) !== -1;
    }).join('');
    html = createPicker(html);
    append(document.body, html);
    querySlide();
    appendYear();
    appendMonth();
    appendDate();
    hiddenDateSlide(date.getFullYear(), date.getMonth() + 1);
    appendHour();
    appendMinute();
  }

  function bindSlideEvent() {
    let date = new Date();
    slideContent($yearContent, 0, date.getFullYear() - 1990);
    slideContent($monthContent, 1, date.getMonth());
    dateSlider = slideContent($dateContent, 2, date.getDate() - 1);
    slideContent($hourContent, 3, date.getHours());
    slideContent($minuteContent, 4, date.getMinutes());
  }

  function bindHiddenEvent() {
    $pickerMask.addEventListener('click', function handleMaskClick() {
      $pickerMask.classList.remove('datetime-mask--fade-in');
      $pickerMask.classList.add('datetime-mask--fade-out');
      $picker.classList.remove('datetime--slide-up');
      $picker.classList.add('datetime--slide-down');
      const handleAnimationEnd = function () {
        $pickerMask.removeEventListener('animationend', handleAnimationEnd);
        $pickerMask.classList.remove('datetime-mask--fade-out');
        $picker.classList.remove('datetime--slide-down');
        $pickerWrapper.classList.remove('datetime-wrapper--show');
      }
      $pickerMask.addEventListener('animationend', handleAnimationEnd);
    }, false);
  }

  return {
    create(format = 'y-m-d-h-mm', position = 'center') {
      const fi = formatArr.indexOf(format);
      if (fi === -1) {
        throw new Error('unexcept format:' + format);
      }
      if (position !== 'center' && position !== 'bottom') {
        throw new Error('unexcept position:' + position);
      }
      if (created) {
        return
      }
      created = true;
      appendStyle(position === 'center' ? position : 'flex-end');
      dom(fi);
      bindSlideEvent();
      bindHiddenEvent();
    },
    on() {

    },
    off() {

    },
    show() {
      $pickerWrapper.classList.add('datetime-wrapper--show');
      $pickerMask.classList.add('datetime-mask--fade-in');
      $picker.classList.add('datetime--slide-up');
    }
  };
})();