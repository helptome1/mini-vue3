import { extend } from '../shared'
// 定义一个全局变量进行获取当前的effect
let activeEffect
// 定义一个全局变量判断当前依赖是否需要收集track
let shouldTrack
class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  public scheduler: Function | undefined
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    if (!this.active) {
      return this._fn()
    }
    // ! 执行函数是触发依赖收集的条件。因此在此处做全局变量的变更
    shouldTrack = true
    // 获取当前执行的effect实例
    activeEffect = this
    // 依赖收集
    const result = this._fn()
    // 关闭依赖收集的条件
    shouldTrack = false

    return result
  }
  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

// 清除当前effect
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.splice(0)
}

const targetMap = new Map()
export function track(target, key) {
  if(!isTracking()) return
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
  if(dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

// 触发依赖
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const deps = depsMap.get(key)
  for (let effect of deps) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // extend
  extend(_effect, options)

  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
