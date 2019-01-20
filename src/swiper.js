class Swiper {
  constructor({loop = false, onCreate, selector} = {}) {
    if (!selector) {
      throw 'Swiper selector cannot be null';
    }
    this.initTouchX = 0;
    this.prevTouchX = 0;
    this.prevTouchY = 0;
    this.prevTimeStamp = 0;
    this.distance = 0;
    this.count = 0;
    this.fireMove = false;
    this.current = 1;
    this.width = 0;
    this.cb = [];
    this.moving = false;
    this.moveRatio = 0;
    this.selector = selector;
    
    // 可配置项
    this.loop = loop;

    this.state = {
      transform: 'none',
      transition: 'none 0s ease 0s'
    };
    this.handleCommonChange = this.handleCommonChange.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    this.create(onCreate);
  }

  create(onCreate) {
    this.queryElements();
    this.initVar();
    this.bindEvents();
    this.createPagination();
    this.pagination();
    onCreate && onCreate(this.current);
  }
  
  queryElements() {
    this.$slider = document.querySelector(this.selector);
    this.$sliderContainer = this.$slider.querySelector('.slider__container');
    this.$sliderItems = this.$slider.querySelectorAll('.slider__item');
    this.$pagination = this.$slider.querySelector('.slider__pagination');
  }
  
  bindEvents() {
    this.$slider.addEventListener('touchstart', this.handleTouchStart);
    this.$slider.addEventListener('touchmove', this.handleTouchMove);
    this.$slider.addEventListener('touchend', this.handleTouchEnd);
    this.$slider.addEventListener('touchcancel', this.handleTouchEnd);
  }
  
  initVar() {
    this.count = this.$sliderItems.length;
    this.width = this.$slider.clientWidth;
    this.moveRatio = this.width / 50;
    this.distance = -this.width;
  }

  createPagination() {
    if (this.$pagination) {
      this.$paginations = [];
      let $pFragment = document.createDocumentFragment();
      for (let index = 0; index < this.count; index++) {
        let $p = document.createElement('li');
        $p.className = 'pagination__item';
        this.$paginations.push($p);
        $pFragment.appendChild($p);
      }
      this.$pagination.appendChild($pFragment);
    }
  }

  pagination() {
    if (this.$paginations) {
      this.$paginations.map(($item, index) => {
        if (this.current === index) {
          $item.classList.add('pagination__item--active');
        }
        else {
          $item.classList.remove('pagination__item--active');
        }
      })
    }
  }

  setState(state) {
    for (const key in state) {
      if (state.hasOwnProperty(key)) {
        const element = state[key];
        this.state[key] = element;
      }
    }
  }

	changeState (transform = 'none', transition = 'none 0s ease 0s') {
		const nextState = {
			transform,
			transition
		}
    this.setState(nextState)
    this.render();
	}

	handleCommonChange(currentX){
    this.distance += (currentX - this.prevTouchX);
		const transform = `translate3d(${this.distance}px, 0, 0)`;
		this.changeState(transform,'none 0s ease 0s');
	}

	handleTouchStart(e) {
    e.preventDefault();
		this.initTouchX = this.prevTouchX = e.touches[0].clientX;
		this.prevTouchY = e.touches[0].clientY;
		this.prevTimeStamp = e.timeStamp;
	}
  
	handleTouchMove(e) {
    e.preventDefault();
    const currentX = e.changedTouches[0].clientX;
    if (/* (this.current === 0 && offsetX >= -this.moveRatio) ||
       (this.current === this.count - 1 && offsetX <= this.moveRatio) ||  */this.moving) {
      return;
    }
    this.fireMove = true;
    this.handleCommonChange(currentX);
    this.prevTouchX = currentX;
	}

	handleTouchEnd(e) {
    e.preventDefault();
    if (!this.fireMove) {
      return;
    }
    this.moving = true;
    this.fireMove = false;
		const currentX = e.changedTouches[0].clientX;
		const currentTimeStamp = e.timeStamp;
		const offsetDistance = currentX - this.initTouchX;
    let duration = Math.abs(offsetDistance / (currentTimeStamp - this.prevTimeStamp));
    duration = duration > 0.3 ? 0.3 : duration;

    this.distance = this.fill(
      this.distance, 
      (offsetDistance > 0 ? 'toright' : 'toleft'), 
      (duration >= 0.3 || Math.abs((this.distance - this.width) / this.width) >= 0.4)
    );
		this.changeState(`translate3d(${this.distance}px, 0, 0)`, 
    `transform ${duration}s cubic-bezier(0.7, 0.3, 0.3, 0.7) 0s`);
    this.handleTransitionEnd();
  }

  handleTransitionEnd() {
    this.moving = false;
    this.current = Math.abs(this.distance / this.width);
    this.pagination();
    this.fire();
  }
  
  /**
   * 获取到下一应当所在的位置
   * @param {Number} distance 当前移动距离
   * @param {String} dir 方向
   * @param {Boolean} ceil 滑动到下一页
   */
  fill(distance, dir, ceil) {
    if (!this.loop) {
      if (this.distance < -this.width * (this.count - 1)) {
        return -this.width * (this.count - 1);
      }
      if (this.distance > 0) {
        return 0;
      }
    }
    const symbol = distance / Math.abs(distance);
    distance = Math.abs(distance);
    if ((dir === 'toleft' && ceil) || (dir === 'toright' && !ceil)) {
      return Math.ceil(distance / this.width) * symbol * this.width;
    }
    else {
      return Math.floor(distance / this.width) * symbol * this.width;
    }
  }

	render() {
    const {transform, transition} = this.state
    window.requestAnimationFrame(() => {
      this.$sliderContainer.style.transition = transition;
      this.$sliderContainer.style.transform = transform;
    });
  }

  on(cb) {
    if (typeof cb !== 'function') {
      return;
    }  
    const myCb = this.cb;
    let index = myCb.push(cb);
    return function unsub() {
      myCb[index - 1] = null;
    };
  }

  fire() {
    this.cb.map(c => c && c(this.current));
  }
}