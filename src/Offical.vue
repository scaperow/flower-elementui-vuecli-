<template>
  <section>
    <div class="header">
      <div class="right">
        <div v-if="user">
          <button>我的文件</button>
          <button>注销 {{user.username}}</button>
        </div>
        <div v-else>
          <button @click="sigin">登录</button>
          <button @click="sigout">注册</button>
        </div>
      </div>
    </div>
    <div class="container">
      <h1>蓝图巴巴</h1>
      <p>流程图、思维导图、UML 图 等等，统统搞定</p>
      <button @click="start">开始创作</button>
    </div>

    <div class="footer">
      <h3>@星系工作室</h3>
      <h5><small>陕备案</small> <a href="https://manuelpinto.in"
           target="_blank">xxxxxxx</a></h5>
    </div>
  </section>
</template>

<script>

import Parse from 'parse'

export default {
  name: "app",
  data () {
    return {
      isNotRegist: false,
      isNotLogin: false,
      user: null,
      userObject: null
    }

  },
  components: {
  },
  methods: {
    clickMenu (command) {
      this.$options.methods[command].apply(this)
    },

    start () {
      if (this.user) {
        // to app site

      } else {
        // to login site
        window.location.href = '/app/#login'

      }
    },
    sigin () {

    },
    sigout () {

    }
  },
  mounted () {
    this.userObject = Parse.User.current()

    if (this.userObject) {
      this.user = this.userObject.toJson()
    }
  }
};
</script>

<style lang="scss" scoped>
@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

section {
  padding-bottom: 100px;
  letter-spacing: 2px;
  font-weight: 200;
  margin: 0;
  width: 100%;
  height: 100vh;
  font-family: "Exo", sans-serif;
  color: #fff;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;

  .header {
    padding: 0 24px;
    .right {
      text-align: right;
      button {
        color: #fff;
        font-weight: 400;
        background: transparent;
        font-size: 20px;
        padding: 12px 16px;
        border: none;
        cursor: pointer;
        transition: all 0.3s;
        border: solid 1px transparent;

        &:hover {
          border-bottom-color: #fff;
        }
      }
    }
  }

  .container {
    width: 100%;
    position: absolute;
    top: 35%;
    text-align: center;
    letter-spacing: 2px;

    button {
      background: #3333;
      color: #fff;
      letter-spacing: 2px;
      border-radius: 65px;
      transition: all 0.3s;
      font-size: 18px;
      width: auto;
      height: 65px;
      padding: 0 32px;
      cursor: pointer;
      margin: 0;
      line-height: 65px;
      border: none;

      &:hover {
        background: #fff;
        color: #333;
      }

      &.tip {
        margin-top: 36px;
      }
    }
  }

  .footer {
    position: absolute;
    width: 100%;
    text-align: center;
    bottom: -100px;
    height: 100px;
    background: #fff;
    color: #9c9c9c;

    h3 {
      font-weight: 200;
    }

    h5 {
      font-weight: 200;
    }
  }

  h1 {
    font-weight: 300;
    font-size: 32px;
    font-size: 46px;
  }

  p {
    font-size: 28px;
  }

  a,
  a:hover {
    text-decoration: none;
    color: #ddd;
  }
}
</style>
