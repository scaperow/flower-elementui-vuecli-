<template>
  <div class="setting-bar">
    <el-tabs tab-position="left">
      <el-tab-pane v-show="selectObjects.count > 0">
        <el-tooltip slot="label"
                    placement="left"
                    content="当前图形">
          <span><i class="fa  fa-check-square"></i></span>
        </el-tooltip>
        <el-form size="mini">
          <el-divider content-position="center">背景</el-divider>
          <div class="form-group">
            <el-form-item label="填充颜色"
                          v-show="hasStyle('fill')">
              <el-color-picker :predefine="predefineColors"
                               @change="setStyle('fill')"
                               v-model="selectionStyle.fill"></el-color-picker>
            </el-form-item>
            <el-form-item label="渐变颜色"
                          v-show="selectionStyle.linear">
              <el-color-picker color-format="hex"
                               v-model="selectionStyle.linear"
                               @change="setStyle('shading')">
              </el-color-picker>
            </el-form-item>

            <el-form-item label="透明度"
                          v-show="hasStyle('opacity')">
              <div style="margin:12px 12px  0 12px">
                <el-slider v-model="selectionStyle.opacity"
                           @change="setStyle('opacity')"
                           :step="0.1"
                           :min="0.1"
                           :max="1"
                           :format-tooltip="(value)=>(value * 100) + '%'"></el-slider>
              </div>
            </el-form-item>
          </div>

          <el-divider content-position="center">边框</el-divider>
          <div class="form-group">
            <el-form-item label="样式"
                          v-show="hasStyle('stroke')">

            </el-form-item>
            <el-form-item label="宽度"
                          v-show="hasStyle('strokeWidth')">
              <el-input-number v-model="selectionStyle.strokeWidth"
                               :min="0"
                               :max="100"
                               @change="setStyle('strokeWidth')"></el-input-number>
            </el-form-item>
            <el-form-item label="颜色"
                          v-show="hasStyle('stroke')">
              <el-color-picker color-format="hex"
                               v-model="selectionStyle.stroke"
                               @change="setStyle('stroke')">
              </el-color-picker>
            </el-form-item>
          </div>

          <el-divider content-position="center">数据</el-divider>
          <div class="form-group">
            <el-form-item label="文本内容"
                          v-show="hasStyle('text')">
              <el-input type="textarea"
                        autosize
                        v-model="selectionStyle.text"
                        @change="setStyle('text')">
              </el-input>
            </el-form-item>
            <el-form-item label="文本颜色"
                          v-show="hasStyle('fontColor')">
              <el-color-picker color-format="hex"
                               v-model="selectionStyle.fontColor"
                               @change="setStyle('fontColor')">
              </el-color-picker>
            </el-form-item>
          </div>
        </el-form>
      </el-tab-pane>
      <el-tab-pane>
        <el-tooltip slot="label"
                    placement="left"
                    content="页面设置">
          <span><i class="fa fa-file"></i></span>
        </el-tooltip>

        <el-form size="mini"
                 label-position="left"
                 label-width="80px">
          <el-divider content-position="center">页面</el-divider>
          <el-form-item size="mini"
                        label="尺寸">
            <el-select v-model="setting.root.size">
              <el-option label="自定义"
                         :value="null">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item size="mini"
                        label="方向">
            <el-radio-group v-model="setting.root.direction">
              <el-radio-button :disabed="!setting.root.size"
                               label="H"><i class=""></i> 水平</el-radio-button>
              <el-radio-button :disabed="!setting.root.size"
                               label="V"><i class=""></i> 垂直</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item size="mini"
                        label="单位">
            <el-select v-model="setting.root.units">
              <el-option value="in"><i class=""></i> in</el-option>
              <el-option value="cm"><i class=""></i> cm</el-option>
              <el-option value="px"><i class=""></i> px</el-option>
              <el-option value="pt"><i class=""></i> pt</el-option>
            </el-select>
          </el-form-item>
          <el-form-item size="mini"
                        label="背景">
            <el-color-picker @change="(color)=>change({'root.background': color})"
                             :predefine="predefineColors"
                             :value="setting.root.background"
                             show-alpha></el-color-picker>
          </el-form-item>

          <el-divider content-position="center">网格</el-divider>
          <el-form-item size="mini"
                        label="网格">
            <el-checkbox border
                         @change="(value)=>change({'root.showMesh':value})"
                         v-model="setting.root.showMesh"></el-checkbox>
          </el-form-item>
          <el-form-item size="mini"
                        label="颜色">
            <el-color-picker :disabled="!setting.root.showMesh"
                             @change="(value)=>change({'root.meshColor':value})"
                             show-alpha
                             v-model="setting.root.meshColor"></el-color-picker>
          </el-form-item>

          <el-divider content-position="center">参考线</el-divider>
          <el-form-item size="mini"
                        label="参考线">
            <el-checkbox border
                         @change="(value)=>change({'root.showRule':value})"
                         v-model="setting.root.showRule"></el-checkbox>
          </el-form-item>
          <el-form-item size="mini"
                        label="颜色">
            <el-color-picker :predefine="predefineColors"
                             :disabled="!setting.root.showRule"
                             @change="(value)=>change({'root.ruleColor':value})"
                             v-model="setting.root.ruleColor"
                             show-alpha></el-color-picker>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane>
        <el-tooltip slot="label"
                    placement="left"
                    content="历史记录">
          <span><i class="fa fa-history"></i></span>
        </el-tooltip>
      </el-tab-pane>
      <el-tab-pane>
        <el-tooltip slot="label"
                    placement="left"
                    content="主题">
          <span><i class="fa fa-file"></i></span>
        </el-tooltip>
      </el-tab-pane>
      <el-tab-pane>
        <el-tooltip slot="label"
                    placement="left"
                    content="图层">
          <span><i class="fa fa-copy"></i></span>
        </el-tooltip>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>
