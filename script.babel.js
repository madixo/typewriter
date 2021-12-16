"use strict";

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

class TypewriterError extends Error {
  constructor(message) {
    super(message);
  }

}

class TypewriterModuleMessage {
  constructor(module) {
    this.module = module;
  }

}

class TypewriterModuleDebugMessage extends TypewriterModuleMessage {
  constructor(module) {
    super(module);
  }

  get message() {
    return this.module.constructor.name;
  }

  toString() {
    return this.message;
  }

}

class TypewriterModuleBeginMessage extends TypewriterModuleMessage {}

class TypewriterModuleBeginDebugMessage extends TypewriterModuleDebugMessage {
  get message() {
    return `${super.message} began!`;
  }

}

class TypewriterModuleTickMessage extends TypewriterModuleMessage {}

class TypewriterModuleTickDebugMessage extends TypewriterModuleDebugMessage {
  get message() {
    return `${super.message} tick!`;
  }

}

class TypewriterModuleDoneMessage extends TypewriterModuleMessage {}

class TypewriterModuleDoneDebugMessage extends TypewriterModuleDebugMessage {
  get message() {
    return `${super.message} done!`;
  }

}

class TypewriterModulePauseMessage extends TypewriterModuleMessage {}

class TypewriterModulePauseDebugMessage extends TypewriterModuleDebugMessage {
  get message() {
    return `${super.message} paused!`;
  }

}

class TypewriterModule {
  constructor(typewriter, options) {
    this.typewriter = typewriter;
    this.target = typewriter.target;
    this.options = { ...{
        debug: false
      },
      ...options
    };
  }

  action() {
    throw new TypewriterError("Typewriter module has to implement action() method!");
  }

}

var _paused = /*#__PURE__*/new WeakMap();

var _resumed = /*#__PURE__*/new WeakMap();

class TypewriterPauseableModule extends TypewriterModule {
  constructor(typewriter, options) {
    super(typewriter, options);

    _classPrivateFieldInitSpec(this, _paused, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _resumed, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _paused, false);

    _classPrivateFieldSet(this, _resumed, false);
  }

  resume() {
    _classPrivateFieldSet(this, _paused, false);

    _classPrivateFieldSet(this, _resumed, true);
  }

  pause() {
    _classPrivateFieldSet(this, _paused, true);
  }

  get paused() {
    return _classPrivateFieldGet(this, _paused);
  }

  set paused(paused) {
    if (paused) this.pause();else this.resume();
  }

  get resumed() {
    return _classPrivateFieldGet(this, _resumed);
  }

  set resumed(resumed) {
    _classPrivateFieldSet(this, _resumed, false);
  }

}

var _res = /*#__PURE__*/new WeakMap();

var _random = /*#__PURE__*/new WeakMap();

var _animate = /*#__PURE__*/new WeakSet();

class TypewriterAnimation extends TypewriterPauseableModule {
  /**
   *
   * @param {Array} handlers
   * @param {{delay?: number, fluctuation?: number}} options
   */
  constructor(typewriter, handlers = {}, options) {
    options = { ...{
        delay: 100,
        fluctuation: 50
      },
      ...options
    };
    super(typewriter, options);

    _classPrivateMethodInitSpec(this, _animate);

    _classPrivateFieldInitSpec(this, _random, {
      get: _get_random,
      set: void 0
    });

    _classPrivateFieldInitSpec(this, _res, {
      writable: true,
      value: void 0
    });

    this.handlers = new Proxy(handlers, {
      get: (target, name) => {
        if (!target.hasOwnProperty(name)) return () => {
          throw new TypewriterError(`${target.name}.${name} not specified!`);
        };else return target[name];
      }
    });
  }

  animate() {
    return new Promise(res => {
      _classPrivateFieldSet(this, _res, res);

      if (!this.resumed)
        /* User defined initialization */
        this.handlers.init();else this.resumed = 0;
      this.salt = _classPrivateFieldGet(this, _random);
      if (this.options.debug) console.log(`${new TypewriterModuleBeginDebugMessage(this)}`);

      _classPrivateMethodGet(this, _animate, _animate2).call(this);
    });
  }

  resume() {
    super.resume();
    return this.action();
  }

  pause() {
    super.pause();
  }

  action() {
    return this.animate();
  }

}

function _get_random() {
  if (this.fluctuation == 0) return 0;
  return Math.random() * (this.options.fluctuation * 2) - this.options.fluctuation;
}

