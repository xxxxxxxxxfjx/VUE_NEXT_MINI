var Vue = (function (exports) {
    'use strict';

    var isArray = Array.isArray;
    var isObject = function (value) {
        return value !== null && typeof value === 'object';
    };
    var hasChanged = function (newValue, rawValue) {
        return !Object.is(newValue, rawValue);
    };
    var isFunction = function (val) {
        return typeof val === 'function';
    };
    var isString = function (val) {
        return typeof val === 'string';
    };
    var extend = Object.assign;
    var EMPTY_OBJ = {};
    var onReg = /^on[^a-z]/;
    var isOn = function (value) {
        return onReg.test(value);
    };
    // 是否是v-mode值变化时触发的update事件
    var isModelListener = function (key) {
        return key.startsWith('onUpdate:');
    };

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    function createDep(effects) {
        var dep = new Set(effects);
        return dep;
    }

    var activeEffect;
    var targetMap = new WeakMap();
    function track(target, key) {
        if (!activeEffect)
            return;
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
    }
    function trackEffects(dep) {
        dep.add(activeEffect);
    }
    function trigger(target, key, value) {
        var depsMap = targetMap.get(target);
        if (!depsMap)
            return;
        var deps = depsMap.get(key);
        if (!deps)
            return;
        triggerEffects(deps);
    }
    function triggerEffects(deps) {
        var e_1, _a, e_2, _b;
        var effects = isArray(deps) ? deps : __spreadArray([], __read(deps), false);
        try {
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effct = effects_1_1.value;
                if (effct.computed) {
                    triggerEffect(effct);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var effects_2 = __values(effects), effects_2_1 = effects_2.next(); !effects_2_1.done; effects_2_1 = effects_2.next()) {
                var effct = effects_2_1.value;
                if (!effct.computed) {
                    triggerEffect(effct);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (effects_2_1 && !effects_2_1.done && (_b = effects_2.return)) _b.call(effects_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    function triggerEffect(effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn, scheduler) {
            if (scheduler === void 0) { scheduler = null; }
            this.fn = fn;
            this.scheduler = scheduler;
        }
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        ReactiveEffect.prototype.stop = function () { };
        return ReactiveEffect;
    }());
    function effect(fn, options) {
        var _effect = new ReactiveEffect(fn);
        if (options) {
            extend(_effect, options);
        }
        if (!options || !options.lazy) {
            _effect.run();
        }
    }

    var get = createGetter();
    function createGetter() {
        return function get(target, key, receiver) {
            var res = Reflect.get(target, key, receiver);
            track(target, key);
            return res;
        };
    }
    var set = createSetter();
    function createSetter() {
        return function set(target, key, value, receiver) {
            var result = Reflect.set(target, key, value, receiver);
            trigger(target, key);
            return result;
        };
    }
    var mutableHandlers = {
        get: get,
        set: set
    };

    var reactiveMap = new WeakMap();
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, baseHandlers, proxyMap) {
        var existProxy = proxyMap.get(target);
        if (existProxy) {
            return existProxy;
        }
        var proxy = new Proxy(target, baseHandlers);
        proxyMap.set(target, proxy);
        proxy["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */] = true;
        return proxy;
    }
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };
    var isReactive = function (val) {
        return !!(val && val["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]);
    };

    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }
    function ref(value) {
        return createRef(value, false);
    }
    function createRef(rawValue, shallow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shallow);
    }
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, ___v_isShallow) {
            this.___v_isShallow = ___v_isShallow;
            this.__v_isRef = true;
            this.dep = undefined;
            this._rawValue = value;
            this._value = ___v_isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            set: function (newValue) {
                if (hasChanged(newValue, this._rawValue)) {
                    this._rawValue = newValue;
                    this._value = toReactive(newValue);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    function triggerRefValue(ref) {
        if (ref.dep) {
            triggerEffects(ref.dep);
        }
    }

    var ComputedRefImpl = /** @class */ (function () {
        function ComputedRefImpl(getter) {
            var _this = this;
            this.dep = undefined;
            this.__v_isRef = true;
            this._dirty = true;
            this.effect = new ReactiveEffect(getter, function () {
                if (!_this._dirty) {
                    _this._dirty = true;
                    triggerRefValue(_this);
                }
            });
            this.effect.computed = this;
        }
        Object.defineProperty(ComputedRefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                if (this._dirty) {
                    this._dirty = false;
                    this._value = this.effect.run();
                }
                return this._value;
            },
            enumerable: false,
            configurable: true
        });
        return ComputedRefImpl;
    }());
    function computed(getterOrOptions) {
        var getter;
        var onlyGetter = isFunction(getterOrOptions);
        if (onlyGetter) {
            getter = getterOrOptions;
        }
        var cRef = new ComputedRefImpl(getter);
        return cRef;
    }

    var isFlushPending = false;
    var pendingPreFlushCbs = [];
    var resolvePromise = Promise.resolve();
    var activePostFlushCbs = null;
    function queuePreFlushCb(cb) {
        queueCb(cb, pendingPreFlushCbs);
    }
    function queueCb(cb, pendingPreFlushCbs) {
        pendingPreFlushCbs.push(cb);
        queueFlush();
    }
    function queueFlush() {
        if (!isFlushPending) {
            isFlushPending = true;
            resolvePromise.then(flushJobs);
        }
    }
    function flushJobs() {
        isFlushPending = false;
        flushPreFlushCbs();
    }
    function flushPreFlushCbs() {
        if (pendingPreFlushCbs.length) {
            activePostFlushCbs = __spreadArray([], __read(new Set(pendingPreFlushCbs)), false);
            pendingPreFlushCbs.length = 0;
            for (var index = 0; index < activePostFlushCbs.length; index++) {
                activePostFlushCbs[index]();
            }
        }
    }

    function watch(source, cb, options) {
        return toWatch(source, cb, options);
    }
    function toWatch(source, cb, _a) {
        var _b = _a === void 0 ? EMPTY_OBJ : _a, immediate = _b.immediate, deep = _b.deep;
        var getter;
        if (isReactive(source)) {
            getter = function () { return source; };
            deep = true;
        }
        else {
            getter = function () { };
        }
        if (cb && deep) {
            var baseGetter_1 = getter;
            getter = function () { return traverse(baseGetter_1()); };
        }
        // 旧值
        var oldValue = EMPTY_OBJ;
        // job函数
        var job = function () {
            if (cb) {
                var newValue = effect.run();
                if (deep || hasChanged(newValue, oldValue)) {
                    cb(newValue, oldValue);
                    oldValue = newValue;
                }
            }
        };
        // 调度器的定义
        var scheduler = function () { return queuePreFlushCb(job); };
        // 生成effect实例
        var effect = new ReactiveEffect(getter, scheduler);
        if (cb) {
            if (immediate) {
                job();
            }
            else {
                oldValue = effect.run();
            }
        }
        else {
            effect.run();
        }
        return function () {
            effect.stop();
        };
    }
    function traverse(value) {
        if (!isObject(value)) {
            return;
        }
        for (var key in value) {
            traverse(value[key]);
        }
        return value;
    }

    var isVNode = function (value) {
        return value ? value.__v_isVNode === true : false;
    };
    var Text = Symbol('Text');
    var Comment = Symbol('Comment');
    var Fragment = Symbol('Fragment');
    function createVNode(type, props, children) {
        if (props) {
            var klass = props.class; props.style;
            if (klass && !isString(klass)) {
                props.class = normalizeClass(klass);
            }
        }
        var shapeFlag = isString(type)
            ? 1 /* ShapeFlags.ELEMENT */
            : isObject(type)
                ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
                : 0;
        return createBaseVNode(type, props, children, shapeFlag);
    }
    function createBaseVNode(type, props, children, shapeFlag) {
        var vnode = {
            __v_isVNode: true,
            type: type,
            children: children,
            props: props,
            shapeFlag: shapeFlag
        };
        normalizeChildren(vnode, children);
        return vnode;
    }
    function normalizeChildren(vnode, children) {
        var type = 0;
        vnode.shapeFlag;
        if (children == null) {
            children = null;
        }
        else if (isArray(children)) {
            type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
        }
        else if (typeof children === 'object') ;
        else if (isFunction(children)) ;
        else {
            children = String(children);
            type = 8 /* ShapeFlags.TEXT_CHILDREN */;
        }
        vnode.children = children;
        vnode.shapeFlag |= type;
    }
    function normalizeClass(value) {
        var res = '';
        if (isString(value)) {
            res = value;
        }
        else if (isArray(value)) {
            for (var index = 0; index < value.length; index++) {
                var normalized = normalizeClass(value[index]);
                if (normalized) {
                    res += normalized + ' ';
                }
            }
        }
        else if (isObject(value)) {
            for (var key in value) {
                if (value[key]) {
                    res += key + ' ';
                }
            }
        }
        return res.trim();
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function cloneIfMounted(child) {
        return child;
    }
    // 将子元素标准化成vnode的形式
    function normalizeVNode(child) {
        if (typeof child === 'object') {
            // 对象类型默认就是标准化的，直接返回
            return cloneIfMounted(child);
        }
        else {
            return createVNode(Text, null, String(child));
        }
    }

    function h(type, propsOrChildren, children) {
        var l = arguments.length;
        if (l === 2) {
            if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
                if (isVNode(propsOrChildren)) {
                    return createVNode(type, null, [propsOrChildren]);
                }
                return createVNode(type, propsOrChildren, []);
            }
            else {
                return createVNode(type, null, propsOrChildren);
            }
        }
        else {
            if (l > 3) {
                children = Array.prototype.slice.call(arguments, 2);
            }
            else if (l == 3 && isVNode(children)) {
                children = [children];
            }
            return createVNode(type, propsOrChildren, children);
        }
    }

    function createRenderer(options) {
        return baseCreateRenderer(options);
    }
    function baseCreateRenderer(options) {
        var hostInsert = options.insert, hostCreateElement = options.createElement, hostPatchProp = options.patchProp, hostSetElementText = options.setElementText, hostSetText = options.setText, hostRemove = options.remove, hostCreateText = options.createText, hostCreateComment = options.creatComment;
        // element的挂载操作
        var mountElement = function (vnode, container, anchor) {
            /**
             * 1.创建元素
             * 2.设置文本
             * 3.设置属性
             * 4.插入元素
             */
            var type = vnode.type, props = vnode.props, shapeFlag = vnode.shapeFlag;
            // 1.创建元素
            var el = (vnode.el = hostCreateElement(type));
            if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                // 2.设置文本
                hostSetElementText(el, vnode.children);
            }
            if (props) {
                for (var key in props) {
                    hostPatchProp(el, key, null, props[key]);
                }
            }
            hostInsert(el, container, anchor);
        };
        var patchElement = function (oldVNode, newVNode) {
            var el = (newVNode.el = oldVNode.el);
            var oldProps = oldVNode.props || EMPTY_OBJ;
            var newProps = newVNode.props || EMPTY_OBJ;
            patchChildren(oldVNode, newVNode, el);
            patchProps(el, newVNode, oldProps, newProps);
        };
        var patchChildren = function (oldVNode, newVNode, contaienr, anchor) {
            var c1 = oldVNode && oldVNode.children;
            oldVNode ? oldVNode.shapeFlag : 0;
            var c2 = newVNode.children;
            var shapeFlag = newVNode.shapeFlag;
            if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                if (c2 !== c1) {
                    hostSetElementText(contaienr, c2);
                }
            }
        };
        var patchProps = function (el, vnode, oldProps, newProps) {
            if (oldProps !== newProps) {
                for (var key in newProps) {
                    var next = newProps[key];
                    var prev = oldProps[key];
                    if (next !== prev && next !== 'value') {
                        hostPatchProp(el, key, prev, next);
                    }
                }
                if (oldProps !== EMPTY_OBJ) {
                    for (var key in oldProps) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        };
        var processElement = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                // 挂载
                mountElement(newVNode, container, anchor);
            }
            else {
                // 更新
                patchElement(oldVNode, newVNode);
            }
        };
        var processText = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                hostInsert((newVNode.el = hostCreateText(newVNode.children)), container, anchor);
            }
            else {
                var el = (newVNode.el = oldVNode.el);
                if (newVNode.children !== oldVNode.children) {
                    hostSetText(el, newVNode.children);
                }
            }
        };
        var processCommentNode = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                hostInsert((newVNode.el = hostCreateComment(newVNode.children)), container, anchor);
            }
            else {
                // comment不存在更新操作
                newVNode.el = oldVNode.el;
            }
        };
        var mountChildren = function (children, container, anchor) {
            if (isString(children)) {
                children = children.split('');
            }
            for (var i = 0; i < children.length; i++) {
                var child = (children[i] = normalizeVNode(children[i]));
                patch(null, child, container, anchor);
            }
        };
        var processFragment = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                mountChildren(newVNode.children, container, anchor);
            }
            else {
                patchChildren(oldVNode, newVNode, container);
            }
        };
        var patch = function (oldVNode, newVNode, container, anchor) {
            if (anchor === void 0) { anchor = null; }
            if (oldVNode === newVNode) {
                return;
            }
            if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
                unmount(oldVNode);
                oldVNode = null;
            }
            var type = newVNode.type, shapeFlag = newVNode.shapeFlag;
            switch (type) {
                case Text:
                    processText(oldVNode, newVNode, container, anchor);
                    break;
                case Comment:
                    processCommentNode(oldVNode, newVNode, container, anchor);
                    break;
                case Fragment:
                    processFragment(oldVNode, newVNode, container, anchor);
                    break;
                default:
                    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                        processElement(oldVNode, newVNode, container, anchor);
                    }
            }
        };
        var unmount = function (oldVNode) {
            hostRemove(oldVNode.el);
        };
        var render = function (vnode, container) {
            if (vnode == null) {
                if (container._vnode) {
                    unmount(container._vnode);
                }
            }
            else {
                patch(container._vnode || null, vnode, container);
            }
            container._vnode = vnode;
        };
        return {
            render: render
        };
    }

    function patchClass(el, value) {
        if (value == null) {
            el.removeAttribute('class');
        }
        else {
            el.className = value;
        }
    }

    function patchDOMProp(el, key, nextValue) {
        try {
            el[key] = nextValue;
        }
        catch (error) { }
    }

    function patchAttr(el, key, value) {
        if (value == null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, value);
        }
    }

    function patchStyle(el, prev, next) {
        // 获取元素样式
        var style = el.style;
        // 判断next样式类型
        var isCssString = isString(next);
        // next存在，且不是字符串类型
        if (next && !isCssString) {
            // 设置新的样式
            for (var key in next) {
                setStyle(style, key, next[key]);
            }
            // 遍历旧样式，删除不存在于新样式中的旧样式
            if (prev && !isString(prev)) {
                for (var key in prev) {
                    if (next[key] == null) {
                        setStyle(style, key, '');
                    }
                }
            }
        }
    }
    function setStyle(style, name, value) {
        // 设置样式值
        style[name] = value;
    }

    function patchEvent(el, rowName, prevValue, nextValue) {
        // 获取挂载在el上存储事件的对象
        var invokers = el._vei || (el._vei = {});
        // 获取当前rowName对应的值
        var existingInvoker = invokers[rowName];
        if (nextValue && existingInvoker) {
            // 事件更新
            existingInvoker.value = nextValue;
        }
        else {
            // 获取事件的小写，用在addEventListener函数中
            var name_1 = parseName(rowName);
            if (nextValue) {
                // 新增事件
                var invoker = (invokers[rowName] = createInvoker(nextValue));
                el.addEventListener(name_1, invoker);
            }
            else if (existingInvoker) {
                // 删除事件
                el.removeEventListener(name_1, existingInvoker);
                invokers[rowName] = undefined;
            }
        }
    }
    function parseName(name) {
        return name.slice(2).toLocaleLowerCase();
    }
    function createInvoker(initialInvoker) {
        var invoker = function () {
            invoker.value();
        };
        invoker.value = initialInvoker;
        return invoker;
    }

    function patchProp(el, key, prevValue, nextValue) {
        if (key === 'class') {
            patchClass(el, nextValue);
        }
        else if (key === 'style') {
            patchStyle(el, prevValue, nextValue);
        }
        else if (isOn(key)) {
            if (!isModelListener(key)) {
                patchEvent(el, key, prevValue, nextValue);
            }
        }
        else if (shouldSetAsProp(el, key)) {
            patchDOMProp(el, key, nextValue);
        }
        else {
            patchAttr(el, key, nextValue);
        }
    }
    function shouldSetAsProp(el, key, value) {
        if (key === 'form') {
            return false;
        }
        if (key === 'list' && el.tagName === 'INPUT') {
            return false;
        }
        if (key === 'type' && el.tagName === 'TEXTAREA') {
            return false;
        }
        return key in el;
    }

    var doc = document;
    var nodeOps = {
        insert: function (child, parent, anchor) {
            parent.insertBefore(child, anchor || null);
        },
        createElement: function (type) {
            var el = doc.createElement(type);
            return el;
        },
        setElementText: function (el, text) {
            el.textContent = text;
        },
        setText: function (el, text) {
            el.nodeValue = text;
        },
        remove: function (child) {
            var parentNode = child.parentNode;
            if (parentNode) {
                parentNode.removeChild(child);
            }
        },
        createText: function (text) {
            return doc.createTextNode(text);
        },
        creatComment: function (text) {
            return doc.createComment(text);
        }
    };

    var rendererOptions = extend({ patchProp: patchProp }, nodeOps);
    var renderer;
    function ensureRednderer() {
        return renderer || (renderer = createRenderer(rendererOptions));
    }
    var render = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = ensureRednderer()).render.apply(_a, __spreadArray([], __read(args), false));
    };

    exports.Comment = Comment;
    exports.Fragment = Fragment;
    exports.Text = Text;
    exports.computed = computed;
    exports.effect = effect;
    exports.h = h;
    exports.queuePreFlushCb = queuePreFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.render = render;
    exports.watch = watch;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=vue.js.map