<script>
/**
 * 1. User setting
 * 2. Template setting
 * 3. Default setting
 */
import Parse from 'parse'
import _ from 'lodash'
import { mapGetters, mapActions } from 'vuex'
let setting = {
  // page setting
  root: {
    direction: 'H',
    size: null,
    units: 'px',
    showRule: true,// 是否显示参考线
    showMesh: true,// 是否显示网格
    meshColor: '#409EFF',
    ruleColor: '#000'
  },
  // default setting
  common: {
    fontSize: '12px'
  },
  canvas: {
  },
  shape: {
  },
}
let styleForCategory = {
  picture: ['fill', 'stroke', 'strokeWidth', 'opacity', 'text', 'fontColor'],
  monocanvas: ['fill', 'linear', 'strokeWidth', 'stroke', 'opacity', 'shadow', 'text', 'fontColor'],
  colorcanvas: ['opacity', 'text', 'fontColor'],
  shape: ['fill', 'linear', 'strokeWidth', 'opacity', 'stroke', 'text', 'fontColor']
}
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

// Every nodeData which category name will be as 'Key'


export default {
  data () {
    return {
      styles: {},
      setting,
      predefineColors
    }
  },
  mounted () {
  },
  created () {
    //var userSetting = null

  },
  methods: {
    ...mapActions({
      change: 'drawing/setSetting',
    }),

    hasStyle (key) {
      return _.has(this.selectionStyle, key)
    },
    getStyle (styleName, part) {
      switch (styleName) {
        case 'fill':
          switch (part.category) {
            case 'Shape':
              return part.data.fill
              break;

            case 'MonoCanvas':
              return part.data.itemArray[0].fill
              break;

            default:
              return null
          }
      }
    },

    setStyle (styleName) {
      let value = _.get(this.selectionStyle, styleName)
      this.canvas.startTransaction("设置样式");
      this.selectObjects.each(object => {
        object.data[styleName] = value
        object.updateTargetBindings()
      })
      this.canvas.commitTransaction("设置样式");
    }
  },
  watch: {
    selectObjects () {

    }
  },
  computed: {
    ...mapGetters({
      selectObjects: 'drawing/selection',
      canvas: 'drawing/canvas'
    }),
    selectionStyle: {
      set (val) {
        this.styles = val
      },
      get () {
        let selection = this.selectObjects.toArray && this.selectObjects.toArray() || []
        let result = _.chain(selection)
          .map(item => item.category)
          .reduce((result, category, index) => {
            if (index === 0) {
              return _.get(styleForCategory, category.toLowerCase())
            } else {
              return _.intersection(result, _.get(styleForCategory, category.toLowerCase()))
            }
          }, [])
          .reduce((result, styleName, index) => {
            var styleValues =
              _.chain(selection)
                .map((item) => {
                  return _.get(item.data, styleName)
                })
                .uniq()
                .value()

            result[styleName] = styleValues.length > 1 ? null : styleValues[0]

            return result

          }, {})
          .value()

        this.styles = result

        return this.styles
      }
    }
  }
}
</script>
<style lang="scss">
.setting-bar {
  height: 100vh;
  border-left: 1px solid #ebeef5;

  .el-tabs.el-tabs--left {
    height: 100%;
    .el-tabs__header {
      background: #f5f7fa;
      margin-right: 0;
    }
  }

  .el-form {
    .el-form-item__label {
      text-align: right;
    }
  }
}
</style >
<style lang="scss" scoped>
.form-group {
  background: #f6f6f6;
  padding: 6px;
  border-radius: 4px;
  margin: 12px;
}
</style>



