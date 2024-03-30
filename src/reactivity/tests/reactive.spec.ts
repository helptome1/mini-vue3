import { isReactive, reactive } from "../reactive"

describe('reactive', () => {
  it('happp path', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    original.foo = 3
    expect(observed.foo).toBe(3)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
  })
})
