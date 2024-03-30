import { isReadOnly, readonly } from '../reactive'

describe('readonly', () => {
  it('happy path', () => {
    // not set
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
    expect(isReadOnly(wrapped)).toBe(true)
  })

  it('warn', () => {
    console.warn = jest.fn()
    const readonlyObj = readonly({
      name: 'hzg'
    })
    readonlyObj.name = '11s'
    expect(console.warn).toHaveBeenCalled()
  })
})
