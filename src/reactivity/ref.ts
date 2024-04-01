import { hasChange, isObject } from '../shared'
import { isTracking, trackEffects, triggerEffect } from './effect'
import { reactive } from './reactive'

class refImpl {
  private _value: any
  public dep
  private _rawValue: any
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
    if (hasChange(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffect(this.dep)
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

export function ref(value) {
  return new refImpl(value)
}
