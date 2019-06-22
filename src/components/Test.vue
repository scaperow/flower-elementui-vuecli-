<template>
  <el-container>
    <el-aside width="200px">
      <fo-sidebar></fo-sidebar>
    </el-aside>
    <el-container>
      <el-header>
        <fo-menu></fo-menu>
      </el-header>
      <el-main>Main</el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </el-container>

</template>

<script>
import GoJS from 'gojs'
import FoMenu from '@/grapheditor/com/Menu'
import FoSidebar from '@/grapheditor/com/Sidebar'
console.log(GoJS);
export default {
  components: {
    FoMenu, FoSidebar
  },
  created () {

  }
}
</script>
