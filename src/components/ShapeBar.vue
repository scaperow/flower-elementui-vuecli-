<template>
  <div class="shape-bar">
    <div class="tool">
      <i title="添加图形"
         @click="handleCreateShape"
         class="fa fa-plus"></i>
      <i title="上传图片图形"
         @click="handleUpload"
         class="fa fa-cloud-upload"></i>
    </div>
    <el-tabs @tab-click="onChangeTab"
             v-loading="allCategories.length === 0">
      <el-tab-pane label="所有图形">
        <el-collapse @change="onChange"
                     v-model="selectCategories">
          <el-collapse-item v-for="(category,index) in categories"
                            :key=index
                            :title="category.name"
                            :name="category.objectId">
            <div style="width:300px;height:300px"
                 :id="`plette_${category.objectId}`"></div>
            <div class="text-center">
              <el-tooltip content="显示更多">
                <el-button round
                           class="more"
                           type="text"
                           icon="fa fa-arrow-circle-down"
                           v-show="!$get(category,'$viewTag.hasNoMore')"
                           :loading="$get(category, '$viewTag.isLoading')"
                           @click="showMore(category)"></el-button>
              </el-tooltip>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane label="我上传的">
        <div style="width:300px;height:300px"
             id="picture_palette"></div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="isCreateShape"
               width="50%">
      <el-form v-model="shapeModel">
        <el-form-item label="Name">
          <el-input v-model="shapeModel.name"></el-input>
        </el-form-item>

        <el-form-item label="Category">
          <div>
            <el-radio v-model="shapeModel.category"
                      label="Shape">Shape</el-radio>
            <el-radio v-model="shapeModel.category"
                      label="Picture">Picture</el-radio>
          </div>
        </el-form-item>
        <el-form-item label="Shape Category">
          <el-checkbox-group v-model="checkCategories">
            <el-checkbox v-for="(item,index) in allCategories"
                         :label="item.id"
                         :key="index">{{item.attributes.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="Meta Data">
          <el-input type="textarea"
                    v-model="shapeMetadata"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary"
                     @click="handleSaveShape">Save</el-button>
          <el-button @click="shapeModel = {}">Reset</el-button>
        </el-form-item>

        <el-form-item>
          <el-input v-model="createCategoryName"></el-input>
          <el-button type="text"
                     @click="handleSaveCategory">Create new Category</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <image-modal ref="imageModal"></image-modal>
  </div>
</template>

<script>
import Go, { Shape } from 'gojs'
import ResizeTool from './ResizeTool'
import { map, createShape, on, off } from './Shapes.js'
import Parse from 'parse'
import Http from '@/api/common.js'
import _ from 'lodash'
import helper from '@/helper'
import Vue from 'vue'
import ImageModal from './ImageModal'
import { constants } from 'crypto';

const { GraphObject } = Go
const { make: $ } = GraphObject
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
    ImageModal
  },
  data () {
    return {
      shapeMetadata: null,
      checkCategories: [],
      createCategoryName: null,
      shapeModel: {},
      isCreateShape: false,
      shapeList: [],
      categories: [],
      selectCategories: [],
      allCategories: [],
      picturePageIndex: 0,
      picturePageSize: 10,
      pictures: [],
      pictureHasMore: false
    }
  },
  watch: {
    checkCategories (val) {
      this.shapeModel.shapeCategory = _.filter(this.allCategories, (category) => _.includes(val, category.id))
    },
    shapeMetadata (val) {
      try {
        this.shapeModel.model = JSON.parse(val)
      } catch (error) { }
    }
  },
  async created () {
    this.allCategories = await new Parse.Query(CategoryClass).find()
  },
  methods: {
    ...helper,
    async showNode (palette, shape) {
      let { category, model, objectId: id, name } = shape
      let parser = new DOMParser()

      model = {
        ...model,
        zOrder: 0
      }

      switch (category) {
        case 'MonoCanvas':
        case 'ColorCanvas':
          let xml = await this.$http.get(`${VUE_APP_OSS_URL}/canvas/${id}.svg`)
          let dom = parser.parseFromString(xml.data, 'text/xml')
          var svg = dom.getElementsByTagName('svg')[0]
          var paths = svg.getElementsByTagName('path')

          var itemArray = _.map(svg.getElementsByTagName('path'), (path) => {
            return {
              geometryString: go.Geometry.fillPath(path.getAttribute('d')),
              fill: path.getAttribute('fill')
            }
          })


          palette.model.addNodeData({
            ...model,
            category,
            itemArray,
            name: name,
            source: `${VUE_APP_OSS_URL}/canvas/${id}.svg`,
          })
          break;
        case 'Picture':
          palette.model.addNodeData({
            ...model,
            name: name,
            source: `${VUE_APP_OSS_URL}/picture/testUser/${id}.png`,
            category: 'Picture',
          })
          break;

        default:
          console.log(shape)
          let data = {
            ...model,
            name,
            category
          }
          console.log(data)
          palette.model.addNodeData(data)
          break;
      }
    },
    onChangeTab () {
      this.$nextTick(() => {
        $picture.layoutDiagram()
      })
    },
    onChange () {
      this.$nextTick(() => {
        _.each(this.selectCategories, (name) => {
          palettes[name].layoutDiagram()
        })
      })

    },
    handleUpload () {
      this.$refs.imageModal.show()
    },
    handleCreateShape () {
      this.isCreateShape = true
    },
    handleCreateCategory () {
      this.isCreateCategory = true
    },
    async handleSaveCategory () {
      await ShapeCategoryApi.save({
        name: this.createCategoryName
      })

      this.allCategories = await new Parse.Query(CategoryClass).find()

      this.$notify.success('Success！');
    },
    async handleSaveShape () {
      if (_.isEmpty(this.shapeModel.model)) {
        return this.$message.error('Invalid json data');
      }

      await ShapeApi.save(this.shapeModel)

      this.$notify.success('Success !');
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
        const shapes = await Parse.Cloud.run('shapesForCategory', { category: category.objectId, index: $viewTag.pageIndex, size: $viewTag.pageSize })

        if (shapes.length > 0) {
          _.each(shapes, (shape) => {
            this.showNode(palette, shape)
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
    async fetchShapes () {
      const categories = await Parse.Cloud.run('shapesWithCategory')
      this.categories = _.map(categories, (category) => {
        return category
      })

      this.$nextTick(() => {
        _.each(this.categories, (category) => {
          var palette = $(Go.Palette, `plette_${category.objectId}`,
            {
              nodeTemplateMap: map,
            })

          palettes[category.objectId] = palette

          _.each(category.shapes, (shape) => {
            this.showNode(palette, shape)
          })
        })

      })
    },
    async handleDeletePicture (shape) {
      this.$confirm('删除后无法还原，继续吗?')
        .then(_ => {
          console.log(shape)
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
    this.fetchShapes()
    this.fetchPictures()
  }
}
</script>

<style lang="scss" scoped>
#sideCanvas {
  height: 100vh;
}

.container {
  border-radius: 6px;
}

.el-button.more {
  font-size: 24px;
}

.tool {
  height: 40px;
  line-height: 40px;
  padding: 6px 12px;
  background: #f5f7fa;

  i.fa {
    cursor: pointer;
    color: #666;
    border-radius: 112px;
    border: solid 1px #ccc;
    width: 26px;
    height: 26px;
    text-align: center;
    line-height: 26px;
    margin-right: 6px;
    background: #fff;

    &:hover {
      border-color: #409eff;
      box-shadow: 3px 3px 6px -3px #409eff;
      color: #fff;
      background: #409eff;
    }
  }
}
</style>
<style lang="scss">
.shape-bar {
  background: #fff;

  .el-collapse {
    .el-collapse-item {
      div[role="button"] {
        padding-left: 12px;
        padding-right: 12px;

        &:hover {
          color: #409eff;
        }
      }

      .el-collapse-item__content {
        padding-bottom: 0;
      }
    }
  }

  .el-tabs {
    .el-tabs__header {
      margin: 0;

      &.is-top {
        padding: 0 12px;
        background: #f5f7fa;
      }
    }
  }
}
</style>


