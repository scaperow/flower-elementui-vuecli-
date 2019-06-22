
<template>
  <component :is="rootComponentName"
             :menu="menu">
  </component>
</template>


<script>
import _ from 'lodash';
import ArrayMenuItem from './ArrayMenuItem'
import LabelMenuItem from './LabelMenuItem'


const NestMenuItem = {
  name: 'NestMenuItem',

  props: {
    menu: {
      required: true
    }
  },
  components: {
    ArrayMenuItem, LabelMenuItem
  },
  computed: {
    rootComponentName () {
      return (_.get(this.menu, 'children.length') > 0) ? 'ArrayMenuItem' : 'LabelMenuItem'
    }
  },
};

export default NestMenuItem;
</script>

