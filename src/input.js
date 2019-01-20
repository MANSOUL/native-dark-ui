class Input {
  constructor({selector} = {}) {
    this.value = '';
    this.cbs = {};
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.query(selector);
    this.bindEvents();
  }

  query(selector) {
    this.$input = document.querySelector(selector);
    this.$label = this.$input.querySelector('.input__label');
    this.$field = this.$input.querySelector('.input__field');
  }

  bindEvents() {
    this.$field.addEventListener('focus', this.handleFocus, false);
    this.$field.addEventListener('blur', this.handleBlur, false);
    this.$field.addEventListener('input', this.handleChange, false);
    this.$field.addEventListener('change', this.handleChange, false);
  }

  handleFocus(e) {
    this.$label.classList.add('input__label--active');
    this.trigger('focus', e);
  }
  
  handleBlur(e) {
    !this.value && this.$label.classList.remove('input__label--active');
    this.trigger('blur', e);
  }
  
  handleChange(e) {
    this.set(e.target.value);
    this.trigger('change', e);
  }

  trigger(type, e) {
    const cbs = this.cbs[type];
    if (!cbs) {
      return;
    }
    cbs.forEach(cb => {
      cb && cb(e);
    });
  }

  set(val, hand = false) {
    if (val) {
      this.value = val.trim();
      if (hand) {
        this.$field.value = this.value;
        this.$label.classList.add('input__label--active');
      }
    }
  }

  get() {
    return this.value;
  }

  val(val) {
    if (val) {
      this.set(val, true);
    }
    else {
      return this.get();
    }
  }

  on(type, cb) {
    if (!this.cbs[type]) {
      this.cbs[type] = [];
    }
    const index = this.cbs[type].push(cb) - 1;
    return function unsub() {
      this.cbs[type][index] = null;
    };
  }
}