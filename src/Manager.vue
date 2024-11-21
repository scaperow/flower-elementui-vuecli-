<template>
  <el-container>
    <el-header></el-header>
    <el-menu mode="horizontal"
             :router="true"
             default-active="element">
      <el-menu-item index="element">
        <template slot="title">Element</template>
      </el-menu-item>
      <el-menu-item index="Organization">
        <template slot="title">Organization</template>
      </el-menu-item>
      <el-menu-item index="style">
        <template slot="title">Styles</template>
      </el-menu-item>
    </el-menu>
    <el-main>
      <router-view>
      </router-view>
    </el-main>
  </el-container>
</template>
<script>
export default {
  components: {}
}
</script>
<style lang="scss" scoped>
</style>


