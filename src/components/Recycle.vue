<template>
  <section class="recycle">
    <div style="margin-bottom:16px">
      <el-button :loading="isCreating"
                 type="primary"
                 @click="checkAll"><i class="iconfont icon-plus"></i> 全选</el-button>

      <el-button v-show="selection.length > 0"
                 :loading="isCreating"
                 @click="removeSelection"><i class="iconfont icon-clear"></i> 彻底删除</el-button>
      <el-button v-show="selection.length > 0"
                 :loading="isCreating"
                 @click="recoverySelection"><i class="iconfont icon-revert"></i> 还原</el-button>
    </div>
    <div style="margin-bottom:16px">
      <el-breadcrumb separator-class="el-icon-arrow-right"
                     v-show="folderPath.length > 0">

        <el-breadcrumb-item>
          <a type="text"
             @click.stop="backFolder(-1)">回收站</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="(folder,index) in folderPath"
                            :Key="index">
          <a @click.stop="backFolder(index)"><i class="iconfont icon-folder"></i> {{folder.attributes.name}}</a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <transition-group mode="out-in"
                      tag="div"
                      name="el-fade-in-linear">
      <div class="card"
           v-for="(workItem,index) in worksList"
           :key="index">

        <div class="content folder"
             v-if="workItem.attributes.isFolder === true">
          <img src="@/assets/folder.svg" />
        </div>
        <div v-else
             class="content document">
          <img fit="contain"
               :src="workItem.attributes.capture" />
        </div>
        <div class="menu">
          <button @click="remove(workItem,index)">彻底删除</button>
          <button @click="recovery(workItem,index)">还原</button>
        </div>
        <div class="footer">
          <label :title="workItem.attributes.name">
            <a @click="openFolder(workItem)"
               v-if="workItem.attributes.isFolder === true">{{workItem.attributes.name}}</a>
            <span v-else
                  :title="workItem.attributes.name">{{workItem.attributes.name}}</span>
          </label>
          <div class="buttons"
               style="float:right">
            <div class="checkbox"
                 @click.stop.prevent="check(workItem)"
                 :class="selection.indexOf(workItem.id) >= 0 ?'select':''">
              <i class="iconfont icon-check"></i>
            </div>
          </div>
        </div>
      </div>

    </transition-group>
    <transition name="el-zoom-in-center"
                mode="out-in">
      <div class="content-tip"
           v-show="worksList.length === 0 && !isLoadingData">
        <p>
          此处很干净 ~
        </p>
      </div>
    </transition>
  </section>
</template>
<script>

import Parse from 'parse'
import Http from '@/api/common'
import { mapGetters } from 'vuex'
const WorksClass = Parse.Object.extend('works')
const WorksApi = Http.create('works')



