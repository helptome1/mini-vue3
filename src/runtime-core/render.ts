import { isObject } from '../shared'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // path方法
  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理组件
  // TODO 判断vnode是不是一个element
  // 是element就走element的逻辑
  // 是component就走component的逻辑
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  // init -> mount
  mounteElement(vnode, container)
}

function mounteElement(vnode, container) {
  const el = document.createElement(vnode.type)
  const { children, props } = vnode
  // 处理children
  el.textContent = children
  // props
  for (let key in props) {
    const value = props[key]
    el.setAttribute(key, value)
  }

  container.append(el)
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  // 创建组件实例
  const instance = createComponentInstance(vnode)

  // 初始化组件
  setupComponent(instance)
  // 创建effect, 渲染组件
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render()
  // vnode -> patch
  // vnode -> element -> mount
  // 这里patch的subTree是一个虚拟节点。
  patch(subTree, container)
}
