<template>
  <el-menu-item :index="menu.title">
    {{translate(menu.title )}}
  </el-menu-item>
</template>
<script>
import { Graphics } from '@/grapheditor/js/Graph'
const { mxResources } = Graphics
export default {
  name: 'ArrayMenuItem',
  props: ['menu'],
  components: { NestMenuItem: () => import('./NestMenuItem') },
  created () {
  },
  methods: {
    translate (key) {
      return mxResources.get(key)
    }
  }
}
</script>
