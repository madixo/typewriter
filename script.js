class TypewriterAnimation {

    constructor(parent, handlers = {}, options = {}) {

        this.parent = parent;

        this.handlers = new Proxy(handlers, {
            get: (target, name) => {
                if(!target.hasOwnProperty(name)) console.log(`${target}.${name} not specified!`); else return target[name];
            }
        });

        this.options = new Proxy(options, {
            get: (target, name) => {
                switch (name) {
                    case 'delay':
                        return target.hasOwnProperty('delay') ? target.delay : 100;
                    case 'fluctuation':
                        return target.hasOwnProperty('fluctuation') ? target.fluctuation : 50;
                    default:
                        return target[name];
                }
            }
        });

    }

    get random() {

        return Math.random() * (this.options.fluctuation * 2) - this.options.fluctuation;

    }

    animate() {

        return new Promise(res => {

            this.res = res;
            this.handlers.init();
            this.salt = this.random;
            this._animate();

        });

    }

    _animate(now = performance.now()) {

        const { delay } = this.options;

        const elapsed = this.last === undefined ? delay + Math.ceil(this.salt) : now - this.last;

        if(elapsed >= delay + this.salt) {

            this.handlers.anim();

            this.salt = this.random;

            this.last = now;

        }

        if(this.handlers.cond())
            requestAnimationFrame(this._animate.bind(this));
        else
            this.res('done');

    }

}

class TypewriterWrite extends TypewriterAnimation {

    constructor(parent, text, options) {

        super(parent, {
            init: () => { this.buffer = [...this.text]; },
            anim: () => { this.parent.innerHTML += this.buffer.shift(); },
            cond: () => this.buffer.length
        }, options);

        this.text = text;

    }

}

class TypewriterDelete extends TypewriterAnimation {

    constructor(parent, to_delete, options) {

        super(parent, {
            init: () => {
                this.text = [...this.parent.innerHTML];
                this.counter = this.to_delete;
            },
            anim: () => {
                this.text.pop();
                this.parent.innerHTML = this.text.join('');
                this.counter--;
            },
            cond: () => this.counter
        }, options);

        this.to_delete = to_delete;

    }

}

class TypewriterSleep {

    constructor(ms) {

        this.ms = ms;

    }

    sleep() {

        return new Promise(res => setTimeout(res, this.ms));

    }
}

class Typewriter {

    constructor(parent, options = {}) {

        this.parent = parent;
        this.steps = [];
        this.step = 0;
        this.paused = false;

        this.options = new Proxy(options, {
            get: (target, name) => {
                switch (name) {
                    case 'repeat':
                        return target.hasOwnProperty('repeat') ? target.repeat : false;
                    default:
                        return target[name];
                }
            }
        });

    }

    write(text, options) {

        this.steps.push(new TypewriterWrite(this.parent, text, options || this.options));
        return this;

    }

    rewrite(to_delete, text, options) {

        this.steps.push(new TypewriterDelete(this.parent, to_delete, options || this.options));
        this.steps.push(new TypewriterWrite(this.parent, text, options || this.options));
        return this;

    }

    delete(to_delete, options) {

        this.steps.push(new TypewriterDelete(this.parent, to_delete, options || this.options));
        return this;

    }

    sleep(ms) {

        this.steps.push(new TypewriterSleep(ms));
        return this;

    }

    start() {
        
        this.step = 0;
        this.resume();

    }

    async animate() {

        for(; this.step < this.steps.length; this.step++) {

            if(this.paused) break;

            const current = this.steps[this.step];

            if(current instanceof TypewriterAnimation) {

                await current.animate();

            }else if (current instanceof TypewriterSleep) {

                await current.sleep();

            }else
                throw new Error(`Invalid item in queue ${current}!`);

        }

        if(this.options.repeat) requestAnimationFrame(this.start.bind(this));
        else this.stop();

    }

    stop() {

        this.pause();

    }

    pause() {

        this.paused = true;

    }

    resume() {

        this.paused = false;
        this.steps
        this.animate();

    }

}

let t = new Typewriter(document.querySelector('#typewriter'));
t.write("ala ma kota", {delay: 350}).sleep(1500).rewrite(4, "diabla a nie kota").start();
