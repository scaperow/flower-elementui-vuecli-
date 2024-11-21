import go from 'gojs'
import _ from 'lodash'
import Maps from '../maps'

let $ = go.GraphObject.make
const DefaultModel = {
}

class FlowChart extends Maps {
  name = "FLOWCHART"
  allowActions = ['undo', 'redo', 'cut', 'paste', , 'copy', 'ceiling', 'floor', 'lock', 'unlock', 'merge', 'split']
  mount (elementId) {
    super.mount(elementId)

    var properties = {
      "undoManager.isEnabled": true,
      "commandHandler.archetypeGroupData": { isGroup: true, title: '分组', ungroupable: true, category: 'Group' },
      ...this.toolMaker.makeMeshTemplate(),
      ...this.templateMaker.makeGroupTemplate(),
      ...this.templateMaker.makeNodeTemplates(),
      ...this.templateMaker.makeFlowLinkTemplate(),
      ...this.toolMaker.makeRelinkTool(),
      ...this.toolMaker.makeDraggingTool(),
      ...this.toolMaker.makeRotatingTool(),
      ...this.toolMaker.makeResizingTool(),
      model: go.Model.fromJson(this.model || DefaultModel)
    }

    this.canvas.setProperties(properties)

    super.bindEvents()
  }

}

export default FlowChart