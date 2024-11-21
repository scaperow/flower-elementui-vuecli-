<template>
  <section class="shape-bar">
    <!-- <div class="tool">
      <i title="添加图形"
         @click="handleCreateShape"
         class="fa fa-plus"></i>
      <i title="上传图片图形"
         @click="handleUpload"
         class="fa fa-cloud-upload"></i>
    </div> -->
    <!-- <el-button></el-button> -->

    <div class="tabs">
      <button class="tab"
              :class="{'is-active':selectTab === 'SHAPES'}"
              @click="selectTab='SHAPES'">所有图形</button>
      <button class="tab"
              :class="{'is-active':selectTab === 'PICTURES'}"
              @click="onChangeTab">我上传的</button>
      <div class="tab"
           v-show="selectTab === 'SHAPES'">
        <el-collapse @change="onChangeCollapse"
                     v-model="expandCategory">
          <el-collapse-item v-for="(category,index) in categories"
                            :key=index
                            :title="category.name"
                            :name="category.objectId">
            <div style="width:300px;height:300px"
                 :id="`plette_${category.objectId}`"></div>
            <!-- <div class="text-center">
              <el-tooltip content="显示更多">
                <el-button round
                           class="more"
                           type="text"
                           icon="fa fa-arrow-circle-down"
                           v-show="!_get(category,'$viewTag.hasNoMore')"
                           :loading="_get(category, '$viewTag.isLoading')"
                           @click="showMore(category)"></el-button>
              </el-tooltip>
            </div> -->
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="tab"
           v-show="selectTab === 'PICTURES'">
        <div style="width:300px;height:300px"
             id="picture_palette"></div>
      </div>
    </div>

    <picture-create ref="imageModal"></picture-create>
  </section>
</template>

<script>
import Go from 'gojs'
import { TemplateMaker, Maps } from '@/map'
import ABC from '@/map'
import Parse from 'parse'
import Http from '@/api/common.js'
import _ from 'lodash'
import Vue from 'vue'
import PictureCreate from './PictureCreate'
import { mapGetters } from 'vuex';

const $ = Go.GraphObject.make
const ShapeClass = Parse.Object.extend('shape')
const ShapeQuery = new Parse.Query(ShapeClass)
const CategoryClass = Parse.Object.extend('shapeCategory')
const PictureClass = Parse.Object.extend('picture')
const ShapeApi = Http.create('shape')
const ShapeCategoryApi = Http.create('shapeCategory')
const { VUE_APP_OSS_URL } = process.env;


let palettes = {}
let $side = null
let $picture = null

let baseShapeModel = [
  { category: 'shape', data: { figure: 'rectangle' }, text: '矩形' },
  { category: 'shape', data: { figure: 'roundrectangle' }, text: '圆角矩形' },
  { category: 'shape', data: { figure: 'circle' }, text: '圆形' },
  { category: 'shape', data: { figure: 'circle' }, text: '圆形' }
];

let otherShapeModel = [
  { category: 'shape', data: { figure: 'rectangle' }, text: '矩形' },
  { category: 'shape', data: { figure: 'roundrectangle' }, text: '圆角矩形' },
  { category: 'shape', data: { figure: 'circle' }, text: '圆形' },
  { category: 'shape', data: { figure: 'circle' }, text: '圆形' }
];
let groupMap = [];

