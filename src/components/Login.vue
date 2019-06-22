<template >
  <div id="login-form">
    <el-dialog :close-on-click-modal="false" :visible.sync="isVisible" width="820px">
      <div class="fr">
        <el-button type="text" @click="isVisible = false;">
          <i class="el-dialog__close el-icon el-icon-close"></i>
        </el-button>
      </div>
      <el-row>
        <el-col :span="10">
          <el-image
            style="width: 100%; height: 100%"
            fit="cover"
            src="https://www.liuchengtu.com/images/box/bg_dengl.png"
          ></el-image>
        </el-col>
        <el-col :span="14">
          <div v-show="step==='login'">
            <h2>请登录</h2>
            <el-form :model="form">
              <el-form-item>
                <el-input v-model="form.name" placeholder="用户名">
                  <i class="el-icon-user el-input__icon" slot="prefix"></i>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-input v-model="form.password" type="password" placeholder="密码">
                  <i class="el-icon-view el-input__icon" slot="prefix"></i>
                </el-input>
                <div style="text-align:left">
                  <el-button type="text">忘记密码</el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button round @click="login()" type="primary">登录</el-button>
                <el-button round @click="step = 'regist'">注册</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div v-show="step==='regist'">
            <h2>注册</h2>
            <el-form :model="form">
              <el-form-item label="用户名">
                <el-input v-model="regist.name" placeholder="用户名">
                  <i class="el-icon-user el-input__icon" slot="prefix"></i>
                </el-input>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="regist.email" placeholder="邮箱">
                  <i class="el-icon-view el-input__icon" slot="prefix"></i>
                  <el-button v-if="regist.email" slot="suffix" type="text">获取验证码</el-button>
                </el-input>
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="regist.password" type="password" placeholder="密码">
                  <i class="el-icon-view el-input__icon" slot="prefix"></i>
                </el-input>
              </el-form-item>
              <el-form-item label="重复密码">
                <el-input v-model="regist.retryPassword" type="password" placeholder="重复密码">
                  <i class="el-icon-view el-input__icon" slot="prefix"></i>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button round @click="register()" type="primary">提交</el-button>
                <el-button round @click="step = 'login'">登录</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import Parse from "parse";
import { mapActions } from "vuex";

export default {
  name: "LoginForm",
  template: "#login-form",
  data() {
    return {
      isVisible: false,
      step: "login",
      form: {
        name: "",
        password: ""
      },
      regist: {
        name: "",
        email: "",
        password: "",
        retryPassword: ""
      }
    };
  },
  async created() {
    console.log(this.$store);
    this.$bus.$on("userAction:login", () => (this.isVisible = true));
    this.$bus.$on("userAction:changePassword", () => (this.isVisible = true));
    this.$bus.$on("userAction:logout", this.logout);

    const user = await Parse.User.currentAsync();
    if (user) {
      this.$bus.$emit("user:loginSuccess", { user: user.toJSON() });

      this.setUser(user.toJSON());
    }
  },
  methods: {
    ...mapActions({ setUser: "user/setUser" }),
    async login() {
      try {
        const user = await Parse.User.logIn(this.form.name, this.form.password);
        this.$notify.success("登陆成功");
        this.isVisible = false;
        this.form = {
          name: "",
          password: ""
        };

        this.$bus.$emit("user:loginSuccess");
        this.setUser(user.toJSON());
      } catch (error) {
        this.$message.error(error.message);
        throw error;
      }
    },
    async logout() {
      try {
        await Parse.User.logOut();
        this.isVisible = true;
        this.setUser(null);
      } catch (error) {
        this.$message.error(error.message);
        throw error;
      }
    },
    async validateEmail() {},
    async register() {
      let user = new Parse.User();
      user.set("username", this.regist.name);
      user.set("password", this.regist.password);
      user.set("email", this.regist.email);

      try {
        const user = await user.signUp();
        this.setUser(user.toJSON());
        this.$notify.success("注册成功, 请登录");
        this.setp = "login";
        this.regist = {
          name: "",
          email: "",
          password: "",
          retryPassword: ""
        };
      } catch (error) {
        const { code, message } = error;
        throw error;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
<style lang="scss">
#login-form {
  .el-dialog {
    min-height: 480px;
    .el-dialog__header {
      display: none;
    }
    .el-dialog__body {
      padding: 0 !important;

      .el-col:last-of-type {
        padding: 100px 80px;
      }

      .el-form {
        padding: 16px;
        .el-form-item__label {
          display: none;
        }
      }
    }
  }
}
</style>

