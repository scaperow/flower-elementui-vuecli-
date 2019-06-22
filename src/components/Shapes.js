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
  $(go.Adornment, "Auto",
    $(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
    $(go.Placeholder)
  )

let nodeRotateAdornmentTemplate =
  $(go.Adornment,
    { locationSpot: go.Spot.Center, locationObjectName: "CIRCLE", cursor: '' },
    $(go.Shape, "Circle", { name: "CIRCLE", cursor: "pointer", desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
    // $(go.Shape, { geometryString: "M3.5 7 L3.5 30", isGeometryPositioned: true, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] })
  );

let nodeResizeAdornmentTemplate =
  $(go.Adornment, "Spot",
    { locationSpot: go.Spot.Right },
    $(go.Placeholder),
    $(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

    $(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

    $(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
    $(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" })
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
 * @param {*} part 
 * @param {*} eventName 
 * @param {*} handler 
 */
const removeListener = function (key, eventName, handler) {
  _.pull((eventListeners, `${key}.${eventName}.listeners`) || [], handler)
}

/**
 * 
 * @param {String} layout 
 * @returns {GraphObject} container
 */
const createNode = function (node) {
  let options = {
    locationSpot: 'Table',
    selectable: true,
    selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
    resizable: true,
    resizeObjectName: 'NODE',
    resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
    rotatable: true,
    rotateAdornmentTemplate: nodeRotateAdornmentTemplate,
    cursor: 'move',
    toolTip: toolTips.shapeName
  }

  let container = $(go.Node, 'Table', options)

  if (ports.length > 0) {
    _.each(ports, (port) => {

    })

    createListener(options, 'CONTAINER', 'mouseEnter', (e, node) => {
      showSmallPorts(node, true)
    })

    createListener(options, 'CONTAINER', 'mouseEnter', (e, node) => {
      showSmallPorts(node, false)
    })
  }

  return container
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

map.add('MonoCanvas1',
  createContainer($(Go.Panel, "Auto",
    $(Go.Shape, {
      fill: "#fff",
      cursor: 'move'
    },
      ...makeEmptyBinding(false, 'stroke', 'figure', 'strokeWidth', 'opacity', 'fill'))
  ))
)

export {
  map,
  shapes
}