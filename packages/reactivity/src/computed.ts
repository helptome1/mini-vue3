import { isFunction } from '@vue/shared'
import { ReactiveEffect, isTracking, trackEffects, triggerEffects } from './effect'

class ComputedRefImpl {
  public _dirty = true // this._dirty = true
  public dep // this.dep = undefined
  public effect // 计算属性的依赖收集
  public __v_isRef = true // 用来标识是一个ref属性
  public _value // 用来表示计算属性的值
  constructor(getter, public setter) {
    // 将计算属性包成一个effect
    this.effect = new ReactiveEffect(getter, () => {
      if(!this._dirty) {
        this._dirty = true
        triggerEffects(this.dep)
      }
    })
  }
  get value() {
    if(isTracking()) {
      trackEffects(this.dep || (this.dep = new Set()))
    }
    if(this._dirty) {
      // 取值时会走get方法
      this._value = this.effect.run() 
      this._dirty = false
    }
    return this._value
  }

  set value(newValue) {
    this.setter(newValue) // 如果修改值，就出发自己写的set方法
  }

}

export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions)

  let getter
  let setter
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {}
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
