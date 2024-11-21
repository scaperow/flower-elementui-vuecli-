<template>

  <section class="file-list">
    <div>

    </div>
    <div style="margin-bottom:16px">
      <el-breadcrumb separator-class="el-icon-arrow-right">

        <el-breadcrumb-item>
          <a type="text"
             @click.stop="backFolder(-1)">{{rootName}}</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="(folder,index) in folderPath"
                            :Key="index">
          <a @click.stop="backFolder(index)"><i class="iconfont icon-folder"></i> {{folder.attributes.name}}</a>
        </el-breadcrumb-item>

        <button text
                @click.stop="createFolder()"> 创建文件夹</button>
      </el-breadcrumb>
    </div>
    <div v-loading="isLoadingData">
      <transition-group tag="div"
                        mode="in-out"
                        name="el-fade-in-linear">
        <div class="card"
             v-for="(workItem,index) in worksList"
             :key="index">

          <div @click.stop="openFolder(workItem)"
               class="content folder"
               v-if="workItem.attributes.isFolder === true">
            <img src="@/assets/folder.svg" />
          </div>
          <div v-else
               class="content document"
               @click.prevent="openDocument(workItem)">
            <img fit="contain"
                 :src="workItem.attributes.capture" />
          </div>
          <div class="footer">
            <label :title="workItem.attributes.name">{{workItem.attributes.name}}</label>
            <div class="buttons"
                 style="float:right">
              <el-dropdown @command="commandFolder"
                           type="text">
                <button round
                        @click.stop="()=>{}"><i class="iconfont icon-drop-down"></i></button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="`RENAME_${workItem.id}_${index}`">重命名</el-dropdown-item>
                  <el-dropdown-item :command="`REMOVE_${workItem.id}_${index}`">删除</el-dropdown-item>
                  <el-dropdown-item v-if="!workItem.attributes.isFolder"
                                    :command="`SHARE_${workItem.id}_${index}`"
                                    divided>分享</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </div>

        <div class="content-tip"
             v-show="worksList.length === 0 && !isLoadingData"
             key="empty-tip">
          <p>
            <i class="iconfont icon-cry"></i> 此处毫无进展 ~
          </p>
        </div>
      </transition-group>

    </div>
    <share-modal ref="shareModal"></share-modal>
    <create-modal ref="createModal"></create-modal>
  </section>
</template>
<script>

import Parse from 'parse'
import Http from '@/api/common'
import { mapGetters } from 'vuex'
import NanoId from 'nanoid'
import ShareModal from './Share'
import CreateModal from './Create'
const ShareClass = Parse.Object.extend('share')
const WorksClass = Parse.Object.extend('works')
const WorksApi = Http.create('works')
const ShareApi = Http.create('share')
const { VUE_APP_SITE_DOMAIN } = process.env
function copyToClipboard (text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return clipboardData.setData("Text", text);

  } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");  // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}


