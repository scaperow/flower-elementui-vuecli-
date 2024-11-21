<template>
  <section v-if="setting && map"
           class="setting-bar">
    <div class="tabs is-vertical">
      <div class="side">
        <el-tooltip slot="label"
                    placement="left"
                    content="页面设置">
          <button class="tab"
                  @click="selectTab ='SETTING'"
                  :class="{'active':selectTab==='SETTING'}"><i class="iconfont icon-setting"></i></button>
        </el-tooltip>

        <el-tooltip slot="label"
                    placement="left"
                    content="历史记录">
          <button class="tab"
                  @click="selectTab ='HISTORY'"
                  :class="{'active':selectTab==='HISTORY'}"><i class="iconfont icon-history"></i></button>
        </el-tooltip>

        <el-tooltip slot="label"
                    placement="left"
                    content="主题">
          <button class="tab"
                  @click="selectTab ='STYLE'"
                  :class="{'active':selectTab==='STYLE'}"><i class="iconfont icon-theme"></i></button>
        </el-tooltip>

        <el-tooltip slot="label"
                    placement="left"
                    content="图层">
          <button class="tab"
                  @click="selectTab ='LAYER'"
                  :class="{'active':selectTab==='LAYER'}"><i class="iconfont icon-layer"></i></button>
        </el-tooltip>
      </div>

      <div class="content">
        <div class="tab"
             v-show="selectTab==='SETTING'">
          <div class="title">
            页面设置
          </div>
          <el-form size="mini"
                   label-position="left"
                   label-width="80px">
            <div class="form-group">
              <h4>页面</h4>
              <el-form-item size="mini"
                            label="尺寸">
                <el-select @change="(value)=>onChangeSize(value)"
                           :value="setting.size">
                  <el-option v-for="(size,index) in pageSizes"
                             :key="index"
                             :value="size.key"
                             :label="`${size.label} ${(size.width && size.height)? (size.width +'px' +' x ' +size.height + 'px'):''}`">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="高度"
                            v-show="setting.size === 'CUSTOM'">
                <el-input type="number"
                          v-model="height">
                  <template slot="append">px</template></el-input>
              </el-form-item>
              <el-form-item label="宽度"
                            v-show="setting.size === 'CUSTOM'">
                <el-input type="number"
                          v-model="width">
                  <template slot="append">px</template>
                </el-input>
              </el-form-item>
              <el-form-item size="mini"
                            v-show="setting.size !== 'AUTO'"
                            label="方向">
                <el-radio-group v-model="direction">
                  <el-radio-button label="H"> 水平</el-radio-button>
                  <el-radio-button label="V"> 垂直</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <!-- <el-form-item size="mini"
                          label="单位">
              <el-select v-model="setting.units">
                <el-option value="in"><i class=""></i> in</el-option>
                <el-option value="cm"><i class=""></i> cm</el-option>
                <el-option value="px"><i class=""></i> px</el-option>
                <el-option value="pt"><i class=""></i> pt</el-option>
              </el-select>
            </el-form-item> -->
              <el-form-item size="mini"
                            label="颜色">
                <el-color-picker @change="(color)=>changeSetting('background', color)"
                                 :predefine="predefineColors"
                                 :value="setting.background"
                                 show-alpha></el-color-picker>
              </el-form-item>
            </div>

            <div class="form-group">
              <h4>网格 <el-button @click="changeSetting('showMesh', !setting.showMesh)"
                           type="text">{{setting.showMesh?'隐藏网格':'显示网格'}}</el-button>
              </h4>

              <el-form-item size="mini"
                            label="颜色"
                            v-show="setting.showMesh">
                <el-color-picker @change="(value)=>changeSetting('meshColor',value)"
                                 show-alpha
                                 :value="meshColor"></el-color-picker>
              </el-form-item>
            </div>

            <div class="form-group">
              <h4>参考线 <el-button @click="changeSetting('showRule', !setting.showRule)"
                           type="text">{{setting.showRule?'隐藏参考线':'显示参考线'}}</el-button>
              </h4>

              <el-form-item size="mini"
                            v-show="setting.showRule"
                            label="颜色">
                <el-color-picker :predefine="predefineColors"
                                 @change="(value)=>changeSetting('ruleColor',value)"
                                 :value="ruleColor"
                                 show-alpha></el-color-picker>
              </el-form-item>
            </div>
          </el-form>
        </div>
        <div class="tab"
             v-show="selectTab==='HISTORY'"
             v-loading="isLoadingHistory">
          <div class="title">
            历史记录
          </div>
          <p class="tip"
             center
             v-show="historyList.length ===0">
            暂无记录
          </p>
          <el-timeline :reverse="true"
                       v-show="historyList.length > 0"
                       class="histories">
            <el-timeline-item v-for="(history,index) in historyList"
                              :key="index"
                              :timestamp="new Date(history.get('updatedAt')).getTime() | date('yyyy-MM-dd HH:mm:ss')"
                              placement="top">
              <div class="history"
                   @click="previewHistory(history)"
                   :class="{'active':currentHistory && history.id === currentHistory.id}">
                {{history.get('note') || '自动保存'}}
                <div class="buttons text-right">
                  <!-- <el-popover>
                    <div>
                      <div>是否删除该历史记录?</div>
                      <div class="text-right">
                        <button text
                                primary
                                @click="removeHistory(history,index)">是</button>
                        <button text>否</button>
                      </div>
                    </div>
                    <button text
                            slot="reference">删除</button>
                  </el-popover> -->
                  <button text
                          @click="removeHistory(history,index)">删除</button>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <p class="text-center"
             v-show="historyList.length  >= 20">
            最多可显示 20 条历史记录

          </p>
          <div class="text-center"
               style="margin-top:42px">
            <!-- <button round
                    primary
                    @click="getHistories">
              <i class="iconfont icon-refresh"></i>
              刷新</button> -->
          </div>
        </div>
        <div class="tab"
             v-show="selectTab==='STYLE'">
          <div class="title">
            历史记录
          </div>
          <div v-for="(style,index) in styleList"
               class="style"
               :key="index"
               @click="setStyle(style)">
            <div class="wrapper"
                 :id="`style_canvas_${style.objectId}`">
            </div>
            <label>{{style.name}}</label>
          </div>
        </div>
        <div class="tab"
             v-show="selectTab === 'LAYER'">

        </div>
      </div>
    </div>
  </section>
