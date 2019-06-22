<template>
  <el-submenu :index="menu.title">
    <template slot="title">{{translate(menu.title)}}</template>
    <nest-menu-item v-for="(child,index) in menu.children"
                    :menu="child"
                    :key="index"></nest-menu-item>
  </el-submenu>
</template>

<script>
import { Graphics } from '@/grapheditor/js/Graph'
const { mxResources } = Graphics
export default {
  name: 'ArrayMenuItem',
  components: { NestMenuItem: () => import('./NestMenuItem') },
  props: ['menu'],
  methods: {
    translate (key) {
      return mxResources.get(key)
    }
  }

}
</script>
