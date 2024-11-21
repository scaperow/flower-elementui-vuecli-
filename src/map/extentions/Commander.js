import go from 'gojs'

import { layoutAll, startEditText } from '../helper'
const $ = go.GraphObject.make

const addTreeNode = function (parentNode, beforeCreateCommit) {
  var adorn = parentNode.part
  var oldData = adorn.data
  var diagram = adorn.diagram
  var category = 'TreeNode'
  diagram.startTransaction("Add Node")

  if (adorn) {
    var parentCategory = adorn.data.category
    if (parentCategory === 'TreeTitle') {
      category = 'TreeSubtitle'
    } else if (parentCategory === 'TreeSubtitle') {
      category = 'TreeNode'
    }
  }

  // copy the brush and direction to the new node data
  var newdata = { brush: oldData.brush, dir: oldData.dir, parent: oldData.key, category: category }
  diagram.model.addNodeData(newdata)
  if (beforeCreateCommit) {
    beforeCreateCommit(newdata)
  }

  layoutAll(parentNode.diagram);
  diagram.commitTransaction("Add Node");

  // if the new node is off-screen, scroll the diagram to show the new node
  var newNode = diagram.findNodeForData(newdata);
  if (newNode !== null) {
    diagram.scrollToRect(newNode.actualBounds)
    diagram.select(newNode)
    startEditText(newNode)
  }

  return newNode
}

const formatKeyInput = function (keyEvent) {
  var result = []

  if (keyEvent.shift) {
    result.push('shift')
  }

  if (keyEvent.control) {
    result.push('ctrl')
  }

  if (keyEvent.alt) {
    result.push('alt')
  }

  result.push(keyEvent.event.key.toLowerCase())
  result = result.join('&')

  if (result[0] === '&') {
    result = result.slice(1)
  }

  return result
}

const formatKeyChar = function (key) {
  return key.replace(' ', '').toLowerCase()
}


class Commander extends go.CommandHandler {
  customShortcutKeys = {}

  constructor() {
    super()
  }

  loopEverySelection = function (canvas, callback, onFinish) {
    var it = canvas.selection.iterator
    while (it.next()) {
      callback.call(this, it.value, it)
    }

    if (onFinish) {
      onFinish()
    }
  }


  editNodeText (object) {
    if (!object) {
      object = this.diagram.selection.first()
    }

    if (object) {
      if (this.diagram && !this.diagram.isReadOnly) {
        var text = object.part.findObject('TEXT')

        if (text) {
          this.editTextBlock(text)
        }
      }
    }
  }

  expandTreeNode (object) {
    if (!object) {
      object = this.diagram.selection.first()

    }

    if (object.key !== 0) {
      if (this.diagram.commandHandler.canExpandTree(object)) {
        this.diagram.commandHandler.expandTree(object)
      }
    }
  }

  collapseTreeNode (object) {
    if (!object) {
      object = this.diagram.selection.first()
    }

    if (object && object.key !== 0) {
      if (this.diagram.commandHandler.canCollapseTree(object)) {
        this.diagram.commandHandler.collapseTree(object)
      }
    }
  }

  arrowKeySelect () {
    var e = this.diagram.lastInput
    var key = formatKeyInput(e)
    var nextPart = null;

    if (!this.diagram.lastInput.handled) {
      switch (key) {
        case 'arrowleft':
          nextPart = this.findNearestPartTowards(180)
          break

        case 'arrowup':
          nextPart = this.findNearestPartTowards(270)
          break

        case 'arrowdown':
          nextPart = this.findNearestPartTowards(90)
          break

        case 'arrowright':
          nextPart = this.findNearestPartTowards(0)
          break
      }

      if (nextPart !== null) {
        if (e.shift) {
          nextPart.isSelected = true;
        }
        else if (e.control || e.meta) {
          nextPart.isSelected = !nextPart.isSelected;
        }
        else {
          this.diagram.select(nextPart)
        }


        this.diagram.lastInput.handled = true
      }
    }
  }

  canDeleteSelection () {
    this.diagram.selection.iterator
  }

  doKeyDown () {
    var key = formatKeyInput(this.diagram.lastInput)
    //1 handler custom key binding
    this.loopEverySelection(this.diagram,
      (part) => {
        var keys = _.get(this.customShortcutKeys, part.category)
        if (!_.isEmpty(keys)) {
          _.each(keys, (onHit, partKey) => {
            if (formatKeyChar(partKey) === key) {
              onHit.call(this, part)

              this.diagram.lastInput.handled = true
            }
          })
        }
      })

    //2 handler system key binding
    if (!this.diagram.lastInput.handled) {
      this.arrowKeySelect()
    }

    //3 handler go.js key binding 
    if (!this.diagram.lastInput.handled) {
      super.doKeyDown()
    }
  }

