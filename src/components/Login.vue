<template >
  <div class="user">
    <div class="user_options-container">
      <div class="user_options-text">
        <div class="user_options-unregistered">
          <h2 class="user_unregistered-title">还没有注册账号 ?</h2>
          <p class="user_unregistered-text">成为注册用户，即可免费创建无限数量的蓝图</p>
          <button class="user_unregistered-signup"
                  id="signup-button"
                  @click="step = 'SIGUP'">注册
          </button>
        </div>

        <div class="user_options-registered">
          <h2 class="user_registered-title">我已有一个账号 ?</h2>
          <p class="user_registered-text">登录即可享受快捷便捷的蓝图体验</p>
          <button class="user_registered-login"
                  id="login-button"
                  @click="step = 'SIGIN'">登录
          </button>
        </div>
      </div>

      <div class="user_options-forms"
           :class="step ==='SIGIN'?'bounceRight': 'bounceLeft'"
           id="user_options-forms">
        <div class="user_forms-login">
          <h2 class="forms_title">登录</h2>
          <form class="forms_form"
                @submit.prevent="sigin">
            <div class="forms_fieldset">
              <div class="forms_field">

                <v-text-field v-model="siginForm.username"></v-text-field>
              </div>
              <div class="forms_field">
                <input type="password"
                       placeholder="密码"
                       v-model="siginForm.password"
                       class="forms_field-input"
                       required />

              </div>
            </div>

            <transition class="fadeIn">
              <p class="forms_message"
                 v-show="siginMessage">{{siginMessage}}</p>
            </transition>
            <div class="forms_buttons">
              <button type="button"
                      class="forms_buttons-forgot">忘记密码 ?</button>
              <input type="submit"
                     value="登录"
                     class="forms_buttons-action">
            </div>
          </form>
        </div>
        <div class="user_forms-signup">
          <h2 class="forms_title">注册</h2>

          <form class="forms_form"
                @submit.prevent="sigup">
            <div class="forms_fieldset">
              <div class="forms_field">
                <!-- <input type="text"
                       placeholder="用户名"
                       class="forms_field-input"
                       v-model="sigupForm.username"
                       required /> -->
                <v-text-field v-model="sigupForm.username"></v-text-field>
              </div>
              <div class="forms_field">
                <input type="email"
                       placeholder="邮箱"
                       v-model="sigupForm.email"
                       class="forms_field-input"
                       required />
              </div>
              <div class="forms_field">
                <input type="password"
                       v-model="sigupForm.password"
                       placeholder="密码"
                       class="forms_field-input"
                       required />
              </div>
            </div>
            <transition class="fadeIn">
              <div class="forms_message"
                   v-show="sigupMessage">
                {{sigupMessage}}
                <div v-show="isRedirectSigin">, 或者使用该用户 <button type="button"
                          class="forms_buttons-redirect"
                          @click="step = 'SIGIN'">登录</button>
                </div>
              </div>
            </transition>
            <div class="forms_buttons">
              <input type="submit"
                     value="注册"
                     class="forms_buttons-action">
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Parse from "parse"
import { mapActions, mapGetters } from "vuex"

