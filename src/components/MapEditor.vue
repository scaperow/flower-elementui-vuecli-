<template>
  <section class="map-editor">
    <div class="header-bar">
      <router-link :to="{path:'/',replace:true}">
        <h2 class="logo"
            style="display:inline-block">
        </h2>
      </router-link>
      <el-input @change="onNameChange"
                v-model="fileName"
                :style="{width:`${fileName.length * 20 + 24 }px`}"></el-input>
      <!-- <div class="message">
        <i class="iconfont icon-check"></i>
        <label>自动保存所有内容</label>
      </div> -->

      <div class="menu"
           v-show="!history">
        <div class="buttons">
          <el-tooltip content="分享">
            <span @click="share">
              <i class="iconfont icon-share"></i>
            </span>
          </el-tooltip>

          <el-dropdown @command="exportDocument">
            <el-tooltip content="导出">
              <span>
                <i class="iconfont icon-export"></i>
              </span>
            </el-tooltip>
            <el-dropdown-menu slot="dropdown">
              <!-- <el-dropdown-item command="JSON">JSON 格式(可以导入)</el-dropdown-item> -->
              <el-dropdown-item command="PDF">PDF 文件(打印格式)</el-dropdown-item>
              <el-dropdown-item command="PNG">PNG 文件(图片格式)</el-dropdown-item>
              <el-dropdown-item command="SVG">SVG 文件(高清图片格式)</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-tooltip content="快捷键">
            <el-popover>
              <ul class="shortcut">
                <li>
                  <el-tag>Tab</el-tag> 插入子主题
                </li>
                <li>
                  <el-tag>Enter</el-tag> 插入同级别主题
                </li>
                <li>
                  <el-tag>Shift-Tab</el-tag> 插入父级主题
                </li>
                <li>
                  <el-tag>Ctrl- ←</el-tag> 折叠子主题
                </li>
                <li>
                  <el-tag>Ctrl- →</el-tag> 展开子主题
                </li>
                <li>
                  <el-tag>Ctrl-Enter</el-tag> 编辑主题文本
                </li>

                <li>
                  <el-tag>Ctrl-X & Shift-Del</el-tag> 剪切选中
                </li>
                <li>
                  <el-tag>Ctrl-C & Ctrl-Insert</el-tag> 复制
                </li>
                <li>
                  <el-tag>Ctrl-V & Shift-Insert</el-tag> 粘贴
                </li>
                <li>
                  <el-tag>Del & Backspace</el-tag> 删除选中
                </li>
                <li>
                  <el-tag>Ctrl-A</el-tag> 选中所有
                </li>
                <li>
                  <el-tag>Ctrl-Z & Alt-Backspace</el-tag> 撤销
                </li>
                <li>
                  <el-tag>Ctrl-Y & Alt-Shift-Backspace</el-tag> 重做
                </li>
                <li>
                  <el-tag>↑ & ↓ & ← & →</el-tag> 选中相邻方向的图形
                </li>
                <li>
                  <el-tag>PageUp & PageDown</el-tag> 滚动视图
                </li>
                <li>
                  <el-tag>Home & End</el-tag> 滚动视图
                </li>
                <li>
                  <el-tag>Space</el-tag> invokes scrollToPart
                </li>
                <li>
                  <el-tag>Ctrl-- & Keypad-- (minus)</el-tag> 缩小视图
                </li>
                <li>
                  <el-tag>Ctrl-+ & Keypad-+ (plus)</el-tag> 放大视图
                </li>
                <li>
                  <el-tag>Ctrl-0</el-tag> 重置缩放
                </li>
                <li>
                  <el-tag>Shift-Z</el-tag>缩放到视图大小或恢复缩放
                </li>
                <li>
                  <el-tag>Ctrl-G</el-tag> 合并所选内容
                </li>
                <li>
                  <el-tag>Ctrl-Shift-G</el-tag> 取消合并所选内容
                </li>
                <li>
                  <el-tag>F2</el-tag> 编辑文字
                </li>
                <li>
                  <el-tag>Menu Key</el-tag> 显示右键菜单
                </li>
                <li>
                  <el-tag>Esc</el-tag> 取消正在执行的命令
                </li>
              </ul>
              <span slot="reference">
                <i class="iconfont icon-share"></i>
              </span>

            </el-popover>
          </el-tooltip>

        </div>
        <div>
          <user-avatar style="width:40px;height:40px"></user-avatar>
        </div>
      </div>
    </div>
    <tool-bar v-show="!history"
              :status="{canSave:!isSaving}"></tool-bar>
    <div v-show="history"
         style="margin:12px 24px"
         class="tip"
         primary
         center>
      <h2>正在预览历史版本</h2>
      <div>
        <button text
                @click="applyHistory">还原到该版本</button>
        <button text
                @click="exitHistory">退出预览</button>
      </div>
    </div>
    <div class="content">
      <div class="shape-bar"
           v-show="!history">
        <shape-bar></shape-bar>
      </div>

      <div class="canvas_wrapper"
           v-loading="!map">
        <div class="menu-bar"
             v-show="!history">
          <menu-bar></menu-bar>
        </div>
        <div class="canvas"
             :id="drawerId"> </div>
      </div>
      <div class="setting-bar">
        <setting-bar></setting-bar>
      </div>
    </div>
    <share-popover ref="sharePopover"></share-popover>
  </section>
