import { effect, stop } from '../effect'
import { reactive } from '../reactive'

describe('effect', () => {
  it('start effect', () => {
    const user = reactive({
      age: 10,
      name: 'why'
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    // update
    user.age++
    expect(nextAge).toBe(12)
  })
  // effect返回里面包裹的函数
  it('effect return', () => {
    // 1. effect(fn) -> function(runner) -> fn -> return
    let foo = 10
    const runner = effect(() => {
      foo = foo + 1
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })
  // scheduler是实现方式
  // 1. 通过effect 的第二个参数给定一个scheduler的fn
  // 2. effect第一次执行的时候，还会执行fn
  // 3. 当响应式对象set update不会执行fn 而是执行scheduler
  // 4. 如果说当执行runner的时候，会再次的执行fn
  it('scheduler', () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    // obj.prop = 3
    obj.prop++
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  it('events: onStop', () => {
    const obj = reactive({
      foo: 1
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop
      }
    )

    stop(runner)
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
