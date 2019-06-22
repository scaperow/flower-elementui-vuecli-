<template>
  <el-dialog v-loading="isSaving"
             :visible.sync="isShow"
             :width="imageUrl?'800px':'400px'"
             :close-on-click-modal="false">

    <div slot="title">
      <span v-if="imageUrl">裁剪图片</span>
      <span v-else>选择图片</span>
    </div>

    <transition-group>
      <div v-show="!imageUrl"
           key="GET_FILE_URL">

        <transition>
          <div v-show="isShowInput">
            <el-input type="url"
                      placeholder="请输入地址"
                      v-model="urlValue"></el-input>
            <el-button type="text"
                       @click="saveFileUrl">确定</el-button>
            <el-button type="text"
                       @click="isShowInput = false">取消</el-button>
          </div>
        </transition>

        <transition>
          <el-row v-show="!isShowInput">
            <el-col :span="10"
                    style="text-align:right">
              <el-link @click="isShowInput = true">导入网络图片</el-link>
            </el-col>
            <el-col :span="4"
                    class="text-center">
              <el-divider direction="vertical"
                          style="height:120px;"></el-divider>
            </el-col>
            <el-col :span="10">
              <clipper-upload accept="*,png,jpg,jpeg,gif"
                              v-model="imageUrl">

                <el-link>上传本地文件</el-link>
              </clipper-upload>
            </el-col>
          </el-row>
        </transition>
      </div>
      <div v-show="imageUrl"
           key="CLIP_FILE">
        <div class="clipper-container">
          <clipper-basic ref="clipper"
                         preview="preview"
                         :src="imageUrl"
                         :rotate="clipRotate"
                         :minWidth="40"
                         :minHeight="40"
                         :scale="clipScale">
            <div slot="placeholder">图片不正确</div>
          </clipper-basic>
          <div style="padding:18px">
            <div>
              <label>缩放</label>
              <el-slider :max="10"
                         :min="1"
                         v-model="clipScale"
                         :format-tooltip="(val)=> val+'倍'"></el-slider>
            </div>
            <div>
              <label>旋转</label>
              <el-slider :max="360"
                         :min="1"
                         v-model="clipRotate"
                         :format-tooltip="(val)=> val+'°'"></el-slider>
            </div>

          </div>
        </div>
        <div class="preview-container">
          <div class="wrapper">
            <clipper-preview name="preview">
            </clipper-preview>

          </div>
          <div style="margin-top:16px">
            <label>请输入图片名称</label>
            <el-input placeholder="图片名称便于查询"
                      v-model="pictureModel.name"></el-input>
          </div>
        </div>
      </div>
    </transition-group>
    <div slot="footer">
      <el-button @click="imageUrl = null">重新选择文件</el-button>

      <el-button type="primary"
                 @click="save">保存</el-button>
    </div>
  </el-dialog>
</template>
<script>
import OSS from 'ali-oss'
import Go, { Shape } from 'gojs'
import { clipperBasic, clipperPreview, clipperUpload } from 'vuejs-clipper'
import Http from '@/api/common.js'
import _ from 'lodash'
import helper from '@/helper'
import Vue from 'vue'
import Parse from 'parse'
import ShortId from 'shortid'

const { VUE_APP_UPLOAD_IMAGE_MAX_SIZE: maxSizeLimit = 1 } = process.env

let PictureModel = Parse.Object.extend('picture')
let pictureApi = Http.create('picture')
let hasSubscribe = false
let defaultNameCount = -1

export default {
  components: {
    clipperBasic,
    clipperPreview, clipperUpload
  },
  watch: {
    async isShow (val) {
      this.step = 'SET_FILE'
      this.isShowInput = false
      this.imageUrl = null
      this.urlValue = null
      this.isSaving = false

      this.pictureModel = {
        name: '我的图片',
        user: {
          id: 'testUser'
        },
        ossId: null
      }
    }
  },
  data () {
    return {
      pictureModel: {
        name: null,
        ossId: null
      },
      isSaving: false,
      previewName: null,
      clipRotate: 0,
      clipScale: 1,
      previewImage: null,
      step: 'SET_FILE',
      urlValue: null,
      isShowInput: false,
      imageUrl: null,
      isShow: false
    }
  },
  methods: {
    async save () {
      if (_.isEmpty(this.pictureModel.name)) {
        return this.$message.error('请输入图片名称')
      }

      this.isSaving = true

      let { AccessKeyId,
        AccessKeySecret,
        Expiration,
        SecurityToken } = await Parse.Cloud.run('assumeRole')

      let id = ShortId.generate()
      let client = new OSS({
        region: 'oss-cn-beijing',
        accessKeyId: AccessKeyId,
        accessKeySecret: AccessKeySecret,
        stsToken: SecurityToken,
        bucket: 'flower-dev'
      });



      let blob = this.$refs.clipper.clip().toBlob(async (blob) => {
        if (blob.size > maxSizeLimit * 1024 * 1024) {
          return this.$message.error(`图片不能大于 ${maxSizeLimit} M,请裁剪到小一点`)
        }

        if (blob) {
          try {
            this.pictureModel.ossId = id
            this.pictureModel.user = { id: 'testUser' }

            await client.put(`picture/testUser/${id}.png`, blob)
            await pictureApi.save(this.pictureModel)

            this.$notify.success('操作成功')
            this.isSaving = false
          } catch (error) {
            this.isSaving = false
            this.$message.error('图片上传失败, 请重试')
            throw error
          }
        } else {
          this.isSaving = false
          this.$message.error('发生错误, 请稍后重试')
        }
      }, 'image/jpeg')


    },
    afterDialogShow () {


    },
    show () {
      this.isShow = true
    },

    saveFileUrl () {
      if (_.isEmpty(this.urlValue)) {
        return this.$message.error('请输入正确的网络地址')
      }


      this.imageUrl = this.urlValue
      this.step = 'CLIP'
    }
  },
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
  background: #fff;
}

.clipper-container {
  vertical-align: top;
  display: inline-block;
  width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.preview-container {
  display: inline-block;
  width: 300px;
  vertical-align: top;
  margin-left: 24px;

  .wrapper {
    box-shadow: 6px 6px 6px -3px #666;
  }
}
</style>
<style lang="scss" scoped>
</style>


