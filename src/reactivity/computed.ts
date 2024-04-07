import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _getter: any
  private _value: any
  private _dirty: boolean = true

  private _effect: any

  constructor(getter) {
    this._getter = getter
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    // 做缓存
    // 当依赖的响应式对象发生改变的时候
    if (this._dirty) {
      this._value = this._effect.run()
      this._dirty = false
    }
    return this._value
  }
  set value(newValue) {
    // trigger
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}