export default {
  computed: {
    ...mapGetters({
      user: 'user/user'
    }),
    currentFolder () {
      return _.last(this.folderPath)
    }
  },
  data () {
    return {
      selection: [],
      pageIndex: 0,
      pageSize: 10,
      worksList: [],
      worksTotal: 0,
      folderPath: [],
      isLoadingData: false,
      isCreating: false,
    }
  },
  watch: {
    folderPath () {
      this.worksList = []
      this.getData()
    }
  },
  activated () {
    this.getData()
  },
  deactivated () {
    this.worksList = []
  },
  mounted () {
    // this.getTotal()
    // this.getData()
  },
  methods: {
    removeSelection () {
      this.$confirm(`确认要删除选中的 ${this.selection.length} 项吗? 删除后将无法恢复, 是否继续?`, {
        confirmButtonText: '是',
        cancelButtonText: '否'
      }).then(async () => {
        this.isLoadingData = true

        try {
          var objects = _.chain(this.selection)
            .map((id) => _.find(this.worksList, { id: id }))
            .compact()
            .value()

          await Parse.Object.destroyAll(objects)

          this.worksList = this.worksList.filter((item) => {
            return this.selection.indexOf(item.id) < 0
          })
          this.selection = []
          this.$notify.success('操作成功')
        } catch ({ message, code }) {
          this.$message.error(message)
        }

        this.isLoadingData = false
      })
    },
    recoverySelection () {
      this.$confirm(`是否要还原选中的 ${this.selection.length} 项吗? `, {
        confirmButtonText: '是',
        cancelButtonText: '否'
      }).then(async () => {
        this.isLoadingData = true

        try {
          var objects = _.chain(this.selection)
            .map((id) => _.find(this.worksList, { id: id }))
            .compact()
            .each((model) => model.unset('isDelete'))
            .value()

          await Parse.Object.saveAll(objects)

          this.worksList = this.worksList.filter((item) => {
            return this.selection.indexOf(item.id) < 0
          })
          this.selection = []
          this.$notify.success('操作成功')
        } catch ({ message, code }) {
          this.$message.error(message)
        }

        this.isLoadingData = false
      })
    },
    check (model) {
      let index = _.indexOf(this.selection, model.id)

      if (index > -1) {
        this.selection.splice(index, 1)
      } else {
        this.selection = [...this.selection, model.id]
      }
    },
    checkAll () {
      this.selection = _.map(this.worksList, (workItem) => {
        return workItem.id
      })
    },
    openFolder (folder) {
      this.folderPath = [...this.folderPath, folder]
    },
    openDocument (document) {
      this.$router.push({
        path: '/editor/' + document.id
      })
    },
    backFolder (index) {
      let offset = index + 1

      if (offset !== this.folderPath.length) {
        return this.folderPath.splice(offset)
      }
    },
    async createFlowchart () {
      this.isCreating = true

      let model = {
        name: '新建流程图',
        creator: this.user.objectId,
        parentId: _.get(this.currentFolder, 'id')
      }

      try {
        let result = await WorksApi.save(model)

        this.$router.push({
          path: '/editor/' + result.id
        })
        this.isCreating = false
      } catch (error) {
        this.isCreating = false
        throw error
      }
    },
    commandFile (commander) {
      switch (commander) {
        case 'FLOWCHART':
          this.createFlowchart()
          break

        case 'MINDMAP':
          break

        case 'DATACHART':
          break
      }
    },
    async remove (model, index) {
      this.$confirm('删除后将无法恢复, 是否继续?', {
        confirmButtonText: '是',
        cancelButtonText: '否'
      }).then(async () => {
        this.isLoadingData = true

        try {
          await model.destroy()
          this.$notify.success('已删除')
          this.worksList.splice(index, 1)
        } catch ({ message, code }) {
          this.$message.error(message)
        }

        this.isLoadingData = false
      })
    },
    async recovery (model, index) {
      this.isLoadingData = true

      try {
        model.unset('isDelete')
        await model.destroy()
        this.$notify.success('已删除')
        this.worksList.splice(index, 1)
      } catch ({ message, code }) {
        this.$message.error(message)
      }

      this.isLoadingData = false
    },
    async commandFolder (command) {
      const [commander, id] = command.split('_')

      let model = _.find(this.worksList, { id: id })

      if (commander && model) {
        switch (commander) {
          case 'REMOVE':
            var confirmResult = null
            if (model.attributes.isFolder === true) {
              confirmResult = this.$confirm('该操作会将文件夹内的所有内容一并删除, 是否继续?', {
                confirmButtonText: '是',
                cancelButtonText: '否'
              })
            } else {
              confirmResult = this.$confirm('是否确认删除?', {
                confirmButtonText: '是',
                cancelButtonText: '否'
              })
            }

            confirmResult.then(async () => {
              model.set('isDelete', true)
              this.isLoadingData = true

              try {
                await model.save()
                this.$notify.success('已删除')
                this.isLoadingData = false

                _.remove(this.worksList, (item) => item.id === model.id)
              } catch (error) {
                this.isLoadingData = false
                throw error
              }
            })
            break;

          case 'RENAME':
            this.$prompt('请输入新的名称', '提示',
              {
                closeOnClickModal: false,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,50}$/,
                inputPlaceholder: '只能输入字母、汉字、数字和下划线，3~50位长度',
                inputErrorMessage: '只能输入字母、汉字、数字和下划线，3~50位长度',
                inputValue: model.attributes.name
              }).then(async ({ value }) => {
                this.isLoadingData = true

                let previousValue = model.attributes.name
                model.set('name', value)

                try {
                  let result = await WorksApi.save(model)
                  this.worksList = [...this.worksList, result]
                  this.isLoadingData = false
                } catch ({ message }) {
                  model.set('name', previousValue)

                  this.isLoadingData = false
                  this.$message.error(message)
                  throw error
                }
              });
            break;
        }
      }
    },
    async getTotal () {
      this.worksTotal = await new Parse.Query(WorksClass).
        equalTo('creator', this.user.objectId).
        equalTo('isDelete', true).
        count()
    },
    async getData () {
      this.isLoadingData = true
      let parentId = _.get(this.currentFolder, "id")
      let data = await new Parse.Query(WorksClass)
        .equalTo('creator', this.user.objectId)
        .equalTo('parentId', parentId)
        .equalTo('isDelete', true)
        .find()

      this.worksList = [...this.worksList, ...data]
      this.isLoadingData = false
    },

  }
}
</script>
<style lang="scss" scoped>
@import "@/style/variables.scss";

section.recycle {
  .el-main {
    .card {
      display: inline-block;
      margin: 0 24px 18px 0;
      background: transparent;
      position: relative;
      vertical-align: bottom;

      .checkbox {
        width: 25px;
        height: 25px;
        border-radius: 15px;
        display: block;
        border: solid 1px #f0f0f0;
        color: $--color-info;
        text-align: center;
        line-height: 25px;
        font-size: 10px;
        cursor: pointer;

        &.select {
          background: $--color-primary;
          color: #fff;
        }
      }

      .menu {
        position: absolute;
        top: 0;
        left: 0;
        width: 180px;
        height: 180px;
        opacity: 0;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        button {
          font-size: 12px;
          border: 0;
          color: $--color-primary;
          cursor: pointer;
          background: none;
          margin: 6px;
        }
      }

      &:hover {
        .menu {
          opacity: 1;
        }

        .content {
          filter: blur(4px) contrast(50%);
        }
      }

      .content {
        padding: 0;
        margin: 0;
        cursor: pointer;
        transition: all 0.3s;
      }

      .footer {
        width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 10px;
        bottom: 0;
        border-radius: 0 0 2px 2px;
        height: 30px;
        line-height: 30px;

        label {
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          max-width: 130px;

          a {
            color: $--color-primary;
          }

          span {
            color: #999;
          }
        }
      }

      .folder {
        img {
          width: 180px;
          height: 180px;
          transition: all 0.3s;
        }
      }

      .document {
        overflow: hidden;
        border: solid 1px #f3f3f3;

        img {
          width: 180px;
          height: 180px;
          transition: all 0.3s;
          object-fit: contain;
        }
      }
    }
  }
}
</style>



