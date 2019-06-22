
const url = window.location.href;

let urlParams = {};
let idx = url.lastIndexOf('?');

if (idx > 0) {
  var params = url.substring(idx + 1).split('&');

  for (var i = 0; i < params.length; i++) {
    idx = params[i].indexOf('=');

    if (idx > 0) {
      urlParams[params[i].substring(0, idx)] = params[i].substring(idx + 1);
    }
  }
}

let mxBasePath = '/sdk/mxgraph/';
let mxLanguage = 'zh';
let mxLanguages = ['zh'];

let STOCK_COLOR = 'black'

// Public global variables
let MAX_REQUEST_SIZE = 10485760;
let MAX_AREA = 15000 * 15000;

// URLs for save and export
let EXPORT_URL = '/export';
let SAVE_URL = '/save';
let OPEN_URL = '/open';
let RESOURCES_PATH = 'resources';
let RESOURCE_BASE = '/grapheditor';
let STENCIL_PATH = 'stencils';
let IMAGE_PATH = 'images';
let STYLE_PATH = 'styles';
let CSS_PATH = 'styles';
let OPEN_FORM = 'open.html';

export {
  urlParams,
  mxBasePath,
  mxLanguage,
  mxLanguages,
  MAX_REQUEST_SIZE,
  MAX_AREA,
  EXPORT_URL,
  SAVE_URL,
  OPEN_URL,
  RESOURCES_PATH,
  RESOURCE_BASE,
  STENCIL_PATH,
  IMAGE_PATH,
  STYLE_PATH,
  CSS_PATH,
  OPEN_FORM,
  STOCK_COLOR
};