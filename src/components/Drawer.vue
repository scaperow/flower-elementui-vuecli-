<template>

  <el-container>
    <el-header height="60px"
               style="text-align:left">
      <el-button type="text"
                 icon="fa fa-save"
                 @click="save">保存</el-button>
      <el-dropdown @command="handleExport">
        <el-button type="text"
                   icon="fa fa-download">导出</el-button>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="JSON">JSON 格式(可以导入)</el-dropdown-item>
          <el-dropdown-item command="PDF">PDF 文件(打印格式)</el-dropdown-item>
          <el-dropdown-item command="PNG">PNG 文件(图片格式)</el-dropdown-item>
          <el-dropdown-item command="SVG">SVG 文件(高清图片格式)</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown @command="handleImport">
        <el-button type="text"
                   icon="fa fa-upload">导入</el-button>
        <input type="file"
               ref="importFile"
               style="display:none"
               @change="handleSelectFile" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="JSON">JSON 文件</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button type="text"
                 icon="fa fa-share-alt">分享</el-button>
      <el-divider direction="vertical"></el-divider>
      <el-button type="text"
                 icon="fa fa-undo"
                 title=""
                 :disabled="!drawStatus.canUndo"
                 @click="undo">撤销</el-button>
      <el-button type="text"
                 icon="fa fa-undo fa-flip-horizontal"
                 title=""
                 :disabled="!drawStatus.canRedo"
                 @click="redo">重做</el-button>
      <el-button type="text"
                 icon=" fa fa-copy"
                 @click="copy"
                 :disabled="!drawStatus.isSelection">复制</el-button>
      <el-button type="text"
                 icon=" fa fa-cut"
                 @click="cut"
                 :disabled="!drawStatus.isSelection">剪切</el-button>
      <el-button type="text"
                 icon=" fa fa-paste"
                 @click="paste"
                 :disabled="!drawStatus.isPaste">粘贴</el-button>
      <el-button type="text"
                 @click="copy"
                 icon="fa fa-paint-brush">复制
      </el-button>
      <el-button type="text"
                 @click="merge"
                 icon="fa fa-object-group"
                 v-show="drawStatus.canGroup">合并</el-button>
      <el-button type="text"
                 @click="merge"
                 icon="fa fa-object-group"
                 v-show="drawStatus.canUngroup">拆分</el-button>
      <el-popover>
        <div style="width:300px">
          <el-slider :min="1"
                     :max="200"
                     :step="10"
                     @change="handleZoom"
                     v-model="zoomScale"
                     :show-input="true"
                     :format-tooltip="(val)=>parseInt(val/2) + '%'"></el-slider>
        </div>

        <div style="text-align:right">
          <el-button type="text"
                     v-show="zoomScale !== 100"
                     @click="zoomScale = 100">重置</el-button>
        </div>

        <el-button slot="reference"
                   type="text"
                   @click="merge"
                   icon="fa fa-eye">缩放</el-button>
      </el-popover>
      <transition name="el-fade-in">
        <label v-show="statusMessage">
          {{statusMessage}}
        </label>
      </transition>

    </el-header>

    <el-container>
      <el-aside>
        <shape-bar></shape-bar>
      </el-aside>
      <el-main ref="canvas"
               id="drawer"
               @mouseout.native="hideIndicators"
               @mouseover.native="showIndicators"
               :style="{background:setting.root.background}"
               style="width:800px;height:100%">加载中 ...</el-main>

      <el-aside>
        <setting-bar></setting-bar>
      </el-aside>

    </el-container>
    <el-footer>
      <el-row>
        <el-col>
          <el-popover>
            <ul class="shortcut">
              <li>
                <el-tag>Ctrl-X & Shift-Del</el-tag> invoke cutSelection
              </li>
              <li>
                <el-tag>Ctrl-C & Ctrl-Insert</el-tag> invoke copySelection
              </li>
              <li>
                <el-tag>Ctrl-V & Shift-Insert</el-tag> invoke pasteSelection
              </li>
              <li>
                <el-tag>Del & Backspace</el-tag> invoke deleteSelection
              </li>
              <li>
                <el-tag>Ctrl-A</el-tag> invokes selectAll
              </li>
              <li>
                <el-tag>Ctrl-Z & Alt-Backspace</el-tag> invoke undo
              </li>
              <li>
                <el-tag>Ctrl-Y & Alt-Shift-Backspace</el-tag> invoke redo
              </li>
              <li>
                <el-tag>Up & Down & Left & Right (arrow keys)</el-tag> call Diagram.scroll
              </li>
              <li>
                <el-tag>PageUp & PageDown</el-tag> call Diagram.scroll
              </li>
              <li>
                <el-tag>Home & End</el-tag> call Diagram.scroll
              </li>
              <li>
                <el-tag>Space</el-tag> invokes scrollToPart
              </li>
              <li>
                <el-tag>Ctrl-- & Keypad-- (minus)</el-tag> invoke decreaseZoom
              </li>
              <li>
                <el-tag>Ctrl-+ & Keypad-+ (plus)</el-tag> invoke increaseZoom
              </li>
              <li>
                <el-tag>Ctrl-0</el-tag> invokes resetZoom
              </li>
              <li>
                <el-tag>Shift-Z</el-tag> invokes zoomToFit; repeat to return to the original scale and position
              </li>
              <li>
                <el-tag>Ctrl-G</el-tag> invokes groupSelection
              </li>
              <li>
                <el-tag>Ctrl-Shift-G</el-tag> invokes ungroupSelection
              </li>
              <li>
                <el-tag>F2</el-tag> invokes editTextBlock
              </li>
              <li>
                <el-tag>Menu Key</el-tag> invokes showContextMenu
              </li>
              <li>
                <el-tag>Esc</el-tag> invokes stopCommand
              </li>
            </ul>
            <el-button round
                       type="text"
                       slot="reference">快捷键 <i class="fa fa-caret-up"></i></el-button>
          </el-popover>
        </el-col>
      </el-row>
    </el-footer>
  </el-container>