function _animate2(now = performance.now()) {
  if (this.paused) {
    console.log(`${new TypewriterModulePauseDebugMessage(this)}`);

    _classPrivateFieldGet(this, _res).call(this, this.options.debug ? new TypewriterModulePauseDebugMessage(this) : new TypewriterModulePauseMessage(this));

    return;
  }

  const {
    delay
  } = this.options;
  const elapsed = this.last === undefined ? delay + Math.ceil(this.salt) : now - this.last;

  if (elapsed >= delay + this.salt) {
    if (this.options.debug) console.log(`${new TypewriterModuleTickDebugMessage(this)}`);
    /* User defined animation */

    this.handlers.anim();
    this.salt = _classPrivateFieldGet(this, _random);
    this.last = now;
  }
  /* User defined condition */


  if (this.handlers.cond()) requestAnimationFrame(_classPrivateMethodGet(this, _animate, _animate2).bind(this));else _classPrivateFieldGet(this, _res).call(this, this.options.debug ? new TypewriterModuleDoneDebugMessage(this) : new TypewriterModuleDoneMessage(this));
}

class TypewriterWrite extends TypewriterAnimation {
  constructor(typewriter, text, options) {
    super(typewriter, {
      init: () => {
        this.buffer = [...this.text];
      },
      anim: () => {
        this.target.innerHTML += this.buffer.shift();
      },
      cond: () => this.buffer.length
    }, options);
    this.text = text;
  }

}

class TypewriterBackspace extends TypewriterAnimation {
  constructor(typewriter, to_delete, options) {
    super(typewriter, {
      init: () => {
        this.text = [...this.target.innerText];
        this.counter = this.to_delete;
      },
      anim: () => {
        this.text.pop();
        this.target.innerHTML = this.text.join('');
        this.counter--;
      },
      cond: () => this.counter
    }, options);
    this.to_delete = to_delete;
  }

}

class TypewriterSleep extends TypewriterPauseableModule {
  constructor(typewriter, ms, options) {
    super(typewriter, options);
    this.ms = ms;
  }

}

var _id = /*#__PURE__*/new WeakMap();

var _res2 = /*#__PURE__*/new WeakMap();

class TypewriterPauseableSleep extends TypewriterSleep {
  constructor(...args) {
    super(...args);

    _classPrivateFieldInitSpec(this, _id, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _res2, {
      writable: true,
      value: void 0
    });
  }

  sleep(ms) {
    if (this.options.debug) console.log(`${new TypewriterModuleBeginDebugMessage(this)}`);
    return new Promise(res => {
      _classPrivateFieldSet(this, _res2, res);

      _classPrivateFieldSet(this, _id, setTimeout(() => res(this.options.debug ? new TypewriterModuleDoneDebugMessage(this) : new TypewriterModuleDoneMessage(this)), ms));
    });
  }

  action() {
    if (this.resumed) {
      let delay = performance.now() - this.init;
      this.resumed = 0;
      if (delay >= this.ms) return new Promise(res => requestAnimationFrame(() => res(this.options.debug ? new TypewriterModuleDoneDebugMessage(this) : new TypewriterModuleDoneMessage(this))));
      return this.sleep(this.ms - delay);
    }

    this.init = performance.now();
    return this.sleep(this.ms);
  }

  resume() {
    super.resume();
    this.action();
  }

  pause() {
    super.pause();

    if (_classPrivateFieldGet(this, _id)) {
      clearTimeout(_classPrivateFieldGet(this, _id));

      _classPrivateFieldGet(this, _res2).call(this, this.options.debug ? new TypewriterModulePauseDebugMessage(this) : new TypewriterModulePauseMessage(this));
    }

    ;
  }

}

var _res3 = /*#__PURE__*/new WeakMap();

var _sleep = /*#__PURE__*/new WeakSet();

class TypewriterFrameSleep extends TypewriterSleep {
  constructor(typewriter, options) {
    super(typewriter, undefined, options);

    _classPrivateMethodInitSpec(this, _sleep);

    _classPrivateFieldInitSpec(this, _res3, {
      writable: true,
      value: void 0
    });
  }

  action() {
    return this.sleep();
  }

  pause() {}

  resume() {}

  sleep() {
    if (this.options.debug) console.log(`${new TypewriterModuleBeginDebugMessage(this)}`);
    return new Promise(res => {
      _classPrivateFieldSet(this, _res3, res);

      requestAnimationFrame(_classPrivateMethodGet(this, _sleep, _sleep2).bind(this));
    });
  }

}

function _sleep2() {
  _classPrivateFieldGet(this, _res3).call(this, this.options.debug ? new TypewriterModuleDoneDebugMessage(this) : new TypewriterModuleDoneMessage(this));
}

class TypewriterDelete extends TypewriterModule {
  constructor(typewriter, to_delete, options) {
    super(typewriter, options);
    this.to_delete = to_delete;
  }

