import go from 'gojs'
import _ from 'lodash'

const makeEmptyBinding = function (isRoot, ...names) {
  return _.map(names, (name) => {
    var binding = null

    switch (name) {
      case 'fontColor':
        binding = new go.Binding('stroke', 'fontColor').makeTwoWay()
        break;

      case 'radius':
        binding = new go.Binding('parameter1', 'radius').makeTwoWay()
        break;

      default:
        binding = new go.Binding(name).makeTwoWay()
    }

    if (isRoot === true) {
      binding = binding.ofObject('')
    }

    return binding
  })
}

const makeEmptyChildBinding = function (...names) {
  return _.map(names, (name) => {
    return new go.Binding(name, name, (value, part) => {
      part.itemArray.forEach(item => {
        item[name] = value
      })
    }).makeTwoWay()
  })
}

const getNodeStyle = function (nodeCategory, style, collectionName = 'parts') {
  return _.find(_.get(style, collectionName), { category: nodeCategory })
}

const getMaxKey = function (canvas) {
  var key = null
  canvas.nodes.each((part) => {
    if (key === null) {
      key = part.key
    } else {
      if (key < part.key) {
        key = part.key
      }
    }
  })

  return key
}


function layoutTree (node) {
  if (node.data.key === 0) {  // adding to the root?
    layoutAll(node.part.diagram);  // lay out everything
  } else {  // otherwise lay out only the subtree starting at this parent node
    var parts = node.findTreeParts();
    layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
  }
}


function layoutAngle (parts, angle) {
  var layout = go.GraphObject.make(go.TreeLayout,
    {
      angle: angle,
      arrangement: go.TreeLayout.ArrangementFixedRoots,
      nodeSpacing: 20,
      layerSpacing: 50,
      setsPortSpot: false, // don't set port spots since we're managing them with our spotConverter function
      setsChildPortSpot: false
    });
  layout.doLayout(parts);
}

function updateNodeDirection (canvas, node, dir) {
  canvas.model.setDataProperty(node.data, "dir", dir);
  // recursively update the direction of the child nodes
  var chl = node.findTreeChildrenNodes(); // gives us an iterator of the child nodes related to this particular node
  while (chl.next()) {
    updateNodeDirection(canvas, chl.value, dir);
  }
}

function startEditText (object) {
  var canvas = object.diagram

  if (canvas && !canvas.isReadOnly) {
    var text = object.part.findObject('TEXT');
    if (text) {
      canvas.commandHandler.editTextBlock(text);
    }
  }
}

function layoutAll (canvas) {
  var root = canvas.findNodeForKey(0);
  if (root === null) return;
  canvas.startTransaction("Layout");
  // split the nodes and links into two collections
  var rightward = new go.Set(/*go.Part*/);
  var leftward = new go.Set(/*go.Part*/);
  root.findLinksConnected().each(function (link) {
    var child = link.toNode;
    if (child.data.dir === "left") {
      leftward.add(root);  // the root node is in both collections
      leftward.add(link);
      leftward.addAll(child.findTreeParts());
    } else {
      rightward.add(root);  // the root node is in both collections
      rightward.add(link);
      rightward.addAll(child.findTreeParts());
    }
  });
  // do one layout and then the other without moving the shared root node
  layoutAngle(rightward, 0);
  layoutAngle(leftward, 180);
  canvas.commitTransaction("Layout");
}

export {
  makeEmptyBinding,
  makeEmptyChildBinding,
  getMaxKey,
  layoutAll,
  layoutTree,
  layoutAngle,
  getNodeStyle,
  updateNodeDirection,
  startEditText
}