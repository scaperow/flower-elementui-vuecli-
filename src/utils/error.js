
import Parse from 'parse'
class ErrorHandler {
  loginUrl = '/login'
  denyUrl = '/403'
  missingUrl = '/404'

  constructor({ handleDirect, handleNotify, handleError, handleWaring, handleBlock, handleConfirm }) {
    this.handleDirect = handleDirect
    this.handleNotify = handleNotify
    this.handleError = handleError
    this.handleWaring = handleWaring
    this.handleBlock = handleBlock
    this.handleConfirm = handleConfirm
  }

  direct (url) {
    this.handleDirect && this.handleDirect(url)
  }

  notify (message) {
    this.notify && this.notify(message)
  }

  error (message) {
    this.handleError && this.handleError(message)
  }

  warning (message) {
    this.handleWarning && this.handleWarning(message)
  }

  block (message) {
    this.handleBlock && this.handleBlock(message)
  }

  confirm (message) {
    this.handleConfirm && this.handleConfirm(message)
  }

  /**
   * 拦截错误
   * @param {*} error
   * @param {String} message 200 status message
   * @returns {Boolean} isStop
   */
  catch (error, message) {
    if (error instanceof Parse.Error) {
      return this.catchServerError(error, message)
    } else {
      return this.catchClientError(error)
    }
  }

  /**
   * 拦截浏览器错误
   * @param {*} error 
   * @returns {Boolean} isStop
   */
  catchClientError (error) {
    this.error(error.message || '发生未知错误, 请稍后再试')
  }

  /**
   * 拦截服务端 API的错误
   * @param {*} error
   * @returns {Boolean} isStop
   */
  catchServerError ({ code, message }, unknowMessage) {
    var isStop = false

    switch (code) {
      case 200:
        this.error(unknowMessage || '未知错误')
        break

      case 100:
        this.block('无法连接到 API 服务器, 请刷新页面重试')
        break

      case 101:
        this.error('对象不存在')
        break;

      case 119:
        this.error('无权执行该操作')
        break

      case 124:
        this.error('请求超时, 请重试')
        break

      case 129:
        this.error('文件过大, 请重试')
        break

      case 142:
        this.error('验证失败, 请检查输入的内容')
        break

      case 153:
        this.error('文件删除失败')
        break

      case 209:
        this.notify('请重新登录')
        this.redirect('/login')

        isStop = true
        break;

      default:
        this.error('发生错误, 请稍后再试')
        break
    }

    return isStop
  }
}

ErrorHandler.install = function (Vue, options) {
  const errorHandler = new ErrorHandler(options)
  Vue.prototype.$catch = (error, message) => {
    errorHandler.catch(error, message)
  }
  // Vue.config.errorHandler = (error) => {
  //   ErrorHandler.catch(error)
  // }
}

export default ErrorHandler