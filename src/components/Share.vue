<template>
  <el-dialog class="share"
             width="760px"
             :visible.sync="isOpening"
             :close-on-click-modal="false"
             v-loading="isLoading">
    <el-tabs tab-position="left">
      <el-tab-pane label="通过链接分享">
        <div class="tip"
             style="margin-bottom:32px"
             :closable="false">
          复制并下方链接并发送给对方, 获取此链接的人都可以查看该文件
        </div>
        <div>
          <p>

            <el-switch v-model="shareModel.shareWithLink"
                       active-text="启用"
                       inactive-text="禁用"
                       @change="onSwitchLinkShare">
            </el-switch>
          </p>
          <el-form ref="form"
                   :disabled="!shareModel.shareWithLink"
                   :model="shareModel">

            <el-form-item label="链接地址"
                          :disabled="!shareModel.shareWithLink">
              <el-popover width="160"
                          v-model="isCreateShareLink">
                <div>
                  <p>生成新链接会使以前的链接失效, 是否继续 ?</p>
                  <el-button slot="reference"
                             type="primary"
                             size="mini"
                             @click="createShareLink">继续</el-button>
                  <el-button slot="reference"
                             type="text"
                             @click="isCreateShareLink = false">取消</el-button>
                </div>
                <el-button v-show="shareModel.shareWithLink"
                           slot="reference"
                           type="text">重新生成一个链接</el-button>
              </el-popover>
              <el-input readonly
                        v-model="shareLink">
                <template slot="append">
                  <el-button title="复制地址"
                             @click="copyToClipboard(shareLink)"><i class="iconfont icon-copy"></i></el-button>
                </template>
              </el-input>

            </el-form-item>
            <el-form-item label="访问密码"
                          prop="password"
                          :error="passwordError">
              <el-button @click="randomPassword"
                         type="text"
                         v-show="shareModel.shareWithLink">生成一个随机密码</el-button>
              <el-button @click="savePassword"
                         size="mini"
                         type="primary"
                         v-if="$refs.form"
                         v-show="dirtyPassword">保存密码</el-button>
              <el-input v-model="sharePassword"
                        placeholder="如果不设置访问权限, 请留空密码">
              </el-input>

            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane label="通过图片分享">
        <div class="tip"
             style="margin-bottom:32px"
             :closable="false">
          复制并下方链接并发送给对方, 获取此链接的人都可以查看该文件
        </div>
        <div>
          <el-form>
            <el-form-item label="链接地址">
              <el-input v-model="shareImage"
                        readonly>
                <template slot="append">
                  <el-button title="复制地址"
                             @click="copyToClipboard(shareImage)"><i class="iconfont icon-copy"></i></el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane label="嵌入到其它站点">

        <div class="tip"
             style="margin-bottom:32px"
             :closable="false">
          您可以通过 iframe 的方式嵌入到第三方网站
        </div>
        <p>
          <p>
            <label>宽度(px)</label>
            <el-input-number v-model="shareModel.width"
                             controls-position="right"
                             size="mini"
                             :min="200"
                             :max="1920"></el-input-number>

            <label>高度(px)</label>
            <el-input-number v-model="shareModel.height"
                             controls-position="right"
                             size="mini"
                             :min="200"
                             :max="1080"></el-input-number>

            <el-button size="mini"
                       @click="copyToClipboard(shareMedia)"
                       type="primary">复制下方代码</el-button>
          </p>

          <el-input type="textarea"
                    :rows="5"
                    readonly
                    :value="shareMedia"></el-input>

        </p>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>

import Parse from 'parse'
import Http from '@/api/common'
import { mapGetters } from 'vuex'
import NanoId from 'nanoid'