  action() {
    if (this.options.debug) console.log(`${new TypewriterModuleBeginDebugMessage(this)}`);
    return new Promise(res => {
      requestAnimationFrame(() => {
        let text = this.target.innerText;
        this.target.innerHTML = text.substr(0, text.length - this.to_delete - 1);
        res(this.options.debug ? new TypewriterModuleDoneDebugMessage(this) : new TypewriterModuleDoneMessage(this));
      });
    });
  }

}

var _current = /*#__PURE__*/new WeakMap();

class Typewriter {
  /**
   * @type {TypewriterModule}
   */
  constructor(target, options) {
    _classPrivateFieldInitSpec(this, _current, {
      writable: true,
      value: void 0
    });

    this.target = target;
    this.initText = target.innerText;
    this.steps = [];
    this.step = 0;
    this.paused = false;
    this.options = { ...{
        repeat: false,
        sleep: 0,
        sleepRewrite: 0,
        sleepBeforeRepeat: 0
      },
      ...options
    };
  }

  newStep(step) {
    this.steps.push(step);
  }

  write(text, options) {
    options = { ...this.options,
      options
    };
    this.newStep(new TypewriterWrite(this, text, options));
    if (options.sleep > 0) this.newStep(new TypewriterPauseableSleep(this, options.sleep, options));
    return this;
  }

  rewrite(to_delete, text, options) {
    options = { ...this.options,
      ...options
    };
    this.newStep(new TypewriterBackspace(this, to_delete, options));
    if (options.sleepRewrite > 0) this.newStep(new TypewriterPauseableSleep(this, options.sleepRewrite, options));
    this.newStep(new TypewriterWrite(this, text, options));
    if (options.sleep > 0) this.newStep(new TypewriterPauseableSleep(this, options.sleep, options));
    return this;
  }

  backspace(to_delete, options) {
    options = { ...this.options,
      ...options
    };
    this.newStep(new TypewriterBackspace(this, to_delete, options));
    if (options.sleep > 0) this.newStep(new TypewriterPauseableSleep(this, options.sleep, options));
    return this;
  }

  delete(to_delete, options) {
    options = { ...this.options,
      ...options
    };
    this.newStep(new TypewriterDelete(this, to_delete, options));
    if (options.sleep > 0) this.newStep(new TypewriterPauseableSleep(this, options.sleep, options));
    return this;
  }

  sleep(ms) {
    this.newStep(new TypewriterPauseableSleep(this, ms, this.options));
    return this;
  }

  init() {
    let steps = [];

    for (let i = 0; i < this.steps.length; i++) {
      const curr = this.steps[i];
      steps.push(curr);
      if (!(curr instanceof TypewriterAnimation)) continue;
      const next = this.steps[i + 1];
      if (next instanceof TypewriterSleep) continue;

      if (i != this.steps.length - 1) {
        steps.push(new TypewriterFrameSleep(this, this.options));
      } else {
        if (!this.options.repeat) continue;
        if (this.options.sleepBeforeRepeat) steps.push(new TypewriterPauseableSleep(this, this.options.sleepBeforeRepeat, this.options));else steps.push(new TypewriterFrameSleep(this, this.options));
      }
    }

    this.step = 0;
    this.steps = [...steps];
  }

  start() {
    this.init();
    this.animate();
  }

  restart() {
    this.step = 0;
    this.resume();
  }

  async animate() {
    if (this.step >= this.steps.length) {
      if (this.options.repeat) this.step = 0;else return;
    }

    _classPrivateFieldSet(this, _current, this.steps[this.step++]).action().then(res => {
      if (res instanceof TypewriterModuleDoneDebugMessage) console.log(`${res}`);
      requestAnimationFrame(this.animate.bind(this));
    });
  }

  get current() {
    return _classPrivateFieldGet(this, _current);
  }

  set current(c) {}

  stop() {
    this.pause();
    requestAnimationFrame(() => this.target.innerHTML = this.initText);
  }

  pause() {
    if (_classPrivateFieldGet(this, _current) instanceof TypewriterPauseableModule) _classPrivateFieldGet(this, _current).pause();
  }

  resume() {
    if (_classPrivateFieldGet(this, _current) instanceof TypewriterPauseableModule) _classPrivateFieldGet(this, _current).resume().then(this.animate.bind(this));
  }

}

let t = new Typewriter(document.querySelector('#typewriter'), {
  repeat: true,
  delay: 100,
  fluctuation: 75,
  sleepBeforeRepeat: 1500,
  debug: true
});
t.write("Hobbest").sleep(1500).rewrite(3, "ies, Interests & Activities", {
  sleep: 3500
}).delete(31).start();