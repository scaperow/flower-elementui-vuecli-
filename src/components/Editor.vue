<template>
  <div>
    <el-button @click="search">search</el-button>
    <iframe src="/sdk/editor/index.html"
            ref="editor"></iframe>
  </div>
</template>
<script>
import Api from "@/api/common";
import Parse from "parse";
import A from './test'
import {
  mapGetters
} from "vuex";

let objectId = null;
let Model = Api.create("flow");

export default {

  created () {
    console.log(A);
  },

  mounted () {

    this.$refs.editor.contentWindow.addEventListener("message", ({
      data
    }) => {
      switch (data.command) {
        case "save":
          this.onSave(data);
      }
    });
  },
  computed: {
    ...mapGetters({
      user: "user/user"
    })
  },
  methods: {
    async search () {
      const query = new Parse.Query(Model.$parse);
      const result = await query.find();
    },
    async onSave ({
      name,
      content
    }) {
      if (!this.user) {
        return this.$bus.$emit("userAction:login");
      }

      const {
        objectId: id
      } = await Model.save({
        name,
        content,
        creator: Parse.User.current(),
        objectId: objectId
      });

      objectId = id;
      this.$notify.success("已保存");
    }
  }
};
</script>
<style lang="scss" scoped>
iframe {
  border: none;
  height: 100vh;
  width: 100vw;
}
</style>
