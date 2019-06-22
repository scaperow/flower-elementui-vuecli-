
import Go from 'gojs'
const { GraphObject } = Go
const { make: $ } = GraphObject
const createMenuItem = (text, cickHandler) => {
  return $("ContextMenuButton",
    $(go.TextBlock, text),
    {
      width: 80,
      height: 30,
      click: ((e, shape) => {
        if (cickHandler) {
          cickHandler(e, shape)
        }
      })
    })
}

export default {
  moveUp: createMenuItem('上移', (event, shape) => {
    shape.diagram.commit(($) => {
      var data = shape.part.data
      var newOrder = ((data.zOrder || 0) + 1)
      $.model.set(data, 'zOrder', newOrder)
    }, '上移')

  }),
  moveDown: createMenuItem('下移', (event, shape) => {
    shape.diagram.commit(($) => {

      var data = shape.part.data
      var newOrder = ((data.zOrder || 1) - 1)
      $.model.set(data, 'zOrder', newOrder < 0 ? 0 : newOrder)
    }, '下移')
  }),
  remove: createMenuItem('删除', (event, shape) => {
    shape.diagram.commit(() => {
      shape.diagram.commit(($) => {
        var data = shape.part.data
        $.model.removeNodeData(data)
      })
    }, '删除图形')
  }),
  setGroup: createMenuItem('合并一组', (event, shape) => {
    shape.diagram.commit(($) => {
      var groupName = 'group'

      $.model.addNodeData({
        key: groupName,
        isGroup: true
      })

      $.selection.each(function (part) {
        $.model.set(part.data, 'group', groupName)
      })
    }, '合并一组')
  }),
  insertChild: createMenuItem('添加子节点')
}