import Go from 'gojs'
import _ from 'lodash'
import ContextMenus from './ContextMenus'
import { AST_Return } from 'terser';
import { Input } from 'antd';

const { GraphObject } = Go
const { make: $ } = GraphObject

let shapes = []
let map = new Go.Map()
let eventListeners = {}
let nodeSelectionAdornmentTemplate =
  $(go.Adornment, "Auto", { cursor: 'move' },
    $(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1, strokeDashArray: [4, 2] }),
    $(go.Placeholder)
  )

let nodeRotateAdornmentTemplate =
  $(go.Adornment,
    { locationSpot: go.Spot.Center, locationObjectName: "CIRCLE", cursor: 'pointer' },
    $(go.Shape, "Diamond", { cursor: "pointer", desiredSize: new go.Size(12, 12), fill: "white", stroke: "deepskyblue" }),
    $(go.Shape, { geometryString: "M6 12 L6 45", isGeometryPositioned: true, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] })
  )

let nodeResizeAdornmentTemplate =
  $(go.Adornment, "Spot",
    { locationSpot: go.Spot.Right },
    $(go.Placeholder),
    $(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(9, 9), fill: "white", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(9, 9), fill: "white", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(9, 9), fill: "white", stroke: "deepskyblue" }),

    $(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(9, 9), fill: "white", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(9, 9), fill: "white", stroke: "deepskyblue" }),

    $(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(9, 9), fill: "white", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(9, 9), fill: "white", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(9, 9), fill: "white", stroke: "deepskyblue" })
  );


let selectionAdornment = $(go.Adornment, "Auto",
  $(go.Shape, "Rectangle",
    { fill: null, stroke: "#409eff", strokeWidth: 1 }),
  $(go.Placeholder)
)

let groupTemplate = $(Go.Group, "Spot",
  {
    selectionAdornmentTemplate: selectionAdornment,
    toSpot: go.Spot.AllSides, // links coming into groups at any side
    toEndSegmentLength: 30, fromEndSegmentLength: 30
  },
  $(go.Panel, "Auto",
    $(go.Shape, "Rectangle",
      {
        cursor: 'move',
        name: "OBJSHAPE",
        fill: '#ffffff'
      }),
    $(go.Placeholder,
      { padding: 16 })
  )
)


let toolTips = {
  shapeName: $('ToolTip', $(Go.TextBlock, { margin: 4 }), new Go.Binding("text", "name").ofObject(""))
}

/**
 * 
 * @param {GraphObject} container
 * @param {String} key
 * @param {String} eventName 
 * @param {Function} handler 
 */
const createListener = function (part, key, eventName, handler) {
  // Registe handler to listener list
  _.set(part, eventName, function () {
    // Append a handler to listner list for this eventName
    if (_.has(eventListeners, eventName)) {
      _.set(eventListeners, {
        key: key,
        listeners: []
      })
    }

    // invoke all listners for this event
    var listeners = _.find(eventListeners, { key: key })
    listeners.add(handler)
  })

  if (!_.has(part, eventName)) {
    // Set listener to this part
    _.set(part, eventName, (e, node) => {
      var listeners = _.get(eventListeners, `${key}.${eventName}.listeners`) || []

      listeners.each((handler) => {
        handler(e, node)
      })
    })
  }
}


/**
 * 
 * @param {String} layout 
 * @returns {GraphObject} container
 */
