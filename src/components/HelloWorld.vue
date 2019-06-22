<template>
  <el-container>
    <el-main ref="diagramContainer">sdfsdf</el-main>
  </el-container>
</template>

<script>
import graphEditor from '@/grapheditor'


export default {
  name: "HelloWorld",
  components: {},
  props: {
    msg: String
  },
  created () { },
  mounted () {
    graphEditor.create();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
<style lang="scss">
body,
html {
  overflow: hidden;
}
</style>
