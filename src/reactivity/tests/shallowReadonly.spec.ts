import { isReadOnly, shallowReadonly } from '../reactive'

describe('shllowReadonly', () => {
  test('should not make non-reactive prpper', () => {
    const props = shallowReadonly({ name: { foo: 1 } })
    expect(isReadOnly(props)).toBe(true)
    expect(isReadOnly(props.name)).toBe(false)
  })
})