const createNode = function (node, itemBinding, ...ports) {
  let portSize = new go.Size(10, 10)
  let container = $(go.Node, 'Table', {
    background: 'transparent',
    cursor: 'move',
    locationObjectName: "NODE",
    locationSpot: go.Spot.Center,
    selectable: true,
    selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
    selectionObjectName: 'NODE',
    resizable: true,
    resizeObjectName: 'NODE',
    resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
    rotatable: true,
    rotateAdornmentTemplate: nodeRotateAdornmentTemplate,
    toolTip: toolTips.shapeName,
    mouseEnter (event, node) {
      node.part.ports.each((port) => {
        port.opacity = 1

      })
    },
    mouseLeave (event, node) {
      node.part.ports.each((port) => {
        port.opacity = 0
      })
    },
    doubleClick (event, node) {
      var text = node.part.findObject('TEXT');
      if (text) {
        node.diagram.commandHandler.editTextBlock(text);
      }
    }
  },
    node,
    $(go.Panel,
      {
        row: 1,
        column: 0,
        _side: "left",
        cursor: "pointer",
      },
      $(go.Shape, "Circle",
        {
          fromSpot: go.Spot.Left,
          toSpot: go.Spot.Left,
          fromLinkable: true,
          toLinkable: true,
          portId: 'LEFT',
          name: 'PORT',
          stroke: null, strokeWidth: 0,
          desiredSize: portSize,
          fill: 'red',
          opacity: 0
        }
      )),
    $(go.Panel,
      {
        row: 1,
        column: 2,
        _side: "left",
        cursor: "pointer",
      },
      $(go.Shape, "Circle",
        {
          fromSpot: go.Spot.Right,
          toSpot: go.Spot.Right,
          fromLinkable: true,
          toLinkable: true,
          portId: 'RIGHT',
          name: 'PORT',
          stroke: null, strokeWidth: 0,
          desiredSize: portSize,
          fill: 'red',
          opacity: 0
        }
      )),
    $(go.Panel,
      {
        row: 0,
        column: 1,
        _side: "left",
        cursor: "pointer"
      },
      $(go.Shape, "Circle",
        {
          fromSpot: go.Spot.Top,
          toSpot: go.Spot.Top,
          fromLinkable: true,
          toLinkable: true,
          portId: 'TOP',
          name: 'PORT',
          stroke: null, strokeWidth: 0,
          desiredSize: portSize,
          fill: 'red',
          opacity: 0
        }
      )),
    $(go.Panel,
      {
        row: 2,
        column: 1,
        _side: "left",
        cursor: "pointer",
      },
      $(go.Shape, "Circle",
        {
          fromSpot: go.Spot.Bottom,
          toSpot: go.Spot.Bottom,
          fromLinkable: true,
          toLinkable: true,
          opacity: 0,
          portId: 'BOTTOM',
          name: 'PORT',
          stroke: null, strokeWidth: 0,
          desiredSize: portSize,
          fill: 'red',
          opacity: 0
        }
      )))


  // if (ports.length > 0) {
  //   _.each(ports, (port) => {

  //   })

  //   createListener(options, 'CONTAINER', 'mouseEnter', (e, node) => {
  //     showSmallPorts(node, true)
  //   })

  //   createListener(options, 'CONTAINER', 'mouseEnter', (e, node) => {
  //     showSmallPorts(node, false)
  //   })
  // }

  return container
}

/**
 * 
 * @param {*} part 
 * @param {*} eventName 
 * @param {*} handler 
 */
const removeListener = function (key, eventName, handler) {
  _.pull((eventListeners, `${key}.${eventName}.listeners`) || [], handler)
}


const showSmallPorts = function (node, show) {
  if (node.diagram && !node.diagram.isReadOnly) {
    node.ports.each(function (port) {
      if (port.portId !== "") {  // don't change the default port, which is the big shape
        port.fill = show ? "#d5e8d4" : null
        port.stroke = show ? "gray" : null
      }
    })
  }
}

const makePort = function (name, spot, output, input) {
  return $(go.Shape, "Circle",
    {
      fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
      stroke: null,
      desiredSize: new go.Size(12, 12),
      alignment: spot,  // align the port on the main Shape
      alignmentFocus: spot,  // just inside the Shape
      portId: name,  // declare this object to be a "port"
      fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
      fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
      cursor: "pointer"  // show a different cursor to indicate potential link point
    });
}

const makeEmptyBinding = function (isRoot, ...names) {
  return _.map(names, (name) => {
    var binding = new Go.Binding(name)
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
    })
  })
}