</template>
<script>
import Go from 'gojs'
import ShapeBar from './ShapeBar'
import SettingBar from './SettingBar'
import Vue from 'vue'
import Parse from 'parse'
import ToolBar from './ToolBar'
import { mapGetters } from 'vuex'
import { FlowChart, MindMap } from '@/map'
import MenuBar from './MenuBar'
import _ from 'lodash'
import UserAvatar from './UserAvatar'
import SharePopover from './Share'
import FileSaver from 'file-saver'
import systemSetting from '../store/predefine/setting'

const WorksClass = Parse.Object.extend('works')

let map = null
let delaySave = null
let currentModel = null

export default {
  computed: {
    ...mapGetters({
      history: 'drawing/history'
    })
  },
  data () {
    return {
      fileName: '',
      isSaving: false,
      map: null,
      lastRaw: null,
      delayClearStaus: null,
      mapData: {},
      drawerId: "graphObject_" + new Date().getTime(),
      zoomScale: 100,
      statusMessage: '',
      save: null
    }
  },
  components: {
    ShapeBar, SettingBar, ToolBar, MenuBar, UserAvatar, SharePopover
  },
  watch: {
    statusMessage (val) {
      if (!_.isEmpty(val)) {
        this.delayClearStaus()
      }
    },
    fileName (val) {
      val = _.trim(val)

      if (val.length > 52) {
        this.fileName = val.substring(0, 52)
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
    },
    history (value) {
      if (value) {
        if (!currentModel) {
          currentModel = this.map.getModel()
        }

        this.map.setModel(this.history.get('raw'), false)
        this.map.setReadonly(false)
      }
    }
  },
  methods: {
    applyHistory () {
      this.map.setReadonly(false)
      this.mapSource.set('raw', this.history.get('raw'))
      this.$store.dispatch('drawing/setHistory', null)
      this.save('model')
      this.$notify.success('操作成功')

      currentModel = null
    },
    exitHistory () {
      this.$store.dispatch('drawing/setHistory', null)
      this.map.setModel(currentModel, false)
      this.map.setReadonly(false)

      currentModel = null
    },
    share () {
      this.$refs.sharePopover.open(this.mapSource.id)
    },
    exportDocument (arg) {
      arg = (arg || '').toLowerCase()
      const fileName = `drawer.${arg}`
      switch (arg) {
        case 'PNG':
          this.map.canvas.makeImageData({
            scale: 1,
            type: 'image/png',
            returnType: 'blob',
            callback (imageData) {
              FileSaver.saveAs(imageData, fileName)
            }
          });

          break;

        case 'PDF':
          var pdf = new Pdfer('1', 'px', 400, 500)

          this.map.canvas.makeImageData({
            scale: 1,
            type: 'image/png',
            returnType: 'blob',
            callback (imageData) {
              FileSaver.saveAs(imageData, fileName)
            }
          });

          break;

        case 'SVG':
          var html = this.map.canvas.makeSvg({
            position: new go.Point(NaN, NaN)
          })
          var blob = new Blob([html.outerHTML], { type: 'text/plain;charset=utf-8' })
          FileSaver.saveAs(blob, fileName)

          break;
      }
    },
    onNameChange (value) {
      if (_.isEmpty(this.fileName)) {
        this.fileName = '未命名文档'
      }

      if (this.fileName !== this.mapData.name) {
        this.mapSource.set('name', value)
        this.save()
      }
    },
    onModelChange (event, model) {
      if (event.isTransactionFinished) {
        this.mapSource.set('raw', model)
        this.save('model')
      }
    },
    onSettingChange (setting) {
      this.mapSource.set('setting', setting)
      this.save('setting')
    },
    onStyleChange ({ objectId }) {
      if (!_.isEmpty(objectId)) {
        this.mapSource.set('style', styleObject.objectId)
        this.save('style')
      }
    }
  },
  created () {
    this.save = _.throttle(async (saveKeys) => {
      try {
        this.isSaving = true

        await this.mapSource.save()

        this.isSaving = false
        //this.$message.success('已保存')
      } catch ({ message, code }) {
        this.$message.error(message)
      }
    }, 1000)
  },
  async mounted () {
    try {
      this.mapSource = await new Parse.Query(WorksClass).include('style').get(this.$route.params.id)
    } catch ({ code, message }) {
      this.$message.error(message)
    }

    if (!this.mapSource) {
      this.$message({
        showClose: true,
        message: '文件不存在或已删除',
        type: 'error'
      })


      return this.$router.push('/')
    }

    try {
      await Parse.Cloud.run('openWorks', {
        id: this.mapSource.id
      })
    } catch (error) {
      console.error(error)
    }

    this.mapData = this.mapSource.toJSON()
    this.fileName = this.mapData.name
    let { style, setting, raw } = this.mapData

    if (_.isEmpty(style)) {
      style = await this.$store.dispatch('style/getPredefine')
    }

    if (_.isEmpty(setting)) {
      setting = systemSetting
    }

    switch (this.mapData.map) {
      case 'MIND_MAP':
        this.map = new MindMap(style.model, setting, raw)
        break

      default:
        this.map = new FlowChart(style.model, setting, raw)
        break
    }

    setTimeout(() => {
      this.map.mount(this.drawerId)
      this.map.addModelListener(this.onModelChange)
      this.map.addSettingListener(this.onSettingChange)
      this.map.addStyleListener(this.onStyleChange)
      this.$store.dispatch('drawing/setMap', this.map)
      this.$store.dispatch('drawing/setMapSource', this.mapSource)
      // this.$bus.$on('map:requestAction', (actionName) => {
      //   //this.map.canvas.commandHandler.call(this)
      //   this.map.canvas.commandHandler[actionName]()
      // })
    }, 500)

  }
}
</script>

<style lang="scss" scoped>
@import "@/style/variables.scss";

section.map-editor {
  display: flex;
  align-items: stretch;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;

  .header-bar {
    padding: 0 12px;
    background: #fcfcf9;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    flex-shrink: 1;
    align-items: center;
    max-height: 80px;

    .el-input {
      background: #fff;
      border-radius: 20px;
      background: transparent;
      transition: all 0.3s;
      font-size: 16px;
      color: #333;
      max-width: 280px;
      min-width: 80px;

      input[type="text"] {
        padding: 0 12px;
        margin: 0;
        border-radius: 0;
        border-color: transparent;
        background: transparent;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 18px;
        box-sizing: border-box;
        color: #000000;

        &:focus {
          border-color: $--color-primary;
        }
      }

      &:hover {
        border-color: transparent;

        input[type="text"] {
          border-color: $--color-primary;
        }
      }
    }

    .message {
      margin-left: 24px;
    }
  }

  .content {
    display: flex;
    align-items: stretch;
    flex-direction: row;
    flex-grow: 1;

    .shape-bar {
      width: 300px;
      overflow: hidden;
      border-right: 1px solid #ebeef5;
      background: #fcfcf9;
    }

    .canvas_wrapper {
      padding-top: 0;
      padding: 32px;
      padding-top: 0;
      flex-grow: 1;
      display: flex;
      align-items: stretch;
      flex-direction: column;
      background: #c9c9c9;

      .canvas {
        box-shadow: 0 0 6px 0 #999;
        background: #fff;
        width: 100%;
        height: 100%;
        margin: auto;
        transition: all 0.3s;
      }

      .menu-bar {
        background: transparent;
      }
    }

    .setting-bar {
      width: 300px;
    }
  }
}

.menu {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  .buttons {
    span {
      cursor: pointer;
      margin-right: 12px;
      .iconfont {
        font-size: 24px;
        color: $--color-text-primary;
      }
    }
  }
}

ul.shortcut {
  overflow-y: auto;
  max-height: 800px;
  width: 480px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  li {
    margin-bottom: 6px;
  }
}
</style>
