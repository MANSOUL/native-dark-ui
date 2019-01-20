const message = (function iife() {
  let $toast = null;
  let toastTimer = null;

  function append($el, c) {
    if (c.nodeType) {
      $el.appendChild(c);
    } else {
      $el.insertAdjacentHTML('beforeend', c);
    }
    return $el;
  }

  function remove($el) {
    $el.parentNode.removeChild($el);
    return $el;
  }

  function setToastTimer($el, duration) {
    const toastTimer = setTimeout(function () {
      $el.addEventListener('animationend', function handleAnimationEnd() {
        $el.removeEventListener('animationend', handleAnimationEnd);
        remove($el);
        $toast = null;
      }, false);
      $el.classList.add('ani__slide-down');
    }, duration);
    return toastTimer;
  }

  /**
   * Toast
   * @Author   KuangGuanghu
   * @DateTime 2018-12-04
   * @param    {String}     message  [description]
   * @param    {Number}     duration [description]
   * @return   {HTMLElement}              [description]
   */
  function toast(message, duration = 2000) {
    if ($toast) {
      clearTimeout(toastTimer);
      $toast.querySelector('.message__toast-content').textContent = message;
      toastTimer = setToastTimer($toast, duration);
      return;
    }
    $toast = document.createElement('div');
    $toast.className = 'message__toast ani__slide-up';
    $toast.innerHTML = `<div class="message__toast-content">${message}</div>`;
    toastTimer = setToastTimer($toast, duration);
    append(document.body, $toast);
    return $toast;
  }


  function confirm() {
    const $confirm = document.createElement('div');
    $confirm.className = 'msg-confirm';
    const $confirmMask = document.createElement('div');
    $confirmMask.className = 'msg-confirm__mask ani__fade-in';
    const $confirmBox = document.createElement('div');
    $confirmBox.className = 'msg-confirm__box ani__fade-in';

    append($confirm, $confirmMask);
    append($confirm, $confirmBox);

    $confirmMask.addEventListener('click', function onMaskClick() {
      $confirmMask.addEventListener('animationend', function onMaskTransitionEnd() {
        remove($confirm);
      });

      $confirmMask.classList.add('ani__fade-out');
      $confirmBox.classList.add('ani__fade-out');
    }, false);

    append(document.body, $confirm);
  }

  return {
    toast,
    confirm
  };
})();