/*
map.add('Shape',
  $(Go.Node, "Auto", {
    resizable: true, width: 60, height: 60,

    mouseEnter: function (e, node) { showSmallPorts(node, true); },
    mouseLeave: function (e, node) { showSmallPorts(node, false); }
  }, new Go.Binding("location", "loc", Go.Point.parse).makeTwoWay(Go.Point.stringify), { locationSpot: Go.Spot.Center },
    $(Go.Shape, {
      fill: "#fff",
      cursor: 'move'
    },
      ...makeEmptyBinding(false, 'stroke', 'figure', 'strokeWidth', 'opacity', 'fill')),

    $(Go.TextBlock, {
      name: 'TEXT',
      alignment: go.Spot.Center,
      wrap: go.TextBlock.WrapFit,
      verticalAlignment: go.Spot.Center,
      editable: true,
      margin: 12,
      textAlign: 'center',
      background: 'transparent'
    },
      new go.Binding('stroke', 'fontColor'),
      ...makeEmptyBinding(false, 'text', 'opacity')),

    // four named ports, one on each side:
    makePort("T", Go.Spot.Top, true, true),
    makePort("L", Go.Spot.Left, true, true),
    makePort("R", Go.Spot.Right, true, true),
    makePort("B", Go.Spot.Bottom, true, false)
  ))
*/

map.add('Picture',
  $(go.Node, "ViewBox", {
    resizable: true,
    resizeObjectName: 'PICTURE',
    contextMenu:
      $("ContextMenu",
        ContextMenus.moveUp,
        ContextMenus.moveDown,
        ContextMenus.remove,
        ContextMenus.setGroup
      ),
    cursor: 'move',
    toolTip: toolTips.shapeName,
    selectionAdornmentTemplate: selectionAdornment
  },
    new Go.Binding("zOrder"),
    $(go.Picture, {
      name: 'PICTURE',
      desiredSize: new go.Size(40, 40), imageStretch: go.GraphObject.UniformToFill,
      mouseEnter: function (e, port) {  // the PORT argument will be this Shape
        if (!e.diagram.isReadOnly) {
          port.part.findPort('T').fill = '#409EFF'
          port.part.findPort('L').fill = '#409EFF'
          port.part.findPort('R').fill = '#409EFF'
          port.part.findPort('B').fill = '#409EFF'
        }
      },
      mouseLeave: function (e, port) {
        //port.fill = "transparent";       
        port.part.findPort('T').fill = 'transparent'
        port.part.findPort('L').fill = 'transparent'
        port.part.findPort('R').fill = 'transparent'
        port.part.findPort('B').fill = 'transparent'
      }, click: function (e, port) {
        if (!e.diagram.isReadOnly) {
          port.part.findPort('T').fill = '#409EFF'
          port.part.findPort('L').fill = '#409EFF'
          port.part.findPort('R').fill = '#409EFF'
          port.part.findPort('B').fill = '#409EFF'
        }
      }
    },
      new Go.Binding("source")
    ),
    makePort("T", Go.Spot.Top, false, true),
    makePort("L", Go.Spot.Left, true, true),
    makePort("R", Go.Spot.Right, true, true),
    makePort("B", Go.Spot.Bottom, true, false)
  ))

/*
map.add('ColorCanvas',
  $(go.Node, "Spot",
    {
      locationSpot: go.Spot.Center,
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
      resizable: true,
      resizeObjectName: 'CONTAINER',
      resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
      rotatable: true,
      rotateAdornmentTemplate: nodeRotateAdornmentTemplate,
      cursor: 'move',
      toolTip: toolTips.shapeName,

      mouseEnter: function (e, node) { showSmallPorts(node, true); },
      mouseLeave: function (e, node) { showSmallPorts(node, false); }
    },
    new go.Binding("angle").makeTwoWay(),
    $(go.Panel, "Viewbox",
      {
        background: 'transparent',
        name: 'CONTAINER', width: 40, height: 40,
      },
      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
      $(go.Panel,
        {
          width: 1024,
          height: 1024,
          itemTemplate:
            $(go.Panel,
              $(go.Shape,
                new go.Binding("opacity"),
                new go.Binding("fill"),
                new go.Binding("geometryString")
              )
            )
        },
        new go.Binding("itemArray").makeTwoWay(),
        new go.Binding("opacity", "opacity", (opacity, part) => {
          part.itemArray.forEach(item => {
            item.opacity = opacity
          })
        }).makeTwoWay()
      )),

    makePort("T", go.Spot.Top, false, true),
    makePort("L", go.Spot.Left, true, true),
    makePort("R", go.Spot.Right, true, true),
    makePort("B", go.Spot.Bottom, true, false)
  ))
*/

