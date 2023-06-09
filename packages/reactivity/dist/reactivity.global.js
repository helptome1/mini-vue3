var VueReactivity = (function (exports) {
  'use strict';

  function isObject(value) {
      return typeof value === 'object' && value !== null;
  }
  function isFunction(value) {
      return typeof value === 'function';
  }

  let effectStack = []; // 目的就是为了保证我们effect执行的时候，可以存储正确的关系。
  let activeEffect; // 当前活跃的effect
  function cleanUpEffect(effect) {
      const { deps } = effect;
      for (const dep of deps) {
          dep.delete(effect); // 让属性对应的effect移除掉，这样属性更新的时候，就不会出发这个effect重新执行了。
      }
  }
  class ReactiveEffect {
      constructor(fn, scheduler) {
          this.fn = fn;
          this.scheduler = scheduler;
          this.active = true; // this.active = true
          this.deps = []; // 让effect记录依赖的属性。同时也要记录当前属性依赖了哪个effect
          // public fn === this.fn = fn
      }
      // effect执行
      run() {
          // 调用run时，让fn执行。
          if (!this.active) {
              // 非激活状态，会默认执行fn函数
              return this.fn();
          }
          // if用来屏蔽同一个effect多次执行，陷入死循环。
          if (!effectStack.includes(this)) {
              try {
                  effectStack.push((activeEffect = this));
                  return this.fn(); // 取值，new Proxy会执行get方法
              }
              finally {
                  effectStack.pop(); //删除最后一个，并把删除后的最后一个当作activeEffect
                  activeEffect = effectStack[effectStack.length - 1];
              }
          }
      }
      stop() {
          // 让effect和dep取消关联，dep上面存储的effect移除掉
          if (this.active) {
              cleanUpEffect(this);
              this.active = false;
          }
      }
  }
  /**
   * 检查是否需要收集依赖
   * @returns Boolean
   */
  function isTracking() {
      return activeEffect !== undefined;
  }
  /**
   * 2. 依赖收集，把属性和effect对应起来。
   */
  // {obj: {属性：[effect，effect]}}
  const targetMap = new WeakMap();
  function track(target, key) {
      // 是否只要取值我就要收集吗？
      if (!isTracking()) {
          // 如果这个属性， 不依赖于effect直接跳过，不收集
          return;
      }
      let depsMap = targetMap.get(target);
      if (!depsMap) {
          targetMap.set(target, (depsMap = new Map())); // {obj: map{}}
      }
      let dep = depsMap.get(key);
      if (!dep) {
          depsMap.set(key, (dep = new Set())); // {obj: map{name: Set[]}}
      }
      // 收集effect
      trackEffects(dep);
  }
  /**
   * 收集effect
   * @param dep Set
   */
  function trackEffects(dep) {
      if (!dep.has(activeEffect)) {
          // 一个属性对应多个effect，一个effect对应多个属性。多对多的关系
          dep.add(activeEffect); //{obj: map{name: Set[effect, effect]}}
          activeEffect.deps.push(dep);
      }
  }
  /**
   * 触发更新
   * @param target 响应对象
   * @param key 响应对象的属性
   * @returns
   */
  function trigger(target, key) {
      const depsMap = targetMap.get(target);
      if (!depsMap)
          return; // 属性并没有依赖任何的effect
      let deps = []; // [set, set]
      if (key !== undefined) {
          deps.push(depsMap.get(key));
      }
      let effects = [];
      for (const dep of deps) {
          effects.push(...dep);
      }
      triggerEffects(effects);
  }
  function triggerEffects(dep) {
      for (const effect of dep) {
          // 如果当前effect和要执行的effect是同一个，就不执行了
          if (effect !== activeEffect) {
              if (effect.scheduler) {
                  return effect.scheduler(); // 如果有调度器，就让调度器执行
              }
              effect.run(); // 执行effect
          }
      }
  }
  function effect(fn) {
      const _effect = new ReactiveEffect(fn);
      _effect.run(); //默认让fn执行一次
      let runner = _effect.run.bind(_effect);
      runner.effect = _effect;
      return runner;
  }

  class ComputedRefImpl {
      constructor(getter, setter) {
          this.setter = setter;
          this._dirty = true; // this._dirty = true
          this.__v_isRef = true; // 用来标识是一个ref属性
          // 将计算属性包成一个effect
          this.effect = new ReactiveEffect(getter, () => {
              if (!this._dirty) {
                  this._dirty = true;
                  triggerEffects(this.dep);
              }
          });
      }
      get value() {
          if (isTracking()) {
              trackEffects(this.dep || (this.dep = new Set()));
          }
          if (this._dirty) {
              // 取值时会走get方法
              this._value = this.effect.run();
              this._dirty = false;
          }
          return this._value;
      }
      set value(newValue) {
          this.setter(newValue); // 如果修改值，就出发自己写的set方法
      }
  }
  function computed(getterOrOptions) {
      const onlyGetter = isFunction(getterOrOptions);
      let getter;
      let setter;
      if (onlyGetter) {
          getter = getterOrOptions;
          setter = () => { };
      }
      else {
          getter = getterOrOptions.get;
          setter = getterOrOptions.set;
      }
      return new ComputedRefImpl(getter, setter);
  }

  const mutableHandler = {
      get(target, key, recevier) {
          if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */)
              return true;
          // 依赖收集
          track(target, key);
          // 取值时，可以收集它在哪个effect中
          const res = Reflect.get(target, key, recevier);
          return res;
      },
      set(target, key, value, recevier) {
          let oldValue = target[key];
          const res = Reflect.set(target, key, value, recevier);
          if (oldValue != value) {
              trigger(target, key);
          }
          return res;
      }
  };
  // 对劫持的对象做缓存。
  const reactiveMap = new WeakMap(); //1.weakmap弱引用。 2.key必须是对象，如果key没有被引用可以被自动销毁。
  // 工厂函数
  function createReactiveObject(target) {
      // 先默认这个target已经被代理过了
      if (target["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]) {
          return target;
      }
      // reactiveAPI 只针对对象才可以, 不是对象就返回
      if (!isObject(target)) {
          return target;
      }
      // 缓存处理
      const exisitingProxy = reactiveMap.get(target);
      if (exisitingProxy) {
          return exisitingProxy;
      }
      // ------- 核心，数据劫持 -----------
      const proxy = new Proxy(target, mutableHandler); // 当用户获取属性，或者更改属性的时候，劫持属性
      reactiveMap.set(target, proxy);
      return proxy; // 返回代理
  }
  function reactive(target) {
      return createReactiveObject(target);
  }
  // readonly shallowReactive shallowReadonly
  // export function readonly() {
  // }
  // export function shallowReactive() {
  // }
  // export function shallowReadonly() {
  // }

  exports.computed = computed;
  exports.effect = effect;
  exports.reactive = reactive;

  return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
