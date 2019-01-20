const button = (function iife() {
  function appendPulseItem($item) {
    let $i = document.createElement('i');
    $i.className = 'pulse';
    $i.addEventListener('animationend', function handlePulseEnd() {
      $i.parentNode.removeChild($i);
    });
    $item.appendChild($i);
  }

  function bindClickEvent($el, cb) {
    $el.addEventListener('mousedown', function handleClick(e) {
      if (isDisable($el)) {
        return;
      }
      appendPulseItem($el);
    });
    $el.addEventListener('click', function handleClick(e) {
      if (isDisable($el)) {
        return;
      }
      // appendPulseItem($el);
      cb.map(c => c && c(e));
    });
  }

  function isDisable($el) {
    return $el.classList.contains('button--disable');
  }

  function isGroup($el) {
    return $el.classList.contains('button');
  }

  function obtainGroup(selector) {
    let $el = selector.nodeType ? selector : document.querySelector(selector);
    if (!$el || !isGroup($el)) {
      throw new Error(selector + ' is not a button');
    }
    return $el;
  }

  function create(selector) {
    let $el = obtainGroup(selector);
    let cb = [];
    bindClickEvent($el, cb);
    return {
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
