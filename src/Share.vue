<template>
  <div id="app"
       :loading="isLoading">
    <div class="header">

    </div>
    <div v-show="!model">
      <div v-show="error === codes.OBJECT_NOT_FOUND"
           class="message">
        该文件不存在或已删除
      </div>
      <div v-show="error === codes.INVALID_SESSION_TOKEN || error === codes.VALIDATION_ERROR"
           class="form"
           :class="{'error':error === codes.VALIDATION_ERROR}">
        <i class="iconfont icon-lock"
           v-show="error === codes.INVALID_SESSION_TOKEN">请输入密码查看</i>

        <i class="iconfont icon-cry "
           v-show="error === codes.VALIDATION_ERROR">密码不正确请重新输入</i>

        <div style="margin-top:16px;">
          <input type="text"
                 v-model="password"
                 autofocus />
          <transition name="el-zoom-in-center">
            <button v-show="password.length >= 6"
                    @click="access">访问</button>
          </transition>
        </div>
      </div>
    </div>
    <div id="canvas"
         v-show="model">
    </div>
    <div class="footer"
         v-show="model">

      <button title="访问蓝图巴巴官网"
              class="logo">
        蓝图巴巴
      </button>
      <button title="放大"
              @click="zoomIn()"><i class="iconfont icon-zoom-out"></i></button>
      <button title="缩小"
              @click="zoomOut()"><i class="iconfont icon-zoom-in"></i></button>
      <button title="全屏"
              @click="fullScreen()"><i class="iconfont icon-fullscreen"></i></button>
    </div>
  </div>
</template>

<script>
import { Loading, Message } from 'element-ui'
import Parse from 'parse'
import _ from 'lodash'
import Go from 'gojs'
import { TemplateMaker } from '@/map'

const $ = Go.GraphObject.make
const { makeLinkTemplate, makeGroupTemplate, makeGridTemplate, makeToolManager, updateScales, makeResizingTool, setupScalesAndIndicators, unsetupScalesAndIndicators, makeRelinkTool, makeDraggingTool, makeRotatingTool } = TemplateMaker
const WorksClass = Parse.Object.extend('works')

let url = new URL(location.href)
let id = url.searchParams.get('id')
let password = url.searchParams.get('key')
let canvas = null
export default {
  name: "app",
  data () {
    return {
      codes: Parse.Error,
      error: false,
      isLoading: false,
      model: null,
      password: password || ''
    }
  },
  components: {
    Loading, Message
  },
  methods: {
    createDiagram () {
      canvas =
        $(Go.Diagram,
          'canvas',
          {
            allowClipboard: false,
            allowCopy: false,
            allowDelete: false,
            allowGroup: false,
            allowDragOut: false,
            allowHorizontalScroll: false,
            allowInsert: false,
            allowLink: false,
            allowRelink: false,
            allowReshape: false,
            allowResize: false,
            allowRotate: false,
            allowTextEdit: false,
            allowUndo: false,
            allowUngroup: false,
            allowVerticalScroll: false,
            allowSelect: true,
            minScale: 0.01,
            maxScale: 100,
            nodeTemplateMap: map,
            ...makeGroupTemplate(),
            ...makeLinkTemplate(),
          });

      canvas.model = go.Model.fromJson(this.model.attributes.raw)
    },
    async access () {
      url.searchParams.set('key', this.password)

      location.href = url.toString()
    },
    async getData () {
      this.isLoading = true

      try {
        this.model = await Parse.Cloud.run('shareFile', {
          id,
          password: this.password
        })

        if (!_.isEmpty(this.model)) {
          this.createDiagram()
        }
      } catch ({ code, message }) {
        this.error = code;
      }
    },
    fullScreen () {

    },
    zoomIn () {

    },
    zoomOut () {

    }
  },

  mounted () {
    this.getData()
  }
}
</script>

<style lang="scss">
@import "@/style/variables.scss";
body,
html {
  height: 100%;
  min-height: 100%;
  padding: 0;
  margin: 0;
}

* {
  letter-spacing: 1px;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #fff;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    .footer {
      opacity: 0.4;
    }
  }

  .message {
    padding: 32px;
    font-size: 16px;
    transition: all 0.3s;
    background: #f3f2e962;
    color: #666;
    border-radius: 12px;
  }

  .form {
    background: $--color-primary;
    color: $--color-white;
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 0 16px 0 $--color-primary;

    .fa {
      &::after {
        margin-left: 12px;
      }

      &::before {
        margin-right: 12px;
      }
    }
    &.error {
      background: $--color-danger;
      box-shadow: 0 0 16px 0 $--color-danger;

      button {
        color: $--color-danger;

        &:hover {
          background: $--color-danger-light;
        }
      }
    }

    input[type="text"] {
      width: 120px;
      border-radius: 6px;
      padding: 12px;
      border: none;
      background: #f3f2e962;
      color: $--color-white;
    }

    button {
      min-width: 45px;
      background: $--color-white;
      margin-left: 6px;
      color: $--color-primary;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      padding: 10px 12px;

      &:hover {
        background: $--color-primary-light-2;
        color: $--color-white;
      }
    }
  }
  #canvas {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;

    &:hover {
      .footer {
        opacity: 0.4;
      }
    }
  }

  .footer {
    position: absolute;
    bottom: 16px;
    margin: auto;
    transition: all 0.3s;
    z-index: 10;
    text-align: center;
    color: $--color-white;

    button {
      margin: -4px;
      background: $--color-primary;
      color: #fff;
      border: none;
      cursor: pointer;
      text-align: center;
      vertical-align: middle;
      height: 48px;
      line-height: 48px;
      padding: 0 10px;
      transition: all 0.3s;

      &:hover {
        background: $--color-primary-light-4;
      }

      &:first-of-type {
        border-top-left-radius: 32px;
        border-bottom-left-radius: 32px;
        padding-left: 18px;
      }

      &:last-of-type {
        border-top-right-radius: 32px;
        border-bottom-right-radius: 32px;
        padding-right: 18px;
      }

      &.logo {
        background: url("./assets/logo.png");
        background-color: $--color-primary;
        background-repeat: no-repeat;
        background-size: 32px 32px;
        background-position: 6px;
        cursor: pointer;
        padding-left: 40px !important;
        font-size: 18px;

        &:hover {
          background-color: #666;
        }
      }

      .fa {
        font-size: 28px;
        vertical-align: middle;
      }
    }

    &:hover {
      opacity: 1;
    }
  }
}
</style>

