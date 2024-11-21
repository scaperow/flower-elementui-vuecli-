<template>
  <section class="tool-bar">
    <el-header class="map-header"
               height="60px">
      <!-- <button icon="fa fa-save"
            :disabled="!canSave"
            @click="save">保存</button> -->
      <!-- <el-dropdown @command="handleImport">
      <button v-show="allowAction('')"
              icon="fa fa-upload">导入</button>
      <input type="file"
             ref="importFile"
             style="display:none"
             @change="handleSelectFile" />
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="JSON">JSON 文件</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown> -->
      <div v-if="map">
        <button :disabled="!canUndo"
                v-if="allowUndo"
                @click="()=>commander.undo()">撤销</button>
        <button :disabled="!canRedo"
                v-if="allowRedo"
                @click="()=>commander.redo()">重做</button>
        <button @click="()=>commander.copySelection()"
                v-if="allowCopy"
                :disabled="!canCopy">复制</button>
        <button @click="()=>commander.cutSelection()"
                v-if="allowCut"
                :disabled="!canCut">剪切</button>
        <button @click="()=>commander.pasteSelection()"
                :disabled="!canPaste"
                v-if="allowPaste">粘贴</button>
        <!-- <button icon=" fa fa-paste"
              @click="()=>commander.pasteSelection()"
              v-if="allowCeiling">上移</button>
      <button icon=" fa fa-paste"
              @click="()=>commander.pasteSelection()"
              v-if="allowFloor">下移</button> -->
        <button @click="()=>commander.groupSelection()"
                v-if="allowMerge"
                :disabled="!canMerge">组合</button>
        <button @click="()=>commander.ungroupSelection()"
                :disabled="!canSplit"
                v-if="allowSplit">拆解</button>
        <button @click="()=>commander.ungroupSelection()"
                :disabled="!canSplit"
                v-if="allowSplit">锁定</button>
        <button @click="()=>commander.canCollapseTree()"
                :disabled="!canCollapseTree"
                v-if="allowCollapse">展开</button>
        <button @click="()=>commander.expandTree()"
                :disabled="!canExpandTree"
                v-if="allowExpand">折叠</button>
        <el-popover>
          <div style="width:300px">
            <el-slider :min="-200"
                       :max="200"
                       :step="10"
                       @change="handleZoom"
                       v-model="zoomScale"
                       :format-tooltip="(val)=>parseInt(val/2) + '%'"></el-slider>
            <div class="text-right">
              <button class="text"
                      v-show="zoomScale !== 100"
                      @click="zoomScale = 100">重置</button>
            </div>
          </div>

          <button slot="reference"
                  :disabled="!commander.canResetZoom"
                  v-if="allowAction('zoom')">缩放</button>
        </el-popover>
      </div>
    </el-header>
  </section>
</template>

<script>
import Go from 'gojs'
import { mapGetters } from 'vuex'
import { TemplateMaker } from '@/map'
import ShapeBar from './ShapeBar'
import FileSaver from 'file-saver'
import Vue from 'vue'
import Parse from 'parse'
import _ from 'lodash'


let WorksClass = Parse.Object.extend('works')

export default {
  computed: {
    ...mapGetters({
      map: 'drawing/map',
      mapData: 'drawing/mapData'
    }),
    commander () {
      return _.get(this.map, 'canvas.commandHandler') || null
    },
    actionList () {
      return _.get(this.map, 'allowActions') || null
    }
  },
  props: {

  },
  data () {
    return {
      allowRedo: false,
      allowUndo: false,
      allowCopy: false,
      allowCut: false,
      allowPaste: false,
      allowMerge: false,
      allowSplit: false,
      allowCeiling: false,
      allowFloor: false,
      allowCollapse: false,
      allowExpand: false,

      canRedo: false,
      canUndo: false,
      canCopy: false,
      canCut: false,
      canPaste: false,
      canMerge: false,
      canSplit: false,
      canCeiling: false,
      canFloor: false,
      canCollapse: false,
      canExpand: false,

      zoomScale: 100,
    }
  },
  watch: {
    map (map) {
      if (map) {
        map.addMapListener('ChangedSelection', this.listener)
        map.canvas.addDiagramListener('Modified', this.listener)
        map.canvas.addDiagramListener('SelectionGrouped', this.listener)
        map.canvas.addDiagramListener('ClipboardChanged', this.listener)
        map.canvas.addDiagramListener('ClipboardPasted', this.listener)

        this.setAllowAction()
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
    listener (event) {
      if (event.name === 'SelectionGrouped') {
        if (event.subject instanceof go.Group) {
          var counter = 1
          this.map.canvas.nodes.each((node) => {
            if (node instanceof go.Group) {
              counter++
            }
          })


          event.subject.data.text = '分组'
          event.subject.updateTargetBindings()
          //this.map.canvas.model.setKeyForNodeData(event.subject.data, `分组${counter}`)
        }
      }


      this.setActionStatus(event.name)
    },
    handleZoom () {

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
            this.canvas.model = Go.Model.fromJson(JSON.parse(text))
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
    allowAction (actionName) {
    },
    canAction (actionName) {

    },
    setAllowAction () {
      this.allowRedo = _.includes(this.actionList, 'redo')
      this.allowUndo = _.includes(this.actionList, 'redo')
      this.allowCopy = _.includes(this.actionList, 'redo')
      this.allowCut = _.includes(this.actionList, 'redo')
      this.allowPaste = _.includes(this.actionList, 'redo')
      this.allowMerge = _.includes(this.actionList, 'redo')
      this.allowSplit = _.includes(this.actionList, 'redo')
      this.allowCeiling = _.includes(this.actionList, 'redo')
      this.allowFloor = _.includes(this.actionList, 'redo')
      this.allowCollapse = _.includes(this.actionList, 'collapse')
      this.allowExpand = _.includes(this.actionList, 'expand')
    },
    setActionStatus (eventName) {
      switch (eventName) {

        default:
          this.canCopy = this.commander.canCopySelection()
          this.canCut = this.commander.canCutSelection()
          this.canPaste = this.commander.canPasteSelection()
          this.canUndo = this.commander.canUndo()
          this.canRedo = this.commander.canRedo()
          this.canMerge = this.commander.canGroupSelection()
          this.canSplit = this.commander.canUngroupSelection()
          this.canCollapse = this.commander.canCollapseTree()
          this.canExpand = this.commander.canExpandTree()
      }
    }
  }
}
</script>
<style lang="scss" >
@import "@/style/variables.scss";

section.tool-bar {
  .map-header {
    height: 60px;
    line-height: 60px;
    z-index: 10;
    background: #fcfcf9;
    color: #333;
    margin: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    transition: all 0.3s;
    border-bottom: solid 1px #ebeef5;

    button {
      font-size: 14px;
      padding: 6px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #333;
      transition: all 0.3s;

      i {
        font-size: 18px;
        color: #333;
        transition: all 0.3s;
      }

      span {
        display: block;
        margin-top: 6px;
      }

      &:disabled {
        color: #ccc;
        cursor: not-allowed;

        i {
          color: #ccc;
        }
      }

      &:not(:disabled):hover {
        color: $--color-primary;
      }
    }
  }
}
</style>
