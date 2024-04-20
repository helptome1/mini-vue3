import { h } from '../../lib/guide-mini-vue.esm.js'
export const App = {
  render() {
    // 返回一个虚拟节点
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'blue']
      },
      // 'hi, ' + this.msg
      'hi, mini-vue'
    )
  },
  setup() {
    // composition api
    return {
      msg: 'mini-vue'
    }
  }
}