export default {
  components: {
    PictureCreate
  },
  data () {
    return {
      selectTab: 'SHAPES',
      categories: [],
      expandCategory: [],
      picturePageIndex: 0,
      picturePageSize: 10,
      pictures: [],
      pictureHasMore: false
    }
  },

  async created () {

  },
  computed: {
    ...mapGetters({
      style: 'style/predefine',
      map: 'drawing/map'
    })
  },
  watch: {
    map () {
      this.fetchShapes(this.map.name)
    }
  },
  methods: {
    async showNode (palette, shape) {
      let { category, model, objectId: id, name, xml } = shape
      let parser = new DOMParser()

      model = {
        ...model,
        category,
        name,
        zOrder: 0
      }

      if (!_.isEmpty(xml)) {
        let dom = parser.parseFromString(xml, 'text/xml')
        var svg = dom.getElementsByTagName('svg')[0]
        var paths = svg.getElementsByTagName('path')
        var itemArray = _.map(svg.getElementsByTagName('path'), (path) => {
          return {
            geometryString: go.Geometry.fillPath(path.getAttribute('d')),
            fill: path.getAttribute('fill')
          }
        })

        _.set(model, 'itemArray', itemArray)
      }

      palette.model.addNodeData(model)
    },
    _get (object, key) {
      return _.get(object, key)
    },
    onChangeTab () {
      this.selectTab = 'PICTURES'
      this.$nextTick(() => {
        $picture.layoutDiagram()
      })
    },
    onChangeCollapse (ids) {
      this.$nextTick(() => {
        _.each(ids, (id) => {
          palettes[id].layoutDiagram()
        })
      })

    },
    handleUpload () {
      this.$refs.imageModal.show()
    },
    async showMore (category) {
      var $viewTag = {
        pageIndex: 1,
        pageSize: 10
      }

      if (_.has(category, '$viewTag')) {
        $viewTag = category.$viewTag
      }

      try {
        $viewTag.isLoading = true

        const palette = palettes[category.objectId]
        const shapes = await Parse.Cloud.run('shapesForCategory', { category: category.objectId, index: $viewTag.pageIndex, map: mapCategory, size: $viewTag.pageSize })

        if (shapes.length > 0) {
          _.each(shapes, (shape) => {
            if (shape.allowCreate === true) {
              this.showNode(palette, shape)
            }
          })
          $viewTag.pageIndex++
        } else {
          $viewTag.hasNoMore = true
        }

        $viewTag.isLoading = false

        Vue.set(category, '$viewTag', $viewTag)

      } catch (error) {
        throw error
      }
    },
    async fetchShapes (mapCategory) {
      var categories = await Parse.Cloud.run('shapesWithCategory', { map: mapCategory })
      this.categories = _.map(categories, (category) => {
        return category
      })

      var style = await this.$store.dispatch('style/getPredefine')
      var mapping = new TemplateMaker(style.get('model')).makeNodeTemplates()
      var expands = []

      this.$nextTick(() => {
        _.each(this.categories, (category) => {
          if (category.isExpand) {
            expands.push(category.objectId)
          }

          var palette = $(Go.Palette, `plette_${category.objectId}`,
            {
              ...mapping
            })

          palettes[category.objectId] = palette

          _.each(category.shapes, (shape) => {
            if (shape.allowCreate === true) {
              this.showNode(palette, shape)
            }
          })
        })

        this.expandCategory = [...expands]

      })
    },
    async handleDeletePicture (shape) {
      this.$confirm('删除后无法还原，继续吗?')
        .then(_ => {
          //console.log(shape)
        })
        .catch(_ => { });
    },
    async fetchPictures () {
      let pictureQuery = new Parse.Query(PictureClass)
      $picture = $(Go.Palette, 'picture_palette')

      $picture.nodeTemplateMap.add('Picture', $(go.Part,
        $(go.Picture, {
          width: 50, height: 50, imageStretch: go.GraphObject.UniformToFill,
          contextMenu:     // define a context menu for each node
            $("ContextMenu",  // that has one button
              $("ContextMenuButton",
                $(go.TextBlock, "删除"),
                {
                  width: 80,
                  height: 30,
                  click: ((e, shape) => {
                    this.handleDeletePicture(shape)
                  })
                })
              // more ContextMenuButtons would go here
            )  // end Adornment
        }, new Go.Binding("source", "source").makeTwoWay())
      ))

      this.pictures = await pictureQuery
        .matches('user.id', 'testUser')
        .skip(this.picturePageIndex * this.picturePageSize)
        .limit(this.picturePageSize)
        .find()

      if (this.pictures.length > this.picturePageSize) {
        this.pictureHasMore = false
      } else {
        this.pictureHasMore = true
        this.picturePageIndex++
      }

      _.each(this.pictures, (picture) => {
        this.showNode($picture, picture)
      })
    }
  },
  mounted () {
    this.fetchPictures()
  },
  beforeDestroy () {
    _.each(palettes, (palette) => {
      palette.div = null
    })
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/variables.scss";
section.shape-bar {
  background: $--background-color-base;

  .tabs {
    padding: 16px 12px;
    button.tab {
      transition: all 0.3s;
      border: none;
      margin: 0;
      padding: 10px 14px;
      border-radius: 24px;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
      color: $--color-primary;

      &.is-active {
        background: $--color-primary;
        color: $--color-white;
      }
    }

    div.tab {
      margin-top: 12px;
    }
  }
}
</style>

<style lang="scss">
@import "@/style/variables.scss";
section.shape-bar {
  .el-collapse {
    .el-collapse-item {
      div[role="button"] {
        padding-left: 12px;
        padding-right: 12px;

        &:hover {
          color: $--color-primary;

          .el-collapse-item__arrow {
            opacity: 1;
          }
        }
      }

      .el-collapse-item__content {
        padding-bottom: 0;
      }

      &.is-active {
        .el-collapse-item__arrow {
          opacity: 1;
        }
      }
    }

    .el-collapse-item__header {
      background: #fcfcf9;
      border: none;
    }

    .el-collapse-item__wrap {
      background: #fcfcf9;
    }

    .el-collapse-item__arrow {
      background: $--color-white;
      padding: 2px;
      border-radius: 4px;
      color: $--color-primary;
      opacity: 0;
      transition: all 0.3s;
      text-align: center;
    }
  }

  .el-collapse {
    border: 0;
  }
}
</style>