export default {
  props: {
    filter: Object,
    rootName: String,
  },
  computed: {
    ...mapGetters({
      user: 'user/user'
    }),
    currentFolder () {
      return _.last(this.folderPath)
    }
  },
  components: {
    ShareModal, CreateModal
  },
  data () {
    return {
      isSavingPassword: false,
      pageIndex: 0,
      pageSize: 10,
      worksList: [],
      worksTotal: 0,
      folderPath: [],
      isLoadingData: false,
      isCreating: false,
      isSharing: false,
    }
  },
  watch: {
    folderPath () {
      this.worksList = []
      this.getData()
    },
    filter () {
      if (this.filter) {
        this.getData()
      }
    }
  },

  mounted () {
    // this.getTotal()
    // this.getData()
  },
  deactivated () {
    this.worksList = []
  },
  activated () {
    this.getData()
  },
  methods: {
    openFolder (folder) {
      this.folderPath = [...this.folderPath, folder]
    },
    openDocument (document) {
      this.$router.push({
        name: 'map',
        params: {
          id: document.id
        }
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
    onCreate ({ id }) {
      this.$router.push({
        name: 'map',
        params: {
          id
        }
      })
    },
    createFile () {
      this.$refs.createModal.open()
    },
    async commandFolder (command) {
      const [commander, id, index] = command.split('_')

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
                this.worksList.splice(index, 1)
              } catch (error) {
                throw error
              }

              this.isLoadingData = false
            })
            break;

          case 'RENAME':
            this.$prompt('请输入新的名称', '提示',
              {
                closeOnClickModal: false,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,25}$/,
                inputPlaceholder: '只能输入字母、汉字、数字和下划线，3~50位长度',
                inputErrorMessage: '只能输入字母、汉字、数字和下划线，3~50位长度',
                inputValue: model.attributes.name
              }).then(async ({ value }) => {
                this.isLoadingData = true

                let previousValue = model.attributes.name
                model.set('name', value)

                try {
                  let result = await WorksApi.save(model)
                  this.worksList.splice(index, 1, model)
                  this.isLoadingData = false
                } catch ({ message }) {
                  model.set('name', previousValue)

                  this.isLoadingData = false
                  this.$message.error(message)
                  throw error
                }
              });
            break;

          case 'SHARE':
            this.$refs.shareModal.open(id)
            break;
        }
      }
    },
    onSwitchShare (isOpen) {
      if (isOpen) {
        if (!this.shareModel.link) {
          this.shareModel.link = NanoId(10)
        }
      }
    },
    async getTotal () {
      this.worksTotal = await new Parse.Query(WorksClass).
        equalTo('creator', this.user.objectId).
        doesNotExist('isFolder').
        doesNotExist('isDelete').count()
    },
    async getData () {
      if (this.filter) {
        this.isLoadingData = true
        var list = []

        try {
          list = await this.filter.equalTo('parentId', _.get(this.currentFolder, "id")).find()
        } catch (e) {
          this.$catch(e)
        }

        this.worksList = [...this.worksList, ...list]
        this.isLoadingData = false
      }
    },
    async createFolder () {
      this.$prompt('请输入文件夹名称', '提示',
        {
          closeOnClickModal: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,50}$/,
          inputPlaceholder: '只能输入字母、汉字、数字和下划线，3~50 位长度',
          inputErrorMessage: '只能输入字母、汉字、数字和下划线，3~50 位长度',
          inputValue: '默认文件夹'
        }).then(async ({ value }) => {
          this.isLoadingData = true

          let model = {
            name: value,
            isFolder: true,
            creator: this.user.objectId,
            parentId: _.get(this.currentFolder, 'id')
          }

          try {
            let result = await WorksApi.save(model)
            this.worksList = [...this.worksList, result]
            this.isLoadingData = false
          } catch (error) {
            this.$catch(error)
          }

          this.isLoadingData = false
        });
    },

  }
}
</script>
<style lang="scss" scoped>
@import "@/style/variables.scss";

section.file-list {
  & /deep/ .el-breadcrumb {
    font-size: 20px;

    .el-breadcrumb__inner {
      a {
        font-weight: 200;
      }
    }

    button {
      font-size: 14px;
      background: #fff;
      border: none;
      color: $--color-secondary;
      cursor: pointer;
    }
  }

  .card {
    display: inline-block;
    margin: 0 24px 18px 0;
    background: transparent;
    position: relative;
    vertical-align: bottom;

    .content {
      cursor: pointer;
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
        color: #999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        max-width: 130px;
      }

      button {
        background: #fff;
        color: $--color-text-regular;
        border: none;
        cursor: pointer;

        &:hover {
          background: $--background-color-base;
        }
      }
    }

    .folder {
      img {
        width: 180px;
        height: 180px;
        transition: all 0.3s;

        &:hover {
          filter: drop-shadow(5px 5px 10px #ccc);
        }
      }
    }

    .document {
      overflow: hidden;
      border: solid 1px #f3f3f3;

      &:hover {
        box-shadow: $--box-shadow-light;
      }

      img {
        width: 180px;
        height: 180px;
        transition: all 0.3s;
        object-fit: contain;

        &:hover {
          transform: scale(1.2, 1.2);
        }
      }
    }
  }

  .share {
    padding: 0 16px;
  }
}
</style>



