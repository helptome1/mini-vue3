class ReactiveEffect {
  private _fn: any

  constructor(fn) {
    this._fn = fn
  }

  run() {
    // 获取当前执行的effect实例
    activeEffect = this
    this._fn()
  }
}

const targetMap = new Map()
export function track(target, key) {
  // target -> key -> dep
  // targetMap(target -> depsMap) -> depsMap(key -> dep)
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  dep.add(activeEffect)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const deps = depsMap.get(key)
  for (let dep of deps) {
    dep.run()
  }
}

// 定义一个全局变量进行获取当前的effect
let activeEffect
export function effect(fn) {
  // fn
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}