</template>
<script>
/**
 * 1. User setting
 * 2. Template setting
 * 3. Default setting
 */
import Parse from 'parse'
import _ from 'lodash'
import Go from 'gojs'
import { mapGetters, mapActions } from 'vuex'
import { TemplateMaker } from '@/map'
import Pixel from 'unit-to-px'

const StyleClass = Parse.Object.extend('style')
const HistoryClass = Parse.Object.extend('history')
const StyleCanvasModel = `{ "class": "GraphLinksModel",
  "nodeDataArray": [ 
{"figure":"Circle", "zOrder":0, "name":"结束", "category":"Shape", "key":-2, "location":"0 0", "size":"50 50"},
{"figure":"Diamond", "zOrder":0, "name":"判定", "category":"Shape", "key":-3, "location":"0 100", "size":"50 50"},
{"figure":"Circle", "zOrder":0, "name":"开始", "category":"Shape", "key":-1, "location":"100 0", "size":"50 50"}
 ],
  "linkDataArray": [ 
{"from":-2, "to":-3, "points":[-140,201.5,-140,211.5,-140,218.5,-140,218.5,-140,225.5,-140,235.5]},
{"from":-3, "to":-1, "points":[-104.5,270,-94.5,270,-86,270,-86,270,-77.5,270,-67.5,270]}
 ]}`;

const $ = Go.GraphObject.make;

