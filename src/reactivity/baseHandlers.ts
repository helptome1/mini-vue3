import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive'

const get = createGetter()
const readonlyGet = createGetter(true)
function createGetter(isReadonly = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    // 这里有个知识点，为什么要使用Reflect？
    const res = Reflect.get(target, key, receiver)
    if (!isReadonly) {
      // TODO 依赖收集
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    // TODO 触发依赖
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set: createSetter()
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key${key} set 失败`)
    return true
  }
}
