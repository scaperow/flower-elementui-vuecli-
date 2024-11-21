var glob = require('glob')
var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var PAGE_PATH = path.resolve(__dirname, '../src/views')
var merge = require('webpack-merge')

//多入口配置
//获取views文件夹下，每个页面下的index.js作为页面入口，故每个页面下都必须有index.js
exports.entries = function () {
  var entryFiles = glob.sync(PAGE_PATH + '/*/index.js')
  var map = {}, tmp = [], pathname = '';
  entryFiles.forEach((filePath) => {
    var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
    tmp = filePath.split('/').splice(-4)
    map[tmp[2] + '/' + filename] = filePath
  })
  return map
}

//多页面输出配置
//读取views文件夹下的对应每个页面的html后缀文件，然后放入数组中
//如果想要更深的定制或者修改，建议大家看一下CommonsChunkPlugin
//推荐一个基础的 https://segmentfault.com/q/1010000009070061
exports.htmlPlugin = function () {
  let entryHtml = glob.sync(PAGE_PATH + '/*/*.html')
  let arr = []
  entryHtml.forEach((filePath) => {
    let jsPath = '', tmp = [];
    let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
    tmp = filePath.split('/').splice(-4)
    jsPath = tmp[2] + '/' + 'index'
    let conf = {
      template: filePath,
      filename: filename + '.html',
      chunks: ['manifest', 'vendors', jsPath],
      inject: true
    }
    if (process.env.NODE_ENV === 'production') {
      conf = merge(conf, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        },
        chunksSortMode: 'dependency'
      })
    }
    arr.push(new HtmlWebpackPlugin(conf))
  })
  return arr
}

