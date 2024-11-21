<template>
  <section class="user-avatar">
    <el-popover>
      <div slot="reference">
        <img v-if="user && user.avatar"
             class="avatar"
             :src="`data:image/svg+xml;base64,${user.avatar}`" />
        <i v-else
           class="iconfont icon-user avatar"></i>
      </div>
      <div>
        <p>
          欢迎您, {{user.username}}
        </p>
        <ul class="avatar-selection">
          <router-link to="/personal"
                       target="_blank">
            <li class="el-dropdown-menu__item">
              个人信息
            </li>
          </router-link>
          <li @click="systemSetting"
              class="el-dropdown-menu__item">
            系统设置</li>
          <li @click="sigout"
              class="el-dropdown-menu__item el-dropdown-menu__item--divided">
            退出登录</li>
        </ul>
      </div>
    </el-popover>
    <!-- <div v-if="!user">
      <router-link :to="{path:'/login'}">登录</router-link>
    </div>
    <el-dialog visible.sync="showUserSetting">
      <el-tabs direction="vertical">
        <el-tab-pane label="我的信息">

        </el-tab-pane>
        <el-tab-pane label="修改密码">

        </el-tab-pane>
      </el-tabs>
    </el-dialog> -->

  </section>
</template>
<script>
import { mapGetters } from 'vuex'
import Parse from 'parse'
import { debuglog } from 'util';
export default {
  data () {
    return {
      mineRules: {
        username: {
          type: String,
          min: 3,
          max: 24,
          pattern: '[a-Z0-9]'
        }
      },
      showUserSetting: false,
      mineSource: null,
      mineModel: null,
      isMineModal: false
    }
  },
  props: {
    width: {
      type: Number,
      default: 40
    },
    height: {
      type: Number,
      default: 40
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/user'
    })
  },
  methods: {
    async newAvatar () {
      const avatar = await Parse.Cloud.run('makeAvatar')
      this.$store.dispatch('user/updateAvatar', avatar)

    },
    async sigout () {
      await this.$store.dispatch('user/logout')
      this.$router.push('/login')
    },
    verifyEmail () {

    },
    systemSetting () {

    },
    saveMine () {

    },
    async changePassword () {
      var email = this.mineModel.email
      try {
        await Parse.User.requestPasswordReset(email)

        this.$notify({
          message: `修改链接已发送到您的邮箱(${email})，请从邮件中修改`,
          type: 'success'
        })
      } catch (error) {
        this.$catch(error)
      }
    },
    onCommand (command) {
      switch (command) {
        case 'USER_SETTING':
          this.showUserSetting = true
          break;

        case 'SYSTEM_SETTING':
          break;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
section.user-avatar {
  background-repeat: no-repeat;
  background-position: 0;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: block;
  text-align: center;
  line-height: 40px;
  width: 40px;
  height: 40px;

  label {
    border-top: solid 1px #fff;
    border-bottom: solid 1px #fff;
    padding: 2px 6px;
    cursor: pointer;
  }

  a {
    color: #fff;
    text-decoration: none;
  }

  img.avatar {
    transition: all 0.3s;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: solid 1px #77818c;
    text-align: center;
    color: #fff;

    .iconfont {
      color: #fff;
    }

    &:hover {
      background: #ccc;
      box-shadow: 3px 3px 6px -3px #999;
    }
  }

  i.avatar {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    line-height: 40px;
    transition: all 0.3s;
    background: #c3c3c3;
    display: block;
    text-align: center;
    color: #fff;

    &:hover {
      box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.3);
    }
  }
}
</style>


<style lang="scss">
@import "@/style/variables.scss";

ul.avatar-selection {
  padding: 0;
}

.avatar-popover {
  padding: 0;
}

.mine-modal {
}
</style>


