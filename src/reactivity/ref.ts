import { hasChange, isObject } from '../shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

class refImpl {
  private _value: any
  public dep
  private _rawValue: any
  public __v_isRef = true
  constructor(value) {
    // ! 这里还需要保存一下原值，用来set时对比
    this._rawValue = value
    // # ref判断value是否是对象，如果是的话，需要用reactive包裹一下
    this._value = convert(value)
    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    // ! 这里的对比应该是两个普通的object对比，所以数据不能用reactive包裹
    // ! 前面用rawValue接受最初始的object
    if (hasChange(this._rawValue, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function ref(value) {
  return new refImpl(value)
}

export function unRef(ref) {
  // 首先看看是否是一个对象
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // get -> age(ref)返回.value
      // not ref -> value
      return unRef(Reflect.get(target, key))
    },

    set(target, key, value) {
      // set -> ref  .value
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