export default {
  name: "LoginForm",
  template: "#login-form",
  data () {
    return {
      isRedirectSigin: false,
      siginMessage: null,
      sigupMessage: null,
      isVisible: false,
      step: "SIGIN",
      siginForm: {
        username: "",
        password: ""
      },
      sigupForm: {
        username: "",
        email: "",
        password: "",
        retryPassword: ""
      }
    }
  },
  async created () {
    if (this.user) {
      return this.$router.push({ path: '/' })
    }

    const user = await Parse.User.currentAsync()
    if (user) {
      this.setUser(user.toJSON())
    }
  },
  computed: {
    ...mapGetters({ user: 'user/user' })
  },
  methods: {
    ...mapActions({ setUser: "user/setUser" }),
    async sigin () {
      this.siginMessage = null

      try {
        const user = await Parse.User.logIn(this.siginForm.username, this.siginForm.password)
        this.$notify.success("登陆成功")
        this.isVisible = false
        this.form = {
          username: "",
          password: ""
        }

        // this.$bus.$emit("user:loginSuccess")
        this.setUser(user.toJSON())
        this.$router.push({ path: '/' })
      } catch ({ code }) {
        this.siginMessage = '用户名或密码不正确'
      }
    },
    async logout () {
      try {
        await Parse.User.logOut()
        this.isVisible = true
        this.setUser(null)
      } catch (error) {
        this.$catch(error)
      }
    },
    async validateEmail () { },
    async sigup () {

      await Parse.User.logOut()

      let user = new Parse.User()
      user.set("username", this.sigupForm.username)
      user.set("password", this.sigupForm.password)
      user.set("email", this.sigupForm.email)

      this.siginMessage = null
      this.isRedirectSigin = false

      try {
        await user.signUp()
        this.setUser(user.toJSON())
        this.$notify.success("注册成功")
        this.$router.push('/')
        this.step = "SIGIN"
        this.sigupForm = {
          username: "",
          email: "",
          password: "",
          retryPassword: ""
        }
      } catch (error) {
        switch (error.code) {
          case 202:
            this.sigupMessage = '用户名已存在，请重试。'
            this.isRedirectSigin = true
            break;

          case 203:
            this.sigupMessage = '邮箱已存在'
            this.isRedirectSigin = true

          default:
            this.$catch(error)
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
/**
 * General variables
 */
$bdrds: 3px;
$white: #fff;
$black: #000;
$gray: #ccc;
$salmon: #e8716d;
$error: #e33333;
$smoky-black: rgba(#222222, 0.85);
$ff: "Montserrat", sans-serif;
$ff-body: 12px;
$ff-light: 300;
$ff-regular: 400;
$ff-medium: 500;

div.user {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  font-family: $ff;
  font-size: $ff-body;
  line-height: 1em;

  // .content {
  //   max-width: 500px;
  //   height: auto;
  //   flex-grow: 1;

  //   .wrapper {
  //     display: inline-block;
  //   }
  // }
}

/**
 * General configs
 */
* {
  box-sizing: border-box;
}

button {
  background-color: transparent;
  padding: 0;
  border: 0;
  outline: 0;
  cursor: pointer;
}

input {
  background-color: transparent;
  padding: 0;
  border: 0;
  outline: 0;

  &[type="submit"] {
    cursor: pointer;
  }

  &::placeholder {
    font-size: 0.85rem;
    font-family: $ff;
    font-weight: $ff-light;
    letter-spacing: 0.1rem;
    color: $gray;
  }
}

/**
 * Bounce to the left side
 */
@keyframes bounceLeft {
  0% {
    transform: translate3d(100%, -50%, 0);
  }

  50% {
    transform: translate3d(-30px, -50%, 0);
  }

  100% {
    transform: translate3d(0, -50%, 0);
  }
}

/**
 * Bounce to the left side
 */
@keyframes bounceRight {
  0% {
    transform: translate3d(0, -50%, 0);
  }

  50% {
    transform: translate3d(calc(100% + 30px), -50%, 0);
  }

  100% {
    transform: translate3d(100%, -50%, 0);
  }
}

/**
 * Show Sign Up form
 */
@keyframes showSignUp {
  100% {
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, 0, 0);
  }
}

/**
 * Page background
 */
.user {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100vh;
  background: url("/login-background.jpg") no-repeat center;
  background-size: cover;

  &_options-container {
    position: relative;
    width: 80%;
  }

  &_options-text {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: $smoky-black;
    border-radius: $bdrds;
  }
}

/**
 * Registered and Unregistered user box and text
 */
.user_options-registered,
.user_options-unregistered {
  width: 50%;
  padding: 75px 45px;

  color: $white;
  font-weight: $ff-light;
}

.user_registered-title,
.user_unregistered-title {
  margin-bottom: 15px;
  font-size: 1.66rem;
  line-height: 1em;
}

.user_unregistered-text,
.user_registered-text {
  font-size: 0.83rem;
  line-height: 1.4em;
}

.user_registered-login,
.user_unregistered-signup {
  margin-top: 30px;
  border: 1px solid $gray;
  border-radius: $bdrds;
  padding: 10px 30px;

  color: $white;
  text-transform: uppercase;
  line-height: 1em;
  letter-spacing: 0.2rem;

  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    color: $smoky-black;
    background-color: $gray;
  }
}

/**
 * Login and signup forms
 */
.user_options-forms {
  position: absolute;
  top: 50%;
  left: 30px;

  width: calc(50% - 30px);
  min-height: 420px;
  background-color: $white;
  border-radius: $bdrds;
  box-shadow: 2px 0 15px rgba($black, 0.25);
  overflow: hidden;

  transform: translate3d(100%, -50%, 0);
  transition: transform 0.4s ease-in-out;

  .user_forms-login {
    transition: opacity 0.4s ease-in-out, visibility 0.4s ease-in-out;
  }

  .forms {
    &_title {
      margin-bottom: 45px;

      font-size: 1.5rem;
      font-weight: $ff-medium;
      line-height: 1em;
      text-transform: uppercase;
      color: $salmon;
      letter-spacing: 0.1rem;
    }

    &_field {
      &:not(:last-of-type) {
        margin-bottom: 20px;
      }
    }

    &_field-input {
      width: 100%;
      border-bottom: 1px solid $gray;
      padding: 6px 20px 6px 6px;

      font-family: $ff;
      font-size: 1rem;
      font-weight: $ff-light;
      color: darken($gray, 30%);
      letter-spacing: 0.1rem;

      transition: border-color 0.2s ease-in-out;

      &:focus {
        border-color: darken($gray, 30%);
      }
    }

    &_message {
      color: $error;
    }

    &_buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;

      margin-top: 35px;

      &-forgot,
      &-redirect {
        font-family: $ff;
        letter-spacing: 0.1rem;
        color: $gray;
        text-decoration: underline;

        transition: color 0.2s ease-in-out;

        &:hover {
          color: darken($gray, 10%);
        }
      }

      &-action {
        background-color: $salmon;
        border-radius: $bdrds;
        padding: 10px 35px;

        font-size: 1rem;
        font-family: $ff;
        font-weight: $ff-light;
        color: $white;
        text-transform: uppercase;
        letter-spacing: 0.1rem;

        transition: background-color 0.2s ease-in-out;

        &:hover {
          background-color: darken($salmon, 10%);
        }
      }
    }
  }

  .user_forms-signup,
  .user_forms-login {
    position: absolute;
    top: 70px;
    left: 40px;

    width: calc(100% - 80px);

    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s ease-in-out, visibility 0.4s ease-in-out,
      transform 0.5s ease-in-out;
  }

  .user_forms-signup {
    transform: translate3d(120px, 0, 0);

    .forms_buttons {
      justify-content: flex-end;
    }
  }

  .user_forms-login {
    transform: translate3d(0, 0, 0);
    opacity: 1;
    visibility: visible;
  }
}

/**
 * Triggers
 */
.user_options-forms {
  &.bounceLeft {
    animation: bounceLeft 1s forwards;

    .user_forms-signup {
      animation: showSignUp 1s forwards;
    }

    .user_forms-login {
      opacity: 0;
      visibility: hidden;
      transform: translate3d(-120px, 0, 0);
    }
  }

  &.bounceRight {
    animation: bounceRight 1s forwards;
  }
}

/**
 * Responsive 990px
 */
@media screen and (max-width: 990px) {
  .user_options-forms {
    min-height: 350px;

    .forms_buttons {
      flex-direction: column;
    }

    .user_forms-login {
      .forms_buttons-action {
        margin-top: 30px;
      }
    }

    .user_forms-signup,
    .user_forms-login {
      top: 40px;
    }
  }

  .user_options-registered,
  .user_options-unregistered {
    padding: 50px 45px;
  }
}
</style>

