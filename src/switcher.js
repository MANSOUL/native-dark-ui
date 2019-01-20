const switcher = (function iife() {
  function appendPulseItem($item) {
    let $i = document.createElement('i');
    $i.className = 'slide--pulse';
    $i.addEventListener('animationend', function handlePulseEnd() {
      $i.parentNode.removeChild($i);
    });
    $item.appendChild($i);
  }

  function bindClickEvent($el, cb) {
    $el.addEventListener('click', function handleRadioClick(e) {
      $el.classList.toggle('slide--on');
      appendPulseItem($el);
      cb.map(c => c && c(getValue($el)));
    });
  }

  function isGroup($el) {
    return $el.classList.contains('slide');
  }

  function obtainGroup(selector) {
    let $el = selector.nodeType ? selector : document.querySelector(selector);
    if (!isGroup($el)) {
      throw new Error(selector + ' is not a slide group');
    }
    return $el;
  }

  function getValue(selector) {
    let $el = obtainGroup(selector);
    return $el.classList.contains('slide--on');
  }

  function create(selector) {
    let $el = obtainGroup(selector);
    let cb = [];
    bindClickEvent($el, cb);
    return {
      value() {
        return getValue($el);
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