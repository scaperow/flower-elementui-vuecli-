import go from 'gojs'
import _ from 'lodash'
import Commander from './extentions/Commander'
import TextEditingTool from './extentions/TextEditor'
import ToolMaker from './toolMaker'
import TemplateMaker from './templateMaker'


let $ = go.GraphObject.make
let onModelChange = null

/**
 * 将 style 于 setting 重复样式写入到新的样式之中,并返回新的样式
 * @param {*} styleObject 
 * @param {*} setting
 * @returns {*} new style Object
 */
const mixinSettingToStyle = function (styleObject, setting) {
  var result = _.clone(styleObject)
  let { meshColor, ruleColor, background } = setting
  let { root } = result

  if (!_.isEmpty(meshColor)) {
    _.set(root, 'meshColor', meshColor)
  }

  if (!_.isEmpty(ruleColor)) {
    _.set(root, 'ruleColor', ruleColor)
  }

  if (!_.isEmpty(background)) {
    _.set(root, 'background', background)
  }

  return result
}

/**
   * 将 css style object 直接应用于 canvas 对应的 div 之上
   * @param {*} key 
   * @param {*} style 
   */
const setCanvasWrapperStyle = function (canvas, key, style) {
  canvas.div.style[key] = style
  canvas.requestUpdate()
}

class Maps {
  setting = null
  style = null
  canvas = null
  model = null
  toolMaker = null
  templateMaker = null
  allowActions = []
  modelChangedListener = []
  mapChangeListener = []
  settingChangeListener = []
  styleChangeListener = []

  constructor(style, setting, model) {
    if (setting) {
      this.setting = setting
    }

    if (style) {
      this.style = style
    }

    this.model = model
    onModelChange = this.onModelChange.bind(this)
  }

  /**
   * 挂载
   * @param {*} elementId 
   */
  mount (elementId) {
    this.canvas = $(go.Diagram, elementId)
    this.canvas.commandHandler = new Commander()
    this.canvas.commandHandler.arrowKeyBehavior = 'select'
    this.canvas.toolManager.textEditingTool.defaultTextEditor = TextEditingTool


    this.toolMaker = new ToolMaker(mixinSettingToStyle(this.style, this.setting), this.canvas)
    this.templateMaker = new TemplateMaker(this.style, this.canvas)
    this.templateMaker.registeShortcuts(this.canvas)

    this.applySetting(this.setting)
  }

  /**
   * 绑定事件，一般由子类来调用
   */
  bindEvents () {
    this.canvas.addModelChangedListener(onModelChange)
  }

  /**
   * 循环选中
   * @param {*} callback 
   * @param {*} onFinish 
   */
  loopSelection (callback, onFinish) {
    var it = this.canvas.selection.iterator
    while (it.next()) {
      callback.call(this, it.value, it)
    }

    if (onFinish) {
      onFinish()
    }
  }

  onModelChange (event) {
    if (event.isTransactionFinished && !this.history) {
      var model = this.canvas.model.toJSON()

      if (!_.isEqual(model, this.model) && this.model !== null) {
        this.modelChangedListener.forEach(listener => listener(event, model))
        this.model = model
      }
    }
  }

  onCanvasChange (event) {

  }

  /**
   * 设置是否只读
   * @param {Boolean} isReadonly 
   */
  setReadonly (isReadOnly) {
    this.canvas.setProperties({
      isReadOnly
    })
  }

  /**
   * 设置数据
   * @param {*} model 
   * @param {*} isFireEvent 
   */
  setModel (model, isFireEvent) {
    if (!isFireEvent) {
      this.canvas.removeModelChangedListener(onModelChange)
    }

    this.model = model
    this.canvas.setProperties({
      model: go.Model.fromJson(model)
    })

    if (!isFireEvent) {
      this.canvas.addModelChangedListener(onModelChange)
    }
  }

  /**
   * 获取实体
   * @return {*} result
   */
  getModel () {
    return this.canvas.model.toJSON()
  }

  addMapListener (name, listener) {
    this.canvas.addDiagramListener(name, listener)
  }

  addModelListener (listener) {
    this.modelChangedListener.push(listener)
  }

  addSettingListener (listener) {
    this.settingChangeListener.push(listener)
  }

  addStyleListener (listener) {
    this.styleChangeListener.push(listener)
  }

  /**
   * 应用尺寸和方向
   * @param {*} param0 
   */
  applySizeDirection ({ direction, width, height, size }) {
    var d = direction || this.setting.direction
    var w = width || this.setting.width
    var h = height || this.setting.height

    if (!_.isEmpty(w) && !_.isEmpty(h)) {
      var offset = parseInt(w) - parseInt(h)
      var s = size || this.setting.size

      if (offset !== 0) {
        switch (d) {
          case 'H':
            if (offset > 0) {
              this.applySize(w, h)
            } else {
              this.applySize(h, w)
            }

            break;

          case 'V':
            if (offset > 0) {
              this.applySize(h, w)
            } else {
              this.applySize(w, h)
            }

            break;
        }
      }
    }
  }

  /**
   * 应用尺寸
   * @param {*} param0 
   */
  applySize ({ width, height }) {
    setCanvasWrapperStyle(this.canvas, 'width', width)
    setCanvasWrapperStyle(this.canvas, 'height', height)
  }

  /**
   * 应用设置
   * @param {*} setting
   */
  applySetting (setting) {
    let { showMesh, showRule, width, height, direction } = setting

    if (showMesh === true) {
      this.toolMaker.setupMesh(this.canvas)
    } else if (showMesh === false) {
      this.toolMaker.unsetupMesh(this.canvas)
    }

    if (showRule === true) {
      let { width, height } = setting

      if (!width) {
        width = this.canvas.div.offsetWidth
      }

      if (!height) {
        height = this.canvas.div.offsetHeight
      }

      this.toolMaker.setupRule(this.canvas, width, height)
    } else if (showRule === false) {
      this.toolMaker.unsetupRule(this.canvas)
    }

    if (!_.isEmpty(direction)) {
      this.applySizeDirection(setting)
    }

    if (!_.isEmpty(width) && !_.isEmpty(height)) {
      this.applySize(setting)
    }

    this.applyStyle(this.style)
  }

  /**
   * 改变设置
   * @param {*} changes
   */
  changeSetting (changes) {

    this.setting = {
      ...this.setting,
      ...changes
    }

    this.applySetting(this.setting)
    this.settingChangeListener.forEach((trigger) => trigger(this.setting))
  }

  /**
   * 改变样式对象
   * @param {*} styleObject 
   */
  changeStyle (styleObject) {
    this.style = styleObject
    this.applyStyle(styleObject)
    this.styleChangeListener.forEach((trigger) => trigger(this.style))
  }

  /**
   * 应用样式对象
   * @param {*} styleObject 
   */
  applyStyle (styleObject) {
    styleObject = mixinSettingToStyle(styleObject, this.setting)

    var rootStyle = _.get(styleObject, 'root') || {}
    var background = this.setting.background || _.get(rootStyle, 'background')

    if (!_.isEmpty(background)) {
      setCanvasWrapperStyle(this.canvas, 'background', background)

    }

    // this.toolMaker.changeStyle(styleObject, this.canvas)
    // this.templateMaker.changeStyle(styleObject, this.canvas)
  }
}

export default Maps
