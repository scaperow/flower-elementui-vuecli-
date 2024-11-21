import go from 'gojs'
import _ from 'lodash'
import Maps from '../maps'
import { updateNodeDirection, layoutTree, applyNodeStyle, getNodeStyle, layoutAll } from '../helper'
import Color from 'color'
const DefaultModel = {
  "class": "go.TreeModel",
  "nodeDataArray": [
    { "key": 0, "text": "主题", "location": "0 0", category: 'TreeTitle', dir: 'right' }
  ]
}


let $ = go.GraphObject.make


class MindMap extends Maps {
  name = "MINDMAP"
  allowActions = ['undo', 'redo', 'zoom']

  constructor(style, setting, model) {
    super(style, setting, model)
  }

  mount (elementId, args) {
    super.mount(elementId)

    var modelData = null

    try {
      modelData = JSON.parse(this.model)
    } catch (e) { }

    if (_.isEmpty(_.get(modelData, 'nodeDataArray'))) {
      this.model = JSON.stringify(DefaultModel)
    }

    var properties = {
      model: go.Model.fromJson(this.model),
      allowCopy: false,
      "commandHandler.copiesTree": true,
      "commandHandler.copiesParentKey": true,
      "commandHandler.deletesTree": true,
      "draggingTool.dragsTree": true,
      "undoManager.isEnabled": true,
      ...this.templateMaker.makeNodeTemplates(),
      ...this.templateMaker.makeMindLinkTemplate(),
      SelectionMoved: (e) => {
        var rootX = this.canvas.findNodeForKey(0).location.x;
        this.canvas.selection.each((node) => {
          if (node.data.parent !== 0)
            return;

          var nodeX = node.location.x;

          if (rootX < nodeX && node.data.dir !== "right") {
            updateNodeDirection(this.canvas, node, "right");
          } else if (rootX > nodeX && node.data.dir !== "left") {
            updateNodeDirection(this.canvas, node, "left");
          }

          layoutTree(node);
        })
      }
    }

    this.canvas.setProperties(properties)


    this.templateMaker.addDragEnterListener((e, object, target) => {
      var { fill } = _.get(this.style, object.data.category)

      var shape = object.findObject("NODE")
      shape.fill = Color(fill).lighten(2).hex()

    }, 'TreeTitle', 'TreeSubtitle')

    this.templateMaker.addDropListener((e, object, target) => {
      var parentKey = object.key
      var { category } = object.data
      var it = object.diagram.selection.iterator
      var data = null
      var { fill, stroke, fontColor } = _.get(this.style, category)

      object.diagram.commit(($) => {
        while (it.next()) {
          data = it.value.data

          object.diagram.model.setDataProperty(data, "parent", parentKey)
          if (category === 'TreeTitle' && it.value.data.category === 'TreeNode') {
            object.diagram.model.setCategoryForNodeData(data, 'TreeSubtitle')
          }

          if (category === 'TreeSubtitle' && it.value.data.category === 'TreeSubtitle') {
            object.diagram.model.setCategoryForNodeData(data, 'TreeNode')
          }
        }
      }, '调整结构')

      layoutTree(object)
    }, 'TreeTitle', 'TreeSubtitle')

    this.templateMaker.addDragLeaveListener((e, object) => {
      var { fill } = _.get(this.style, object.data.category)

      var shape = object.findObject("NODE")
      shape.fill = fill

    }, 'TreeTitle', 'TreeSubtitle')

    this.bindEvents()
    layoutAll(this.canvas)
  }
}

export default MindMap