<template>

  <div>
    <el-table>
      <el-table-column></el-table-column>
      <el-table-column></el-table-column>
      <el-table-column></el-table-column>
      <el-table-column></el-table-column>
      <el-table-column></el-table-column>
    </el-table>
    <el-dialog :visible.sync="isShowing">
      <el-form v-model="shapeModel">
        <el-form-item label="Name">
          <el-input v-model="shapeModel.name"></el-input>
        </el-form-item>

        <el-form-item label="Category">
          <div>
            <el-radio v-model="shapeModel.category"
                      :label="category"
                      v-for="(category,index) in categories"
                      :key="index">{{category}}</el-radio>
            <el-input style="width:180px;"
                      placeholder="New Category"
                      v-model="shapeModel.category"></el-input>
          </div>
        </el-form-item>
        <el-form-item label="Shape Category">
          <el-checkbox-group v-model="checkCategories">
            <el-checkbox v-for="(item,index) in shapeCategories"
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
  </div>
</template>
<script>
import Parse from 'parse'
import Http from '@/api/common.js'
import _ from 'lodash'
import { mapGetters } from 'vuex';

const ShapeClass = Parse.Object.extend('shape')
const ShapeQuery = new Parse.Query(ShapeClass)
const CategoryClass = Parse.Object.extend('shapeCategory')
const ShapeApi = Http.create('shape')
const ShapeCategoryApi = Http.create('shapeCategory')
const { VUE_APP_OSS_URL } = process.env

export default {
  computed: {
    ...mapGetters({ user: 'user/user' })
  },
  data () {
    return {
      shapeMetadata: null,
      shapeCategories: [],
      checkCategories: [],
      shapeModel: {},
      isShowing: false,
      createCategoryName: null,
      newCategoryName: null,
      selectCategories: [],
      categories: []
    }
  },
  watch: {
    checkCategories (val) {
      this.shapeModel.shapeCategory = _.filter(this.shapeCategories, (category) => _.includes(val, category.id))
    },
    shapeMetadata (val) {
      try {
        this.shapeModel.model = JSON.parse(val)
      } catch (error) { }
    }
  },

  methods: {
    async open () {
      this.categories = await Parse.Cloud.run('getCategoryList')
      this.shapeCategories = await new Parse.Query(CategoryClass).find()
      this.isShowing = true
    },
    handleCreateCategory () {
      this.isCreateCategory = true
    },
    async handleSaveShape () {
      if (_.isEmpty(this.shapeModel.model)) {
        return this.$message.error('Invalid json data');
      }

      await ShapeApi.save(this.shapeModel)

      this.$notify.success('Success !');
    },
    async handleSaveCategory () {
      await ShapeCategoryApi.save({
        name: this.createCategoryName
      })

      this.shapeCategories = await new Parse.Query(CategoryClass).find()
      this.$notify.success('Success！');
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
