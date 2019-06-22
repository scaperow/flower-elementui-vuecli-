<template>
  <!-- <vue-tree-navigation :items="navMenus"></vue-tree-navigation> -->
  <!-- <vue-navigation-bar :options="navbarOptions" /> -->
  <div>
    <el-collapse>
      <el-collapse-item title="一致性 Consistency">
        <el-row></el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>

import Vue from 'vue'
import _ from 'lodash'
import { Graphics } from '@/grapheditor/js/Graph'

const { mxResources } = Graphics;

const Sidebar = {
  components: {

  },
  data () {
    return {
    }
  },
  created () {
    fetchShapes();
  },
  methods: {
    handleSelect (key) {
      this.$emit(`editor:fireEvent`, {
        name: key
      });
    },
    async fetchShapes () {
    }
  }
};


export default Sidebar;
</script>