/*
map.add('MonoCanvas',
  $(go.Node, "Spot",
    {
      shadowVisible: true,
      isShadowed: true, shadowOffset: new Go.Point(4, 4), shadowColor: 'red',
      locationSpot: go.Spot.Center,
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
      resizable: true,
      resizeObjectName: 'CONTAINER',
      resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
      rotatable: true,
      rotateAdornmentTemplate: nodeRotateAdornmentTemplate,
      cursor: 'move',
      toolTip: toolTips.shapeName,

      mouseEnter: function (e, node) { showSmallPorts(node, true); },
      mouseLeave: function (e, node) { showSmallPorts(node, false); }
    },
    new go.Binding("angle").makeTwoWay(),
    $(go.Panel, "Viewbox",
      {
        background: 'transparent',
        name: 'CONTAINER', width: 80, height: 80,
      },
      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
      $(go.Panel,
        {
          width: 1024,
          height: 1024,
          itemTemplate:
            $(go.Panel,
              $(go.Shape,
                ...makeEmptyBinding('strokeWidth', 'opacity', 'fill', 'geometryString', 'strokeDashArray', 'stroke')
              )
            )
        },
        new go.Binding("itemArray").makeTwoWay(),
        ...makeEmptyChildBinding('fill', 'opacity', 'opacity', 'strokeWidth', 'strokeDashArray', 'stroke')
      )),

    makePort("T", go.Spot.Top, false, true),
    makePort("L", go.Spot.Left, true, true),
    makePort("R", go.Spot.Right, true, true),
    makePort("B", go.Spot.Bottom, true, false)
  ))
*/



map.add('Shape',
  createNode($(go.Panel, 'Auto',
    {
      row: 1,
      column: 1,
      width: 80,
      height: 80,
      name: 'NODE',
      stretch: go.GraphObject.Fill,
      background: 'transparent',
    },
    $(Go.Shape, {
      fill: "#fff",
      cursor: 'move'
    }, ...makeEmptyBinding(false, 'figure')),
    $(go.TextBlock, { text: '', name: 'TEXT', verticalAlignment: go.Spot.Center, alignment: go.Spot.Center }, ...makeEmptyBinding('text', 'size'))
  ))
)


map.add('MonoCanvas',
  createNode(
    $(go.Panel, 'ViewBox',
      {
        name: 'NODE',
        row: 1,
        column: 1,
        width: 80,
        height: 80,
        stretch: go.GraphObject.Fill,
        background: 'transparent',
      },
      $(go.Panel,
        {
          width: 1024,
          height: 1024,
          itemTemplate:
            $(go.Panel,
              $(go.Shape,
                ...makeEmptyBinding(false, 'strokeWidth', 'opacity', 'fill', 'geometryString', 'strokeDashArray', 'stroke')
              )
            )
        },
        new go.Binding("itemArray").makeTwoWay(),
        ...makeEmptyChildBinding('fill', 'opacity', 'opacity', 'strokeWidth', 'strokeDashArray', 'stroke')
      )
    )
  )
)

map.add('ColorCanvas',
  createNode(
    $(go.Panel, 'ViewBox',
      {
        row: 1,
        column: 1,
        width: 80,
        height: 80,
        name: 'NODE',
        stretch: go.GraphObject.Fill,
        background: 'transparent',
      },
      $(go.Panel,
        {
          width: 1024,
          height: 1024,
          itemTemplate:
            $(go.Panel,
              $(go.Shape,
                ...makeEmptyBinding(false, 'strokeWidth', 'opacity', 'fill', 'geometryString', 'strokeDashArray', 'stroke')
              )
            )
        },
        new go.Binding("itemArray").makeTwoWay(),
        ...makeEmptyChildBinding('fill', 'opacity', 'opacity', 'strokeWidth', 'strokeDashArray', 'stroke')
      ))
  )
)


export {
  map,
  shapes
}