<template>
  <section class="menu-bar">
    <ul class="menu">
      <el-tooltip content="字体">
        <li key="font"
            v-show="hasStyle('font')">
          <el-dropdown trigger="click"
                       @command="onSelectFont">
            <i class="iconfont icon-font"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(font,index) in fontList"
                                :command="font.name"
                                :key="index"
                                :style="{fontFamily:font.name}">{{font.label}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>

      </el-tooltip>
      <el-tooltip content="文字颜色">
        <li key="fontColor"
            v-show="hasStyle('fontColor')"
            :style="{borderColor:selectionStyle.fontColor}">
          <color-selector :show-alpha="true"
                          :predefine="systemColors"
                          :value="selectionStyle.fontColor"
                          @change="(value)=>changeStyle('fontColor',value)">
            <i slot="reference"
               class="iconfont icon-font-color"></i>
          </color-selector>
        </li>
      </el-tooltip>
      <el-tooltip content="文字大小">
        <li key="fontSize"
            v-show="hasStyle('fontSize')">
          <el-popover>

            <i slot="reference"
               class="iconfont icon-font-size"></i>
            <div class="wrapper">
              <label>
                文字大小
              </label>
              <el-slider :value="fontSizeNumber"
                         @input="(value)=>changeStyle('fontSize',value)"
                         :step="1"
                         :min="10"
                         :max="24"
                         :format-tooltip="(value)=>value + 'px'"></el-slider>
            </div>
          </el-popover>
        </li>
      </el-tooltip>
      <el-tooltip content="斜体">
        <li key="fontItalic"
            v-show="hasStyle('fontItalic')"
            :class="{active:selectionStyle.fontItalic === true}"
            @click="changeStyle('fontItalic',!selectionStyle.fontItalic)">

          <i class="iconfont icon-italic"></i>
        </li>
      </el-tooltip>
      <el-tooltip content="粗体">
        <li key="fontBold"
            :class="{active:selectionStyle.fontBold === true}"
            v-show="hasStyle('fontBold')"
            @click="changeStyle('fontBold',!selectionStyle.fontBold)">
          <i class="iconfont icon-bold"></i>
        </li>
      </el-tooltip>

      <el-tooltip content="下划线">
        <li key="isUnderline"
            :class="{active:selectionStyle.isUnderline === true}"
            v-show="hasStyle('isUnderline')"
            @click="changeStyle('isUnderline',!selectionStyle.isUnderline)">
          <i class="iconfont icon-underline"></i>
        </li>
      </el-tooltip>
      <el-tooltip content="删除线">
        <li key="isStrikethrough"
            :class="{active:selectionStyle.isStrikethrough === true}"
            v-show="hasStyle('isStrikethrough')"
            @click="changeStyle('isStrikethrough',!selectionStyle.isStrikethrough)">
          <i class="iconfont icon-strikethrough"></i>
        </li>
      </el-tooltip>
      <el-tooltip content="填充颜色">
        <li key="fill"
            v-show="hasStyle('fill')"
            :style="{borderColor:selectionStyle.fill}">
          <color-selector :show-alpha="true"
                          :predefine="systemColors"
                          :value="selectionStyle.fill"
                          @change="(value)=>changeStyle('fill',value)">
            <i slot="reference"
               class="iconfont icon-fill"></i>
          </color-selector>
        </li>
      </el-tooltip>

      <el-tooltip content="边框颜色">
        <li key="stroke"
            v-show="hasStyle('stroke')"
            :style="{borderColor:selectionStyle.stroke}">
          <color-selector :show-alpha="true"
                          :predefine="systemColors"
                          :value="selectionStyle.stroke"
                          @change="(value)=>changeStyle('stroke',value)">
            <i slot="reference"
               class="iconfont icon-pencil"></i>
          </color-selector>
        </li>
      </el-tooltip>
      <el-tooltip content="边框粗细">
        <li key="strokeWidth"
            v-show="hasStyle('strokeWidth')">
          <el-popover>
            <i slot="reference"
               class="iconfont icon-stroke"></i>
            <div class="wrapper">
              <label>边框粗细</label>
              <el-slider :value="selectionStyle.strokeWidth"
                         @input="(value)=>changeStyle('strokeWidth',value)"
                         :step="1"
                         :min="0"
                         :max="10"
                         :format-tooltip="(value)=>value + 'px'"></el-slider>
            </div>
          </el-popover>
        </li>
      </el-tooltip>

      <el-tooltip content="圆角">
        <li key="radius"
            v-show="hasStyle('radius')">
          <el-popover>
            <i slot="reference"
               class="iconfont icon-radius"></i>
            <div class="wrapper">
              <label>圆角</label>
              <el-slider :value="selectionStyle.radius"
                         @input="(value)=>changeStyle('radius',value)"
                         :step="1"
                         :min="0"
                         :max="40"></el-slider>
            </div>
          </el-popover>
        </li>
      </el-tooltip>

      <el-tooltip content="透明度">
        <li key="opacity"
            v-show="hasStyle('opacity')">
          <el-popover>
            <i slot="reference"
               class="iconfont icon-opacity"></i>
            <div class="wrapper">
              <label>透明度</label>
              <el-slider :value="selectionStyle.opacity"
                         @input="(value)=>changeStyle('opacity',value)"
                         :step="0.1"
                         :max="1"
                         :format-tooltip="(value)=>(value * 100) + '%'"></el-slider>
            </div>
          </el-popover>
        </li>
      </el-tooltip>
      <!-- </transition-group> -->
    </ul>
  </section>
</template>
<script> 
import ColorSelector from './ColorSelector'

import Parse from 'parse'
import _ from 'lodash'
import Go from 'gojs'
import { mapGetters, mapActions } from 'vuex'
import { TemplateMaker } from '@/map'
import systemFonts from '../store/predefine/fonts'
import systemColors from '../store/predefine/colors'




let templateMaker = null

export default {
  components: { ColorSelector },
  data () {
    return {
      fontList: systemFonts,
      showPicker: false,
      selectionStyle: {},
      systemColors,
      selection: [],
      setting: {},
      rootStyle: {},
      meshStyle: {},
      ruleStyle: {},
      selectObjects: []
    }
  },
  computed: {
    ...mapGetters({
      map: 'drawing/map',
      mapData: 'drawing/mapData'
    }),

    fontSizeNumber: {
      set (value) {
        this.selectionStyle.fontSize = value + 'px'

      },
      get () {
        return parseInt(this.selectionStyle.fontSize || 13)
      }
    }
  },
  methods: {
    onSelectFont (commander) {
      this.selectionStyle.fontFamily = commander
      this.setStyle('fontFamily')
    },

    changeListener (event) {
      if (!templateMaker) {
        templateMaker = new TemplateMaker(this.mapData.style.model)
      }

      switch (event.name) {
        case 'ChangedSelection':
          var selection = this.map.canvas.selection.toArray()
          var selectionStyle = {}
          if (selection.length > 0) {
            selectionStyle = _.chain(selection)
              .map(item => item.category)
              .reduce((result, category, index) => {
                if (category) {
                  var styles = _.keys(templateMaker.getStyleMapping(category))

                  if (index === 0) {
                    return styles
                  } else {
                    return _.intersection(result, styles)
                  }
                } else {
                  return result
                }
              }, [])
              .reduce((result, styleName, index) => {
                result[styleName] =
                  _.chain(selection)
                    .map((item) => _.get(item.part.data, styleName))
                    .uniq()
                    .first()
                    .value() || null

                return result

              }, {})
              .value()
          }

          this.selectObjects = selection
          this.selectionStyle = selectionStyle

          break
      }
    },
    hasStyle (...keys) {
      return _.filter(keys, (key) => _.has(this.selectionStyle, key)).length > 0
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
    changeStyle (styleName, styleValue) {
      if (_.has(this.selectionStyle, styleName)) {
        _.set(this.selectionStyle, styleName, styleValue)
        this.setStyle(styleName)
      }
    },
    setStyle (styleName) {

      if (_.has(this.selectionStyle, styleName)) {
        let value = _.get(this.selectionStyle, styleName)
        this.map.canvas.startTransaction("设置样式")

        _.each(this.selectObjects, object => {
          object.data[styleName] = value
          object.updateTargetBindings()
        })
        this.map.canvas.commitTransaction("设置样式")
      }
    }
  },
  watch: {
    map () {
      this.map.addMapListener('ChangedSelection', this.changeListener)
      this.setting = this.map.setting
    }
  },
}
</script>
<style lang="scss" scoped>
@import "@/style/variables.scss";
section.menu-bar {
  margin: 6px 12px;
  background: transparent;

  ul.menu {
    background: transparent;
    width: 100%;
    height: 50px;
    text-align: center;
    list-style-type: none;
    list-style: none;
    padding: 0;
    margin: 0;

    .el-divider--vertical {
      background: #ccc;
    }

    li {
      display: inline-block;
      border: solid 2px transparent;
      border-radius: 4px;

      i {
        font-size: 20px;
        text-align: center;
        cursor: pointer;
        display: block;
        width: 36px;
        height: 36px;
        line-height: 36px;
        color: #666;
      }

      &:hover {
        background: #f0f0f0;
        i {
          color: #333;
        }
      }

      &.active {
        background: $--color-secondary;

        i {
          color: #fff;
        }
      }

      span {
        color: $--color-text-secondary;
        font-size: 14px;
      }
    }
  }
}
</style>


