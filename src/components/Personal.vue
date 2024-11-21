<template>
  <section class="personal">

    <div class="container">
      <div>
        <p class="avatar">
          <img v-if="user && user.avatar"
               class="avatar"
               :src="`data:image/svg+xml;base64,${user.avatar}`" />
          <i v-else
             class="iconfont icon-user avatar"></i>
        </p>
        <div class="tabs">
          <div class="buttons">
            <button :class="{'select':tab === 'BASIC'}"
                    @click="tab='BASIC'">基本信息</button>
            <button :class="{'select':tab === 'PASSWORD'}"
                    @click="tab='PASSWORD'">修改密码</button>
          </div>
          <div class="panel"
               v-if="mineModel"
               v-show="tab === 'BASIC'">
            <v-form ref="form">
              <div class="control">
                <!-- <input type="text"
                       v-model="mineModel.username" /> -->
                <v-text-field :rules="[$validate('isNotEmpty'),$validate('isAlphanumeric'),$validate('isLength',{min:3,max:24})]"
                              v-model="mineModel.username"></v-text-field>
              </div>
              <div class="control">
                <label>昵称</label>

                <input type="text"
                       v-model="mineModel.nick" />
                <!-- 
                <v-text-field v-model="mineModel.nick"
                              :rules="userNameValidators"></v-text-field> -->
              </div>
              <div class="control">
                <label>邮箱</label>
                <!-- <input type="text"
                       v-model="mineModel.email" /> -->

                <v-text-field v-model="mineModel.email"></v-text-field>
                <!-- <span class="tab"
                      success
                      v-if="mineModel.emailVerified === true">
                  已激活
                </span>
                <span class="tab"
                      @click="verifyEmail"
                      warning>未激活</span> -->
              </div>
            </v-form>
            <footer>
              <button class="button"
                      primary>保存</button>
            </footer>
          </div>
        </div>
        <div class="panel"
             v-show="tab === 'PASSWORD'">
          <form class="password">
            <div class="control">
              <label>请输入当前密码</label>
              <input type="text"
                     v-model="currentPassword" />
            </div>
            <div class="control">
              <label>请输入新密码</label>
              <input type="text"
                     v-model="newPassword" />
            </div>
            <div class="control">
              <label>请再次输入新密码</label>
              <input type="text"
                     v-model="retryPassword" />
            </div>
          </form>
          <footer>
            <button class="button"
                    primary>保存</button>
          </footer>
        </div>
      </div>

    </div>

  </section>
</template>
<script>
import { mapGetters } from 'vuex'
import Parse from 'parse'
import Validators from '@/utils/validators'
export default {
  computed: {
    ...mapGetters({
      user: 'user/user'
    })
  },
  data () {
    return {
      tab: "BASIC",
      currentPassword: null,
      newPassword: null,
      retryPassword: null,
      showUserSetting: false,
      mineSource: null,
      mineModel: null,
      isMineModal: false
    }
  },
  async created () {
    var mine = null

    try {
      mine = await Parse.User.currentAsync()
    } catch (error) {
      this.$catch(eror, '获取用户信息失败')
    }

    if (mine) {
      this.mineSource = mine
      this.mineModel = mine.toJSON()
      this.isMineModal = true
    }
  },
  methods: {
    changePassword () {

    },
    verifyEmail () {

    }
  }
}
</script>
<style scoped lang="scss">
@import "@/style/variables.scss";

section.personal {
  background: url("../assets/login-background.jpg") no-repeat center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  div.container {
    width: 50%;
    max-width: 800px;
    min-width: 400px;
    background: $--color-white;
    border-radius: 24px;
    position: relative;
    padding-top: 80px;

    .tabs > .panel {
      padding: 16px 0 !important;
    }

    form {
      padding: 0 !important;

      &.password {
        label {
          width: 150px;
        }
      }
    }

    p.avatar {
      position: absolute;
      top: -80px;
      text-align: center;
      width: 100%;
      text-align: center;

      img.avatar {
        transition: all 0.3s;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: solid 1px $--border-color-base;
        text-align: center;
        color: $--color-white;
        border: solid 2px $--color-white;
        cursor: pointer;

        .iconfont {
          color: $--color-white;
        }

        &:hover {
          background: $--background-color-base;
          box-shadow: $--box-shadow-base;
        }
      }

      i.avatar {
        font-size: 40px;
        width: 120px;
        height: 120px;
        line-height: 120px;
        margin: auto;
        border-radius: 50%;
        transition: all 0.3s;
        background: $--background-color-base;
        display: block;
        text-align: center;
        color: $--color-white;
        border: solid 2px $--color-white;
        cursor: pointer;

        &:hover {
          box-shadow: $--box-shadow-base;
        }
      }

      p {
        text-align: center;
      }
    }

    form {
      padding: 12px 32px;
    }

    footer {
      text-align: right;
      padding: 16px;
      margin-bottom: 32px;
    }
  }
}
</style>