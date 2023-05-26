import { isObject } from '@vue/shared'
import { track, trigger } from './effect'

const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

const mutableHandler: ProxyHandler<Record<any, any>> = {
  get(target, key, recevier) {
    if (key === ReactiveFlags.IS_REACTIVE) return true
    // 依赖收集
    track(target, key)
    // 取值时，可以收集它在哪个effect中
    const res = Reflect.get(target, key, recevier)
    return res
  },
  set(target, key, value, recevier) {
    let oldValue = (target as any)[key]
    const res = Reflect.set(target, key, value, recevier)
    if(oldValue != value) {
      trigger(target, key)
    }
    return res
  }
}

// 对劫持的对象做缓存。
const reactiveMap = new WeakMap() //1.weakmap弱引用。 2.key必须是对象，如果key没有被引用可以被自动销毁。
// 工厂函数
function createReactiveObject(target: Object) {
  // 先默认这个target已经被代理过了
  if ((target as any)[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  // reactiveAPI 只针对对象才可以, 不是对象就返回
  if (!isObject(target)) {
    return target
  }
  // 缓存处理
  const exisitingProxy = reactiveMap.get(target)
  if (exisitingProxy) {
    return exisitingProxy
  }
  // ------- 核心，数据劫持 -----------
  const proxy = new Proxy(target, mutableHandler) // 当用户获取属性，或者更改属性的时候，劫持属性
  reactiveMap.set(target, proxy)

  return proxy // 返回代理
}

export function reactive(target: Object) {
  return createReactiveObject(target)
}

// readonly shallowReactive shallowReadonly
// export function readonly() {
// }
// export function shallowReactive() {
// }
// export function shallowReadonly() {
// }
