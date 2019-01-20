function eventProxy(e, w, c, fn) {
  const $wrappers = w.nodeType ? [w] : document.querySelectorAll(w);
  const matchesSelector = function ($el, m) {
    const matches = $el.matches ||
      $el.matchesSelector ||
      $el.webkitMatchesSelector ||
      $el.mozMatchesSelector ||
      $el.msMatchesSelector ||
      $el.oMatchesSelector;
    while ($el) {
      if (matches.call($el, m)) {
        return $el;
      }
      $el = $el.parentElement;
    }
    return null;
  };
  const handler = function (e) {
    let target = e.target;
    if (target = matchesSelector(target, c)) {
      fn.call(target, e);
    }
  };
  Array.prototype.slice.call($wrappers).map($i => $i.addEventListener(e, handler, false));
}

function siblings($el) {
  return Array.prototype.slice.call($el.parentElement.children).filter($item => $item !== $el);
}

function closet($el, selector) {
  while ($el) {
    if ($el.matches(selector)) {
      return $el;
    }
    $el = $el.parentElement;
  }
  return null;
}

function map(arr, fn) {
  return arr.map(function (item, index) {
    fn(item, index);
  });
}

function toggleClass($el, className) {
  if ($el.classList.contains(className)) {
    $el.classList.remove(className);
  } else {
    $el.classList.add(className);
  }
}