</template>

<script>
import Go, { Picture } from 'gojs'
import ResizeTool from './ResizeTool'
import { map, contextMenus, groupTemplate } from './Shapes.js'
import ShapeBar from './ShapeBar'
import FileSaver from 'file-saver'
import SettingBar from './SettingBar'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import GuidedDraggingTool from '@/ext/GuidedDraggingTool.js'

const { GraphObject } = Go
const { make: $ } = GraphObject
let delayClearStaus = null
let $canvas = null
function showLinkLabel (e) {
  var label = e.subject.findObject("LABEL");
  if (label !== null) label.visible = (e.subject.fromNode.data.category === "Conditional");
}



let gradScaleHoriz =
  $(go.Node, "Graduated",
    {
      selectable: false,
      graduatedTickUnit: 10, pickable: false, layerName: "Foreground",
      isInDocumentBounds: false, isAnimated: false
    },
    $(go.Shape, { geometryString: "M0 0 H1920" }),
    $(go.Shape, { geometryString: "M0 0 V3", interval: 1 }),
    $(go.Shape, { geometryString: "M0 0 V15", interval: 5 }),
    $(go.TextBlock,
      {

        font: "10px sans-serif",
        interval: 5,
        alignmentFocus: go.Spot.TopLeft,
        segmentOffset: new go.Point(0, 7)
      }
    )
  );

let gradScaleVert =
  $(go.Node, "Graduated",
    {
      selectable: false,
      graduatedTickUnit: 10, pickable: false, layerName: "Foreground",
      isInDocumentBounds: false, isAnimated: false
    },
    $(go.Shape, { geometryString: "M0 0 V1080" }),
    $(go.Shape, { geometryString: "M0 0 V3", interval: 1, alignmentFocus: go.Spot.Bottom }),
    $(go.Shape, { geometryString: "M0 0 V15", interval: 5, alignmentFocus: go.Spot.Bottom }),
    $(go.TextBlock,
      {
        font: "10px sans-serif",
        segmentOrientation: go.Link.OrientOpposite,
        interval: 5,
        alignmentFocus: go.Spot.BottomLeft,
        segmentOffset: new go.Point(0, -7)
      }
    )
  );


// These indicators are globally defined so they can be accessed by the div's mouseevents
let gradIndicatorHoriz =
  $(go.Node,
    {      selectable: false,
      pickable: false, layerName: "Foreground", visible: false,
      isInDocumentBounds: false, isAnimated: false,
      locationSpot: go.Spot.Top
    },
    $(go.Shape, { geometryString: "M0 0 V15", strokeWidth: 2, stroke: "red" })
  );