const ShareClass = Parse.Object.extend('share')
const ShareApi = Http.create('share')
const { VUE_APP_SITE_DOMAIN } = process.env
const copyToClipboard = function (text) {
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
  computed: {
    dirtyPassword () {
      return !_.isEqual(this.shareModel.password || null, this.sharePassword || null) && !this.passwordError
    },
    shareLink () {
      if (this.shareModel.link) {
        return `${VUE_APP_SITE_DOMAIN}/share/?id=${this.shareModel.link}`
      }

      return null
    },
    shareImage () {
      if (this.shareModel.static) {
        return `${VUE_APP_SITE_DOMAIN}/share/static/${this.shareModel.static}.png`
      }

      return null
    },
    shareMedia () {
      let url = `${VUE_APP_SITE_DOMAIN}/share/media/${this.shareModel.media}`
      let code = `<iframe  frameborder="0" style="display:block;width:${this.shareModel.width}px; height:${this.shareModel.height}px;" src="${url}"></iframe>`

      return code
    },
    passwordError () {
      if (this.sharePassword) {
        if (/^[\d\w\!\@\#\$\%\^&\*\(\)\-\_\+\=]+$/g.test(this.sharePassword) === false) {
          return this.messageValidation = '密码只能包含数字、字母或字符"!@#$%^&*()-_=+"'
        }

        if (this.sharePassword.length > 30) {
          return this.messageValidation = '密码不能超过30位'
        }

        if (this.sharePassword.length < 6) {
          return this.messageValidation = '密码不能少于6位'
        }
      }

      return null
    }
  },
  data () {
    return {
      shareObject: null,
      sourceId: null,
      passwordValidation: null,
      isOpening: false,
      isLoading: false,
      shareMessage: '',
      isSavingPassword: false,
      sharePassword: null,
      pageIndex: 0,
      pageSize: 10,
      worksList: [],
      worksTotal: 0,
      folderPath: [],
      isCreating: false,
      isCreateShareLink: false,
      shareModel: {}
    }
  },
  watch: {
  },
  mounted () {
    // this.getTotal()
    // this.getData()
  },
  methods: {
    open (id) {
      var shareQuery = new Parse.Query(ShareClass)

      this.sourceId = id
      this.isOpening = true

      this.$nextTick(async () => {
        this.isLoading = true

        try {
          this.shareObject = await shareQuery.equalTo('source', id).first()

          if (this.shareObject) {
            this.shareModel = this.shareObject.toJSON()
          }

          this.shareModel = _.defaults(this.shareModel, {
            static: NanoId(10),
            media: NanoId(10),
            password: null,
            width: 500,
            height: 500
          })

          this.sharePassword = this.shareModel.password

        } catch ({ message }) {
          this.$message.error(message)
          this.isOpening = false
        }

        this.isLoading = false
      })
    },
    async savePassword () {
      this.isSavingPassword = true
      this.saveModel({
        password: this.sharePassword
      })
      this.isSavingPassword = false
    },
    randomPassword () {
      this.sharePassword = NanoId(6)
    },
    async createShareLink () {
      this.isCreateShareLink = false
      this.saveModel({ link: NanoId(10) })
    },
    onSwitchLinkShare (isOpen) {
      var changes = { shareWithLink: isOpen }

      if (isOpen) {
        if (!this.shareModel.link) {
          changes.link = NanoId(10)
        }
      }

      this.saveModel(changes)
    },
    onSwitchImageShare (isOpen) {
      var changes = { shareWithImage: isOpen }

      if (isOpen) {
        if (!this.shareModel.image) {
          changes.image = NanoId(10)
        }
      }

      this.saveModel(changes)
    },
    copyToClipboard (text) {
      copyToClipboard(text)

      this.$message.success('已复制到剪切板')
    },
    async saveModel (changes) {
      try {
        this.shareObject = await ShareApi.update(this.shareObject, {
          source: this.sourceId,
          ...changes
        })
        this.shareModel = this.shareObject.toJSON()
        this.$message.success('设置已保存')
      } catch ({ message }) {
        this.$message.error(message)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.share {
  padding: 0 16px;
}
</style>
<style lang="scss">
.share {
  .el-tabs__content {
    padding-left: 16px !important;
  }
}
</style>



