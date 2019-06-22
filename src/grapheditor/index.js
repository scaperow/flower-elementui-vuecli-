import Graphics from 'mxgraph';
import { Editor } from './js/Editor';
import { EditorUi } from './js/EditorUi';

import editorStyle from "!xml-loader!@/grapheditor/style.xml";
const create = function () {
  new EditorUi(new Editor(false, {
    default: editorStyle
  }));
};

export default {
  create
};