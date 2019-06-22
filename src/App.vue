<template>
  <div id="app">
    <router-view></router-view>
    <!-- <el-container>
      <el-header>
        <el-row>
          <el-col style="text-align:left"
                  :span="8">线条</el-col>

          <el-col style="text-align:center"
                  :span="8">
            <el-button
              icon="el-icon-plus"
              circle
              type="primary"
              class="create-button"
              :class="{'tip':!isEditing}"
            ></el-button> 
          </el-col>

          <el-col style="text-align:right"
                  :span="8">
            <div>
              <div v-if="!user">
                <el-button circle
                           type="text"
                           @click="$bus.emit('userAction:login')">请登录</el-button>
              </div>
              <div v-if="user">
                <el-dropdown @command="clickMenu"
                             class="avatar-container right-menu-item hover-effect"
                             trigger="click">
                  <div class="avatar-wrapper">
                    <el-button type="text">{{user.username}}</el-button>
                  </div>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="mine">我的作品</el-dropdown-item>
                    <el-dropdown-item command="changePassword">更换密码</el-dropdown-item>
                    <el-dropdown-item command="logout">退出</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer></el-footer>
      <login></login>
    </el-container> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Editor from "./components/Editor";
import Login from "./components/Login";

export default {
  name: "app",
  components: {
    Editor,
    Login
  },
  computed: {
    ...mapGetters({ user: "user/user" }),
    isEditing () {
      return this.$route.path === "/editor";
    }
  },
  methods: {
    clickMenu (command) {
      this.$options.methods[command].apply(this);
    },
    changePassword () {
      this.$bus.emit("userAction:changePassword");
    },
    logout () {
      this.$bus.emit("userAction:logout");
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;

  .create-button {
    transition: all 0.3s;
    font-size: 32px;
    &.tip {
      margin-top: 36px;
    }
  }

  .el-container {
    height: 100vh;
    // .el-header {
    //   border-bottom-left-radius: 12px;
    //   border-bottom-right-radius: 12px;
    //   background: #fff;
    //   margin: 0 30px;
    //   height: 120px;
    // }

    // .el-main {
    //   border-top-left-radius: 12px;
    //   border-top-right-radius: 12px;
    //   background: #fff;
    //   margin: 0 30px;
    //   margin-top: 12px;
    // }

    // .el-footer {
    //   background: #fff;
    //   margin: 0 30px;
    // }
  }
}
</style>