let gradIndicatorVert =
  $(go.Node,
    {      selectable: false,
      pickable: false, layerName: "Foreground", visible: false,
      isInDocumentBounds: false, isAnimated: false,
      locationSpot: go.Spot.Left
    },
    $(go.Shape, { geometryString: "M0 0 H15", strokeWidth: 2, stroke: "red" })
  );

let grid = $(go.Panel, "Grid",
  {
    name: "GRID",
    visible: true,
    gridCellSize: new go.Size(10, 10),
    gridOrigin: new go.Point(0, 0)
  },
  $(go.Shape, "LineH", { strokeWidth: 0.2, interval: 1 }),
  $(go.Shape, "LineH", { strokeWidth: 0.8, interval: 10 }),
  $(go.Shape, "LineV", { strokeWidth: 0.2, interval: 1 }),
  $(go.Shape, "LineV", { strokeWidth: 0.8, interval: 10 })
);


function setupScalesAndIndicators () {
  var vb = $canvas.viewportBounds;
  $canvas.startTransaction("add scales");
  updateScales();
  // Add each node to the diagram
  $canvas.add(gradScaleHoriz);
  $canvas.add(gradScaleVert);
  $canvas.add(gradIndicatorHoriz);
  $canvas.add(gradIndicatorVert);
  $canvas.commitTransaction("add scales");
}

function unsetupScalesAndIndicators () {
  var vb = $canvas.viewportBounds;
  $canvas.startTransaction("remove scales");
  updateScales();
  // Add each node to the diagram
  $canvas.remove(gradScaleHoriz);
  $canvas.remove(gradScaleVert);
  $canvas.remove(gradIndicatorHoriz);
  $canvas.remove(gradIndicatorVert);
  $canvas.commitTransaction("remove scales");
}

function updateScales () {
  var vb = $canvas.viewportBounds;
  $canvas.startTransaction("update scales");
  // Update properties of horizontal scale to reflect viewport
  gradScaleHoriz.location = new go.Point(vb.x, vb.y);
  gradScaleHoriz.graduatedMin = vb.x;
  gradScaleHoriz.graduatedMax = vb.right;
  gradScaleHoriz.scale = 1 / $canvas.scale;
  // Update properties of vertical scale to reflect viewport
  gradScaleVert.location = new go.Point(vb.x, vb.y);
  gradScaleVert.graduatedMin = vb.y;
  gradScaleVert.graduatedMax = vb.bottom;
  gradScaleVert.scale = 1 / $canvas.scale;
  $canvas.commitTransaction("update scales");
}

function updateIndicators () {
  var vb = $canvas.viewportBounds;
  var mouseCoords = $canvas.lastInput.documentPoint;
  $canvas.startTransaction("update indicators");
  // Keep the indicators in line with the mouse as viewport changes or mouse moves
  gradIndicatorHoriz.location = new go.Point(Math.max(mouseCoords.x, vb.x), vb.y);
  gradIndicatorHoriz.scale = 1 / $canvas.scale;
  gradIndicatorVert.location = new go.Point(vb.x, Math.max(mouseCoords.y, vb.y));
  gradIndicatorVert.scale = 1 / $canvas.scale;
  $canvas.commitTransaction("update indicators");
}





