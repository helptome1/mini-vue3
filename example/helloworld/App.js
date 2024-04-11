export const App = {
  render() {
    // 返回一个虚拟节点
    return h('div', 'hi, ' + this.msg)
  },
  setup() {
    // composition api
    return {
      msg: 'mini-vue'
    }
  }
}