let palettes = {}
let predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577'
]
let pageSizes = [{
  key: 'AUTO',
  label: '自适应'
}, {
  key: 'A3',
  label: 'A3',
  width: parseInt(Pixel('297mm')),
  height: parseInt(Pixel('420mm')),
}, {
  key: 'A4',
  label: 'A4',
  width: parseInt(Pixel('210mm')),
  height: parseInt(Pixel('297mm')),
}, {
  key: 'A5',
  label: 'A5',
  width: parseInt(Pixel('148mm')),
  height: parseInt(Pixel('210mm')),
}, {
  key: 'CUSTOM',
  label: '自定义'
}]

// Every nodeData which category name will be as 'Key'

export default {
  data () {
    return {
      selectTab: 'SETTING',
      pageSizes,
      historyList: [],
      styleList: [],
      predefineColors,
      isLoadingHistory: false,
    }
  },
  watch: {
    map () {
      this.getStyles()
    },
    selectTab () {
      switch (this.selectTab) {
        case 'STYLE':
          this.$nextTick(() => {
            _.each(palettes, (canvas) => {
              canvas.layoutDiagram()
            })
          })
          break;

        case 'HISTORY':
          this.getHistories()
      }
    }
  },
  methods: {
    async previewHistory (history) {
      var historyModel = null

      if (history && !history.has('raw')) {
        try {
          await history.fetchWithInclude('raw')
        } catch ({ message }) {
          this.$message.error(message)
        }
      }


      this.$store.dispatch('drawing/setHistory', history)
    },
    async removeHistory (history, index) {
      try {
        await history.destroy()

        this.historyList.splice(index, 1)
        this.$notify.success('已删除')
      } catch (error) {
        this.$message.error(error.message)
      }

      // 数组移除，此处 index 不用修改即可取下一条数据
      this.previewHistory(this.historyList[index] || null)
    },
    onChangeSize (size) {
      var { width, height } = _.find(this.pageSizes, { key: size })
      var changes = {
        size: size
      }

      switch (size) {
        case 'AUTO':
          changes.width = '100%'
          changes.height = '100%'
          break;

        case 'CUSTOM':
          changes.width = this.map.canvas.div.offsetWidth + 'px'
          changes.height = this.map.canvas.div.offsetHeight + 'px'
          break;

        default:
          changes.width = parseInt(width) + 'px'
          changes.height = parseInt(height) + 'px'

          break;
      }

      this.map.changeSetting(changes)
    },
    changeSetting (key, value) {
      this.map.changeSetting({
        [key]: value
      })
    },
    async getStyles () {
      var styles = await new Parse.Query(StyleClass).find()
      this.styleList = _.map(styles, style => style.toJSON())
      this.$nextTick(() => {
        _.each(this.styleList, style => {
          let styleCanvas = $(Go.Palette, `style_canvas_${style.objectId}`,
            {
              layout: new go.Layout(),
              allowDragOut: false,
              allowHorizontalScroll: false,
              allowVerticalScroll: false,
              viewSize: new go.Size(100, 100),
              initialPosition: new go.Point(0, 0),
              position: new go.Point(0, 0),
            })

          var templateMaker = new TemplateMaker(style)
          styleCanvas.setProperties(templateMaker.makeNodeTemplates())
          styleCanvas.model = go.Model.fromJson(StyleCanvasModel)
          palettes[style.id] = styleCanvas
        })
      })
    },
    async getHistories () {
      this.isLoadingHistory = true

      try {
        var histories = await new Parse.Query(HistoryClass).equalTo('works', this.mapSource).exclude('raw').find()
        // this.historyList = _.map(histories, history => history.toJSON())
        this.historyList = histories
      } catch (error) {
        this.$message.error(error.message)
      }

      this.isLoadingHistory = false
    }
  },
  computed: {
    ...mapGetters({
      map: 'drawing/map',
      mapSource: 'drawing/mapSource',
      currentHistory: 'drawing/history'
    }),
    setting () {
      if (this.map) {
        return this.map.setting
      }

      return null
    },
    meshColor () {
      return _.get(this.map, 'setting.meshColor') || _.get(this.map, 'style.root.MeshColor')
    },
    ruleColor () {
      return _.get(this.map, 'setting.ruleColor') || _.get(this.map, 'style.root.RuleColor')
    },
    width: {
      set (value) {
        this.changeSetting('width', parseInt(value) + 'px')
      },
      get () {
        return parseInt(this.setting.width)
      }
    },
    height: {
      set (value) {
        this.changeSetting('height', parseInt(value) + 'px')
      },
      get () {
        return parseInt(this.setting.height)
      }
    },
    direction: {
      set (value) {
        this.changeSetting('direction', value)
      },
      get () {
        return this.setting.direction
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/style/variables.scss";

section.setting-bar {
  background: #fcfcf9;

  .el-tabs.el-tabs--left {
    height: 100%;
    .el-tabs__header {
      background: #fcfcf9;
      margin-right: 0;
    }

    .el-tabs__content {
      background: #fcfcf9;
      height: 100%;
    }
    .el-tabs__nav {
      border: none;
      border-radius: 50%;
      margin: 16px 12px;

      .el-tabs__item {
        width: 34px;
        height: 34px;
        border: none;
        text-align: center;
        padding: 0;
        margin: 0;
        display: block;
        line-height: 34px;
        border-radius: 20px;
        color: $--color-secondary;

        &.is-active {
          background: $--color-secondary;
          color: #fff;
        }
      }
    }
  }

  .el-form {
    .el-form-item__label {
      text-align: right;
    }
  }

  div.tabs {
    &.is-vertical {
      display: flex;
      position: relative;

      .side {
        padding: 12px 6px;
        text-align: center;

        button.tab {
          display: block;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 40px;
          background: transparent;
          transition: all 0.3s;
          color: $--color-primary;
          margin: 18px 0;
          cursor: pointer;
          text-align: center;

          .iconfont {
            font-size: 25px;
            vertical-align: middle;
          }

          &.active {
            background: $--color-primary;
            color: $--color-white;
          }

          &:hover {
            color: $--color-primary;
          }
        }
      }
      .content {
        flex-grow: 1;
        padding: 12px;
        padding-left: 0;
        position: relative;

        .title {
          text-align: right;
          color: $--color-text-secondary;
          font-size: 14px;
          margin: 6px 12px;
        }
      }
    }

    button.toggle {
      width: 35px;
      height: 35px;
      border-radius: 35px;
    }

    button {
      &[round] {
        border-radius: 30px;
      }

      &[primary] {
        padding: 0;
        height: 40px;
        min-width: 80px;
        font-size: 14px;
        background: #333;
        color: #fff;
        transition: all 0.3s;
        border: none;
        cursor: pointer;

        &:hover {
          background: $--color-primary;
          color: $--color-white;
        }
      }
    }
  }
}
</style >
<style lang="scss" scoped>
@import "@/style/variables.scss";
.form-group {
  background: #f6f6f6;
  padding: 6px 12px;
  border-radius: 4px;
  margin: 12px 0;

  h4 {
    margin-top: 6px;
  }
}

.style {
  text-align: center;
  width: 100px;
  display: inline-block;
  margin: 12px 0 12px 6px;

  &:hover {
    .wrapper {
    }
  }

  .wrapper {
    height: 100px;
    cursor: pointer;
    transition: all 0.3s;
    // border: solid 1px #f3f3f3;
  }
  label {
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 16px;
    // background: #f5f7fa;
  }
}

.histories {
  padding: 0;
  margin-top: 24px;
  overflow-y: auto;

  .history {
    background: #f6f6f6;
    padding: 12px;
    border-radius: 4px;
    margin: 12px 0;
    transition: all 0.3s;
    cursor: pointer;

    .buttons {
      display: none;
    }

    &:hover {
      box-shadow: $--box-shadow-base;
      background: #f0f0f0;
    }

    &.active {
      background: #333;
      color: #fff;

      .buttons {
        display: block;

        button[text] {
          color: $--color-white;
        }
      }
    }

    h2 {
      font-size: 14px;
      color: #333;
      font-weight: bold;
      margin: 0;
      padding: 0;
      margin-bottom: 6px;
    }

    label {
      color: $--color-text-primary;
      font-size: 12px;
      margin-bottom: 3px;
    }
  }
}
</style>



