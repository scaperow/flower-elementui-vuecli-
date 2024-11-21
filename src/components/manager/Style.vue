<template>
  <el-container>
    <el-aside v-if="list"
              width="200px">
      <h4>所有主题 [{{list.length}}]
        <el-button text
                   type="primary"
                   @click="create">创建</el-button>
      </h4>
      <transition-group name="el-fade-in">
        <el-card style="margin-bottom:16px;"
                 :shadow="currentStyle && style.id === currentStyle.id?'always':'hover'"
                 v-for="(style,index) in list"
                 :key="index">
          <el-link @click="setCurrentStyle(style)">{{style.attributes.name}}</el-link>

        </el-card>
      </transition-group>
    </el-aside>

    <el-main style="padding:16px"
             v-if="currentStyle">
      <el-form :inline="true">
        <el-form-item label="主题名称">
          <el-input v-model="name">名称</el-input>
          <el-checkbox v-model="isDefault"
                       :disabled="false"
                       v-show="isDefault">是否默认</el-checkbox>
        </el-form-item>
        <el-divider>页面主题</el-divider>
        <el-form-item label="背景颜色">
          <el-color-picker :show-alpha="true"
                           :predefine="systemColors"
                           v-model="model.root.background"></el-color-picker>
        </el-form-item>
        <el-form-item label="参考线颜色">
          <el-color-picker :show-alpha="true"
                           :predefine="systemColors"
                           v-model="model.root.ruleColor"></el-color-picker>
        </el-form-item>
        <el-form-item label="网格颜色">
          <el-color-picker v-model="model.root.meshColor"></el-color-picker>
        </el-form-item>
        <el-form-item label="连线">
          <el-color-picker :show-alpha="true"
                           :predefine="systemColors"
                           v-model="model.line.stroke"></el-color-picker>
        </el-form-item>
      </el-form>
      <div v-for="(category,key) in categoryStyle"
           :key="key"
           style="margin-bottom:18px; background:#f3f3f3;padding:12px;border-radius:12px;">
        <el-form :inline="true">
          <el-divider>{{key | uppercase}}</el-divider>
          <el-form-item label="背景颜色">
            <el-color-picker :show-alpha="true"
                             :predefine="systemColors"
                             v-model="category.fill"></el-color-picker>
          </el-form-item>
          <el-form-item label="边框大小">
            <el-input type="number"
                      v-model="category.strokeWidth"></el-input>
          </el-form-item>
          <el-form-item label="边框颜色">
            <el-color-picker :show-alpha="true"
                             :predefine="systemColors"
                             v-model="category.stroke"></el-color-picker>
          </el-form-item>
          <el-form-item label="字体">
            <el-select v-model="category.fontFamily">
              <el-option v-for="font in systemFonts"
                         :key="font.name"
                         :label="font.label"
                         :value="font.name"
                         :style="{fontFamily:font.name}">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="字体大小">
            <el-input type="number"
                      v-model="category.fontSize"></el-input>
          </el-form-item>

          <el-form-item label="字体颜色">
            <el-color-picker :show-alpha="true"
                             :predefine="systemColors"
                             v-model="category.fontColor"></el-color-picker>
          </el-form-item>
          <el-form-item label="粗体">
            <el-checkbox type="number"
                         v-model="category.fontBold"></el-checkbox>
          </el-form-item>
          <el-form-item label="斜体">
            <el-checkbox type="number"
                         v-model="category.fontItalic"></el-checkbox>
          </el-form-item>
          <el-form-item label="透明度">
            <el-slider :min="0"
                       :max="1"
                       :step="0.1"
                       style="width:120px"
                       v-model="category.opacity"></el-slider>
          </el-form-item>
          <el-form-item label="圆角">
            <el-slider :min="0"
                       :max="60"
                       :step="1"
                       :show-input="true"
                       style="width:420px"
                       v-model="category.radius"></el-slider>
          </el-form-item>
          <el-form-item label="长度">
            <el-input type="number"
                      style="width:80px"
                      v-model="category.height"></el-input>
          </el-form-item>
          <el-form-item label="宽度">
            <el-input type="number"
                      style="width:80px"
                      v-model="category.width"></el-input>
          </el-form-item>

        </el-form>
      </div>
      <p>
        <el-button type="primary"
                   @click="save">保存</el-button>
        <el-button class="fr"
                   type="danger"
                   v-if="!isDefault"
                   @click="remove(currentStyle)">删除</el-button>
      </p>
    </el-main>
  </el-container>
</template>
<script>
import _ from 'lodash'
import Http from '@/api/common'
import Parse from 'parse'
import { TemplateMaker } from '@/map'
import { mapGetters } from 'vuex';
import systemColors from '@/store/predefine/colors'
import systemFonts from '@/store/predefine/fonts'

const StyleClass = Parse.Object.extend('style')
const shapesApi = Http.create('style')
const shapesStyle = _.chain(TemplateMaker.categoryStyle)
  .keys()
  .reduce((result, current) => {
    result[current] = {
      fill: '#fff',
      opacity: 1,
      radius: 10,
      stroke: '#999',
      strokeWidth: 1,
      fontColor: '#333',
      fontSize: 13,
      fontBold: false,
      fontItalic: false,
      width: 80,
      height: 80
    }

    return result
  }, {})
  .value()
const commonStyle = {
  name: '主题',
  root: {
    color: null,
    background: null,
    meshColor: null,
    ruleColor: null,
  },
  line: {
    stroke: null,
    strokeWidth: 1
  },
  group: {
    radius: 8,
    fill: 'transparent',
    opacity: 0.5,
    padding: 5,
    stroke: '#666',
    strokeWidth: 1,
    fontColor: '#333'
  },
  ...shapesStyle
}

export default {
  data () {
    return {
      name: null,
      model: null,
      isDefault: false,
      currentStyle: null,
      systemFonts, systemColors
    }
  },
  methods: {
    setCurrentStyle (style) {
      //console.log(_.defaults(commonStyle, style.get('model')))
      if (style) {
        this.name = style.get('name')
        this.model = _.create(commonStyle, style.get('model'))
        this.isDefault = style.get('isDefault')
      }

      this.currentStyle = style
    },
    async getData () {
      this.$store.dispatch('style/getList')
    },
    async save () {
      this.currentStyle.set('name', this.name)
      this.currentStyle.set('model', this.model)
      this.currentStyle.set('isDefault', this.isDefault)

      try {
        await this.currentStyle.save()

        this.$notify.success('已保存')
      } catch ({ code, message }) {
        this.$message.error(message)
      }
    },
    async remove (style) {
      await this.$store.dispatch('style/remove', style.id)
      this.setCurrentStyle(null)
      this.$notify.success('已删除')
    },
    async create () {
      var style = await this.$store.dispatch('style/create', {
        name: '新主题',
        model: {}
      })

      this.setCurrentStyle(style)
    }
  },
  computed: {
    ...mapGetters({
      list: 'style/list'
    }),
    categoryStyle () {
      return _.chain(TemplateMaker.categoryStyle)
        .keys()
        .reduce((result, category) => {
          result[category] = _.get(this.model, category)

          return result
        }, {})
        .value()
    }
  },
  mounted () {
    this.getData()
  }
}
</script>
<style lang="scss" scoped>
</style>