export default {
  computed: {
    ...mapGetters({
      setting: 'drawing/setting',
    })
  },
  data () {
    return {
      zoomScale: 100,
      drawStatus: {

      },
      statusMessage: '',
    }
  },
  components: {
    ShapeBar, SettingBar
  },
  watch: {
    statusMessage (val) {
      if (!_.isEmpty(val)) {
        delayClearStaus()
      }
    },
    setting: {
      handler ({ root }) {
        grid.visible = root.showMesh
        grid.elements.each((element) => {
          element.stroke = root.meshColor
        })

        gradScaleHoriz.elements.each(element => element.stroke = root.ruleColor)
        gradScaleVert.elements.each(element => element.stroke = root.ruleColor)
        // grid.findObject('LineH').stroke = root.meshColor
        // grid.findObject('LineV').stroke = root.meshColor

        // grid.findObject('LINE').strokeColor = root.meshColor
        // grid.findObject('LINE').strokeColor = root.meshColor

        if (root.showRule) {
          setupScalesAndIndicators()
        } else {
          unsetupScalesAndIndicators()
        }
      },
      deep: true
    }
  },
  methods: {
    async save () {
      this.statusMessage = '已保存'
    },
    handleZoom (scale) {
      //$canvas.commandHandler.resetZoom(scale / 100)
    },
    setStatus (statusName, value) {
      Vue.set(this.drawStatus, statusName, value)
    },
    undo () {
      $canvas.commandHandler.undo()
    },
    redo () {
      $canvas.commandHandler.redo()
    },
    copy () {
      $canvas.commandHandler.copyToClipboard()
    },
    paste () {
      $canvas.commandHandler.pasteFromClipboard()
    },
    cut () {
      $canvas.commandHandler.cutSelection()
    },
    merge () {

    },
    resetZoom () {
      $canvas.commandHandler.resetZoom()
    },
    handleImport () {
      this.$refs.importFile.click()
    },
    handleSelectFile () {
      var filePath = this.$refs.importFile.value

      if (filePath) {
        var reader = new FileReader()
        reader.onload = () => {
          var text = reader.result

          try {

            $canvas.model = Go.Model.fromJson(JSON.parse(text))
            this.$refs.importFile.value = null
            this.$notify.success('导入成功')
          } catch (error) {
            this.$refs.importFile.value = null
            this.$message.error('文件内容错误, 无法导入')
          }
        }

        reader.onerror = ((error) => {
          this.$message.error('读取文件时发生错误')
          this.$refs.importFile.value = null
          throw error

        })

        reader.onabort = (() => {
          this.$refs.importFile.value = null
          this.$message.error('导入被中止')
        })

        reader.readAsText(this.$refs.importFile.files[0]);
      }
    },
    handleExport (arg) {
      //console.log(arg)
      const fileName = `drawer.${arg}`
      switch (arg) {
        case 'PNG':
          $canvas.makeImageData({
            scale: 1,
            type: 'image/png',
            returnType: 'blob',
            callback (imageData) {
              FileSaver.saveAs(imageData, fileName)
            }
          });

          break;

        case 'JSON':
          const jsonData = JSON.stringify($canvas.model)
          const file = new File([jsonData], fileName, { type: "text/plain;charset=utf-8" });
          FileSaver.saveAs(file)

          break;
      }
    },
    // Show indicators on mouseover of the diagram div
    showIndicators () {
      $canvas.startTransaction("show indicators");
      gradIndicatorHoriz.visible = true;
      gradIndicatorVert.visible = true;
      $canvas.commitTransaction("show indicators");
    },

    // Hide indicators on mouseout of the diagram div
    hideIndicators () {
      $canvas.startTransaction("hide indicators");
      gradIndicatorHoriz.visible = false;
      gradIndicatorVert.visible = false;
      $canvas.commitTransaction("hide indicators");
    }
  },
  async created () {
    delayClearStaus = _.debounce(() => {
      this.statusMessage = null
    }, 3000)

  },
  mounted () {

    var linkSelectionAdornmentTemplate =
      $(go.Adornment, "Link",
        $(go.Shape,
          // isPanelMain declares that this Shape shares the Link.geometry
          { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 })
      );

    $canvas =
      $(Go.Diagram, "drawer",  // must name or refer to the DIV HTML element
        {

          grid: grid,
          minScale: 0.01,
          maxScale: 100,
          linkTemplate: $(go.Link,  // the whole link panel
            { selectable: true, selectionAdornmentTemplate: linkSelectionAdornmentTemplate },
            { relinkableFrom: true, relinkableTo: true, reshapable: true },
            {
              routing: go.Link.AvoidsNodes,
              curve: go.Link.JumpOver,
              corner: 5,
              toShortLength: 4
            },
            new go.Binding("points").makeTwoWay(),
            $(go.Shape,  // the link path shape
              { isPanelMain: true, strokeWidth: 2 }),
            $(go.Shape,  // the arrowhead
              { toArrow: "Standard", stroke: null }),
            $(go.Panel, "Auto",
              new go.Binding("visible", "isSelected").ofObject(),
              $(go.Shape, "RoundedRectangle",  // the link shape
                { fill: "#F8F8F8", stroke: null }),
              $(go.TextBlock,
                {
                  textAlign: "center",
                  font: "10pt helvetica, arial, sans-serif",
                  stroke: "#919191",
                  margin: 2,
                  minSize: new go.Size(10, NaN),
                  editable: true
                },
                new go.Binding("text").makeTwoWay())
            )
          ),
          groupTemplate: $(Go.Group, "Spot",
            {
              selectionAdornmentTemplate: // adornment when a group is selected
                $(go.Adornment, "Auto",
                  $(go.Shape, "RoundedRectangle",
                    { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
                  $(go.Placeholder)
                ),
              toSpot: go.Spot.AllSides, // links coming into groups at any side
              toEndSegmentLength: 30, fromEndSegmentLength: 30
            },
            $(go.Panel, "Auto", {
              name: 'PANEL'
            },
              $(go.Shape, "RoundedRectangle",
                {
                  name: "OBJSHAPE",
                  stroke: '#f0f0f0',
                  fill: '#f3f3f3',
                  opacity: 0.4
                }),
              $(go.Placeholder,
                { padding: 16 })
            ),
            $(go.TextBlock,
              {
                name: "GROUPTEXT",
                alignment: go.Spot.TopLeft,
                alignmentFocus: new go.Spot(0, 0, -4, -4)
              },
              new go.Binding("text", "key"))
          ),
          nodeTemplateMap: map,

          resizingTool: new ResizeTool(),
          "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
          "LinkRelinked": showLinkLabel,
          "undoManager.isEnabled": true,  // enable undo & redo
          draggingTool: new GuidedDraggingTool(),
          "draggingTool.dragsLink": true,
          "draggingTool.isGridSnapEnabled": true,
          "draggingTool.horizontalGuidelineColor": "blue",
          "draggingTool.verticalGuidelineColor": "blue",
          "draggingTool.centerGuidelineColor": "green",
          "draggingTool.guidelineWidth": 1,
          "linkingTool.isUnconnectedLinkValid": true,
          "linkingTool.portGravity": 20,
          "relinkingTool.isUnconnectedLinkValid": true,
          "relinkingTool.portGravity": 20,
          "relinkingTool.fromHandleArchetype":
            $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "deepskyblue" }),
          "relinkingTool.toHandleArchetype":
            $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
          "linkReshapingTool.handleArchetype":
            $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
          "rotatingTool.handleAngle": 270,
          "rotatingTool.handleDistance": 30,
          "rotatingTool.snapAngleMultiple": 15,
          "rotatingTool.snapAngleEpsilon": 15,
          "undoManager.isEnabled": true,
        });


    /*
    $canvas.nodeTemplateMap.add('Picture', $(go.Part, { resizable: true, resizeObjectName: "PICTURE" },
      $(go.Picture, {
        name: 'PICTURE', width: 40, height: 40, imageStretch: go.GraphObject.UniformToFill,
        contextMenu: {
          ...contextMenus.moveDown
        }
      }, new Go.Binding('source', 'source').makeTwoWay())
    ))
    */

    $canvas.toolManager.resizingTool.handleArchetype = $(go.Shape, "Rectangle",
      {        width: 10, height: 10, stroke: null,
        opacity: 0.8, fill: "#409eff", stroke: '#333', mouseEnter: (e, p) => {
          if (!p.cursor) {
            const { alignment: align } = p
            if (align === Go.Spot.TopLeft) {
              p.cursor = 'nw-resize'
            } else if (align === Go.Spot.TopCenter) {
              p.cursor = 'n-resize'
            } else if (align === Go.Spot.TopRight) {
              p.cursor = 'ne-resize'
            } else if (align === Go.Spot.RightCenter) {
              p.cursor = 'e-resize'
            } else if (align === Go.Spot.BottomRight) {
              p.cursor = 'se-resize'
            } else if (align === Go.Spot.BottomCenter) {
              p.cursor = 's-resize'
            } else if (align === Go.Spot.BottomLeft) {
              p.cursor = 'sw-resize'
            } else if (align === Go.Spot.LeftCenter) {
              p.cursor = 'w-resize'
            }
          }
        }
      }, new Go.Binding('cursor'))
    $canvas.model = go.Model.fromJson({
      "class": "go.GraphLinksModel",
      "linkFromPortIdProperty": "fromPort",
      "linkToPortIdProperty": "toPort",
    });

    /*
        $canvas.undoManager.handleChanged(event => {
        })
        */

    const onDiagramChange = (event) => {

      switch (event.name) {
        case 'ChangedSelection':
          this.$store.dispatch('drawing/setSelection', $canvas.selection)

          this.setStatus('isSelection', event.diagram.selection.count > 0)
          //console.log(event.diagram.selection)
          var groups = event.diagram.selection.filter((item) => {
            //console.log(_.has(item.data, 'group'))
            var nodeData = event.diagram.model.findNodeDataForKey(item.key)
            return _.has(nodeData, 'group')
          })

          this.setStatus('canGroup', groups.count < 1 && event.diagram.selection.count > 1)
          this.setStatus('canUngroup', groups.count > 0 && event.diagram.selection.count > 0)

          break;

        case 'ClipboardChanged':
          this.setStatus('isPaste', event.subject.length > 0)
          break;

        // case 'ViewportBoundsChanged':
        //   //this.setStatus('isResetZoom', event.diagram.commandHandler.canResetZoom)
        //   // this.zoomScale = event.diagram.scale
        //   break;

        case 'SelectionGrouped':
          this.setStatus('canGroup', true)
          this.setStatus('canUngroup', false)
          break;

        case 'SelectionUngrouped':
          this.setStatus('canGroup', false)
          this.setStatus('canUngroup', true)
          break;

        default:
          break;
      }
    }

    $canvas.addDiagramListener('ChangedSelection', onDiagramChange)
    $canvas.addDiagramListener('ClipboardChanged', onDiagramChange)
    $canvas.addDiagramListener('SelectionGrouped', onDiagramChange)
    $canvas.addDiagramListener('SelectionUngrouped', onDiagramChange)
    $canvas.addDiagramListener("InitialLayoutCompleted", setupScalesAndIndicators);
    $canvas.addDiagramListener("ViewportBoundsChanged", updateScales);
    $canvas.addDiagramListener("ViewportBoundsChanged", updateIndicators);

    $canvas.addModelChangedListener((event) => {
      //console.log(JSON.stringify($canvas.model))

      if (event.isTransactionFinished) {
        //this.save()

        //this.drawStatus.canRedo = $canvas.commandHandler.canRedo()
        //this.drawStatus.canUndo = $canvas.commandHandler.canUndo()
      }
    })

    $canvas.toolManager.doMouseMove = function () {
      go.ToolManager.prototype.doMouseMove.call(this);
      updateIndicators();
    }
    $canvas.toolManager.linkingTool.doMouseMove = function () {
      go.LinkingTool.prototype.doMouseMove.call(this);
      updateIndicators();
    }
    $canvas.toolManager.draggingTool.doMouseMove = function () {
      go.DraggingTool.prototype.doMouseMove.call(this);
      updateIndicators();
    }
    $canvas.toolManager.dragSelectingTool.doMouseMove = function () {
      go.DragSelectingTool.prototype.doMouseMove.call(this);
      updateIndicators();
    }

    this.$store.dispatch('drawing/setCanvas', $canvas)



  }
}
</script>
<style lang="scss" >
.el-aside {
  overflow: hidden;
  border-right: 1px solid #ebeef5;
}
.el-footer {
  border-top: 1px solid #ebeef5;
}
.el-main {
  background: #f3f3f3;
}
.el-header {
  z-index: 10;
  background: #409eff;
  color: #fff;
  margin: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  transition: all 0.3s;

  .el-button {
    color: #fff;
    margin-left: 0;
    margin-right: 6px;
    padding-left: 3px;
    padding-right: 3px;
    color: "#999";
    font-size: 12px;
    transition: all 0.3s;

    i {
      font-size: 18px;
      color: #fff;
      transition: all 0.3s;
    }

    span {
      display: block;
      margin-top: 6px;
    }

    &:disabled {
      color: #eee3;
      i {
        color: #eee3;
      }
    }

    &:not(:disabled):hover {
      background: #fff3;
      border-radius: 0;
    }
  }
}
ul.shortcut {
  list-style-type: none;
  padding: 0;
  margin: 0;
  li {
    margin-bottom: 6px;
  }
}

#drawer {
  background: #fff;
  margin: 12px;
}
</style>
