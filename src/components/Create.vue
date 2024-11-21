<template>
  <el-dialog :visible.sync="isShowing"
             :close-on-click-modal="false"
             width="850px"
             title="创建蓝图"
             class="create-modal">
    <div class="container">
      <div class="search text-right">
        <el-input v-model="searchKeyword"
                  style="width:280px;"
                  placeholder="搜索可以创建的蓝图">
        </el-input>
      </div>

      <div class="content">
        <div class="categories"
             v-show="!searchKeyword">
          <div class="item"
               :class="{'select':selectCategory === '*'}"
               @click="selectCategory = '*'">所有分类</div>
          <div class="item"
               :class="{'select':selectCategory && selectCategory === category}"
               v-for="(category,index) in categories"
               @click="selectCategory = category;selectMap = null;"
               :key="index">
            {{category}}
          </div>
        </div>
        <div class="list">
          <transition-group tag="div"
                            name="el-fade-in-linear"
                            mode="out-in">
            <div v-for="(map,index) in filterMaps"
                 :key="index"
                 class="item"
                 :class="{'select':map === selectMap}"
                 @click="selectMap = map">
              {{map.get('label')}}
            </div>
            <div key="empty-message"
                 class="content-tip"
                 v-show="filterMaps.length ===0">
              暂无结果
            </div>
          </transition-group>
        </div>
      </div>
      <div class="footer"
           style="text-align:right"
           v-show="selectMap">
        <button class="button"
                secondary
                @click="create">创建 <i class="iconfont icon-right"></i></button>

        <!-- <el-button :disabled="selectMap === null">从模板创建</el-button> -->
      </div>
    </div>
  </el-dialog>
</template>
<script>
import _ from 'lodash'
import Parse from 'parse'
import Http from '@/api/common'
import { mapGetters } from 'vuex'

const WorksApi = Http.create('works')
const WorksClass = Parse.Object.extend('works')

export default {
  computed: {
    ...mapGetters({
      user: 'user/user',
      maps: 'maps/list',
    }),
    categories () {
      var result = []

      if (this.maps) {
        _.each(this.maps, (map) => result.push(...map.get('category')))
        result = Array.from(new Set(result))
      }

      return result
    },
    filterMaps () {
      return _.chain(this.maps)
        .filter((map) => {
          if (!_.isEmpty(this.searchKeyword)) {
            var matchCategory = _.findIndex(map.get('category'), (category) => category.indexOf(this.searchKeyword) > -1) > -1
            var matchLabel = map.get('label').indexOf(this.searchKeyword) > -1
            console.log(matchCategory + '-' + matchLabel)
            if (matchCategory || matchLabel) {
              return true
            }

            return false
          }

          if (this.selectCategory === '*') {
            return true
          }

          if (!_.isEmpty(this.selectCategory)) {
            return map.get('category').indexOf(this.selectCategory) > -1
          }
        })
        .value()
    }
  },
  data () {
    return {
      selectCategory: '*',
      searchKeyword: null,
      selectMap: null,
      isShowing: false
    }
  },
  created () {
    this.getMaps()
  },
  methods: {
    open () {
      this.isShowing = true
    },
    async create () {
      var style = await this.$store.dispatch('style/getPredefine')

      try {
        var model = {
          map: this.selectMap.get('name'),
          name: `新建${this.selectMap.label}`,
          creator: this.user.objectId,
          style: style,
          raw: this.selectMap.get('model')
        }
        var { id } = await WorksApi.save(model)

        this.$emit('create', {
          id
        })
      } catch ({ code, message }) {
        this.$message.error(message)
      }
    },
    async getMaps () {
      await this.$store.dispatch('maps/getList')
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/style/variables.scss";
.create-modal {
  .container {
    display: flex;
    flex-direction: column;

    .search {
      margin-bottom: 24px;

      /deep/ .el-input {
        input[type="text"] {
          border-radius: 40px;
        }
      }
    }
  }

  .content {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    padding-top: 0;
    background: $--background-color-base;
    border-radius: 10px;
    padding: 16px;

    .categories {
      width: 120px;

      .item {
        cursor: pointer;
        text-align: left;
        padding: 10px 14px;
        border-radius: 6px;

        &.select {
          background: lighten($--color-primary, 20%);
          color: $--color-white;
        }
      }
    }

    .list {
      height: 460px;
      overflow-y: auto;
      text-align: right;
      flex-grow: 1;
      width: 100%;

      .item {
        overflow: hidden;
        text-align: center;
        width: 80px;
        height: 120px;
        display: inline-block;
        cursor: pointer;
        padding: 12px;
        margin: 6px;
        text-align: center;
        vertical-align: middle;
        line-height: 120px;
        font-size: 16px;
        color: $--color-text-secondary;
        border: solid 1px #f3f3f3;
        transition: all 0.3s;
        // text-shadow: 2px 2px #f3f3f3;
        background: #fff;

        &.select {
          color: $--color-primary;
          box-shadow: 0 0 16px 0 #3333;
        }
      }
    }
  }

  .footer {
    padding: 12px 0;
  }
}
</style>