  registeShortcuts (shapeCategories, key, onHit) {
    _.each(shapeCategories, shapeCategory => {
      var shortcut = _.get(this.customShortcutKeys, shapeCategory)

      if (!shortcut) {
        shortcut = {
          key,
          triggers: []
        }

        this.customShortcutKeys[shapeCategory] = shortcut
      }

      this.customShortcutKeys[shapeCategory].triggers.push(onHit)
    })
  }

  registeShortcuts (regedit) {
    this.customShortcutKeys = regedit
  }

  moveUp () {
    this.diagram.commit(($) => {
      this.loopEverySelection(this.diagram, (shape) => {
        var data = shape.part.data
        var newOrder = ((data.zOrder || 0) + 1)
        $.model.set(data, 'zOrder', newOrder)
      })
    }, '上移')
  }

  moveDown () {
    this.diagram.commit(($) => {
      this.loopEverySelection(this.diagram, (shape) => {
        var data = shape.part.data
        var newOrder = ((data.zOrder || 1) - 1)
        $.model.set(data, 'zOrder', newOrder < 0 ? 0 : newOrder)
      })
    }, '下移')
  }

  removeNode () {
    this.diagram.commit(() => {
      this.loopEverySelection(this.diagram, (shape) => {
        this.diagram.commit(($) => {
          var data = shape.part.data
          $.model.removeNodeData(data)
        })
      })
    }, '删除图形')
  }

  setGroup () {
    this.diagram.commit(($) => {
      var groupName = 'group'

      $.model.addNodeData({
        key: groupName,
        isGroup: true
      })

      this.loopEverySelection(this.diagram, (shape) => {
        $.model.set(shape.data, 'group', groupName)
      })
    }, '合并一组')
  }

  insertChild (part) {
    addTreeNode(part)
  }

  insertBrother (part) {
    var parent = part.diagram.findNodeForKey(part.part.data.parent)

    if (parent) {
      addTreeNode(parent)
    }
  }

  selectUpNode (part) {
    var modelData = part.diagram.model.toJson()
    var childNodes = _.find(modelData, { parent: part.data.parent })
    var offset = _.indexOf(childNodes, { key: part.key })

    var result = _.chain(childNodes)
      .slice(offset)
      .reduce((result, current, key) => {
        current.part.data.key
      }, { part: part, step: 0 })
      .value()

    //var parentKey = part.data.parent
    //this.diagram.model.findNodeDataForKey(parentKey)
    // part.data.key

  }

  selectRightNode (part) {

  }

  selectDownNode (part) {

  }

  selectLeftNode (part) {

  }

  insertParent (part) {
    var canvas = this.diagram
    var parent = canvas.findNodeForKey(part.part.data.parent)

    if (parent) {
      addTreeNode(parent, (newParent) => {
        var newCategory = getTreeChildCategory(newParent.category)

        canvas.model.setDataProperty(shape.part.data, "parent", newParent.key)
        canvas.model.setCategoryForNodeData(shape.part.data, newCategory)
      })
    }
  }

  getAllParts () {
    var allParts = new Array();
    this.diagram.nodes.each(function (node) { allParts.push(node); });
    this.diagram.parts.each(function (part) { allParts.push(part); });
    // note that this ignores Links
    return allParts;
  }

  findNearestPartTowards (dir) {
    var originalPart = this.diagram.selection.first();
    if (originalPart === null) return null;
    var originalPoint = originalPart.actualBounds.center;
    var allParts = this.getAllParts();
    var closestDistance = Infinity;
    var closest = originalPart;  // if no parts meet the criteria, the same part remains selected

    for (var i = 0; i < allParts.length; i++) {
      var nextPart = allParts[i];
      if (nextPart === originalPart) continue;  // skips over currently selected part
      var nextPoint = nextPart.actualBounds.center;
      var angle = originalPoint.directionPoint(nextPoint);
      var anglediff = this.angleCloseness(angle, dir);
      if (anglediff <= 45) {  // if this part's center is within the desired direction's sector,
        var distance = originalPoint.distanceSquaredPoint(nextPoint);
        distance *= 1 + Math.sin(anglediff * Math.PI / 180);  // the more different from the intended angle, the further it is
        if (distance < closestDistance) {  // and if it's closer than any other part,
          closestDistance = distance;      // remember it as a better choice
          closest = nextPart;
        }
      }
    }
    return closest;
  }

  angleCloseness (angle, dir) {
    return Math.min(Math.abs(dir - angle), Math.min(Math.abs(dir + 360 - angle), Math.abs(dir - 360 - angle)))
  }
}

export default Commander