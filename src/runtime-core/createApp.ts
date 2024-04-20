import { render } from './render'
import { createVNode } from './vnode'

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 先把节点（组件）转为虚拟节点
      // 之后所有的逻辑都是基于vnode作处理
      // component -> vnode
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }
}


