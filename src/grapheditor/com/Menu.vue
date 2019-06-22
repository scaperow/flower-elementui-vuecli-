<template>
  <!-- <vue-tree-navigation :items="navMenus"></vue-tree-navigation> -->
  <!-- <vue-navigation-bar :options="navbarOptions" /> -->
  <el-menu mode="horizontal">
    <nest-menu-item v-for="(menu,index) in menus"
                    :key="index"
                    :menu="menu"></nest-menu-item>
  </el-menu>
</template>
<script>

import Vue from 'vue'
import _ from 'lodash'
import { Graphics } from '@/grapheditor/js/Graph'
import NestMenuItem from './NestMenuItem'
import VueTreeNavigation from 'vue-tree-navigation'
const { mxResources } = Graphics;

const menuData = [
  'file', ['new', 'open', 'save', 'saveAs', 'import', 'export', 'pageSetup', 'print'],
  'edit', ['undo', 'redo', 'cut', 'copy', 'paste', 'delete', 'duplicate', 'editData', 'editTooltip', 'editStyle', 'edit', 'editLink', 'openLink', 'selectVertices', 'selectEdges', 'selectAll', 'selectNone', 'lockUnlock'],
  'view', ['outline', 'layers', 'pageView', 'pageScale', 'scrollbars', 'tooltips', 'grid', 'guides', 'connectionArrows', 'connectionPoints', 'resetView', 'zoomIn', 'zoomOut'],
  'arrange', ['toFront', 'toBack', 'direction', ['flipH', 'flipV', 'rotation'], 'turn', 'align', ['leftAlign', 'center', 'rightAlign', 'topAlign', 'middle', 'bottomAlign'], 'distribute', ['horizontal', 'vertical'], 'navigation', ['home', 'exitGroup', 'enterGroup', 'expand', 'collapse', 'collapsible'], 'insert', ['insertLink', 'insertImage'], 'layout', ['horizontalFlow', 'verticalFlow', 'horizontalTree', 'verticalTree', 'radialTree', 'organic', 'circle'], 'group', 'ungroup', 'removeFromGroup', 'clearWaypoints', 'autosize']
];

const makeNest = function (children) {
  return _.reduce(children, (result, value, key) => {
    if (_.isArray(value) && key > 0) {
      let previous = _.find(result, { title: children[key - 1] });
      previous.children = previous.children.concat(makeNest(value));
    } else {
      result.push({
        title: value,
        children: []
      });
    }

    return result;
  }, []);
};


const menus = makeNest(menuData);

const Menus = {
  components: {
    NestMenuItem
  },
  data () {
    return {
      menus: menus
    }
  },
  methods: {
    handleSelect (key) {
      this.$emit(`editor:fireEvent`, {
        name: key
      });
    }
  }
};


export default Menus;
</script>

