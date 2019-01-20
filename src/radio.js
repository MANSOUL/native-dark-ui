const radio = (function iife() {
  function fireCallback($item, cb, multi) {
    let value = getValue(closet($item, '.radio__group'), multi);
    if (!value) {
      console.warn(`value is: ${value}, maybe you forget set data-value to radio item.`);
    }
    map(cb, function fire(c) {
      c && c(value);
    });
  }

  function obtainRadioGroup(selector) {
    let $el = selector.nodeType ? selector : document.querySelector(selector);
    if (!isRadioGroup($el)) {
      throw new Error(selector + ' is not a radio group');
    }
    return $el;
  }

  function isRadioGroup($el) {
    return $el.classList.contains('radio__group');
  }

  function getBox($item) {
    return $item.querySelector('.radio__item-box');
  }

  function check($item, multi) {
    if (multi) {
      toggleClass($item, 'radio__item--check');
    }
    else {
      $item.classList.add('radio__item--check');
      map(siblings($item), function ($item) {
        $item.classList.remove('radio__item--check');
      });
    }
  }

  function appendPulseItem($item) {
    let $i = document.createElement('i');
    $i.className = 'radio--pulse';
    $i.addEventListener('animationend', function handlePulseEnd() {
      $i.parentNode.removeChild($i);
    });
    getBox($item).appendChild($i);
  }

  function bindClickEvent($el, cb, multi) {
    eventProxy('click', $el, '.radio__item', function handleRadioClick(e) {
      appendPulseItem(this);
      check(this, multi);
      fireCallback(this, cb, multi);
    });
  }

  function getValue(selector, multi) {
    let $el = obtainRadioGroup(selector);
    if (multi) {
      let valArr = [];
      map($el.querySelectorAll('.radio__item--check'), function($element) {
        valArr.push($element.dataset.value);
      });
      return valArr;
    }
    return $el.querySelector('.radio__item--check').dataset.value;
  }

  /**
   * 实例化radio
   * @param {String} selector 
   * @param {Boolean} multi 是否为多选，设为true支持多选，成为checkbox
   */
  function create(selector, multi = false) {
    let $el = obtainRadioGroup(selector);
    let cb = [];
    bindClickEvent($el, cb, multi);
    return {
      value() {
        return getValue($el, multi);
      },
      on(fn) {
        if (typeof fn !== 'function') {
          throw new Error(`fn must be a function, but get type: ${typeof fn} `);
        }
        let index = cb.push(fn) - 1;
        return function unsub() {
          cb[index] = null;
        };
      }
    };
  }
  return create;
})();