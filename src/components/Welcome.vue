<template>
  <section class="welcome">
    <!-- <div class="header"
         height="60px">

      <div class="center"></div>
      <div class="avatar">
        <user-avatar style="height:60px;width:60px">
        </user-avatar>
      </div>
    </div> -->

    <div class="content">
      <div width="260px"
           class="left-side">
        <div>
          <div class="logo dark">
            <label>蓝图巴巴</label>
          </div>
          <el-divider> </el-divider>
          <div class="create-button">
            <button class="create-button"
                    @click="$refs.createModal.open()">
              <i class="iconfont icon-plus"></i> 创建
            </button>
          </div>

          <el-divider> </el-divider>
          <div class="router">
            <router-link :to="{path:'/welcome/mine'}">
              <button :class="$route.path === '/welcome/mine'?'active':''">
                <strong>我的作品</strong>
              </button>
            </router-link>
            <router-link :to="{path:'/welcome/team'}">
              <button :class="$route.path === '/welcome/team'?'active':''">
                <strong>分享的作品</strong></button>
            </router-link>
            <router-link :to="{path:'/welcome/favorite'}">
              <button :class="$route.path === '/welcome/favorite'?'active':''">
                <strong>星标的作品</strong></button>
            </router-link>
            <el-divider></el-divider>
            <router-link :to="{path:'/welcome/recycle'}">
              <button :class="$route.path === '/welcome/recycle'?'active':''">
                <strong>回收站</strong>
              </button>
            </router-link>
          </div>
        </div>
      </div>
      <div class="list">
        <div class="header">
          <div class="search">
            <input type="text"
                   placeholder="搜索标题/文件夹名称" />
          </div>
          <div class="avatar">
            <user-avatar style="width:45px;height:45px">
            </user-avatar>
          </div>
        </div>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </div>
    </div>
    <create-modal ref="createModal"></create-modal>
  </section>
</template>
<script>
import UserAvatar from './UserAvatar'
import CreateModal from './Create'

export default {
  components: {
    UserAvatar,
    CreateModal
  },
}
</script>

  
<style lang="scss" scoped>
@import "@/style/variables.scss";

section.welcome {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: row;

    .left-side {
      width: 300px;
      min-width: 300px;
      background: $--background-color-base;
      position: relative;
      padding: 24px 16px;

      div.create-button {
        width: 100%;
        text-align: center;
        button {
          background: $--color-secondary;
          color: $--color-white;
          width: auto;
          border: none;
          font-size: 18px;
          height: 50px;
          line-height: 50px;
          border-radius: 50px;
          width: 50%;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: lighten($--color-secondary, 10%);
          }

          &:active {
            background: darken($--color-secondary, 10%);
          }
        }
      }

      .logo {
        margin-bottom: 32px;
      }

      .router {
        button {
          font-size: 12px;
          text-align: left;
          border: none;
          cursor: pointer;
          width: 100%;
          padding: 6px 12px;
          margin-bottom: 12px;
          background: transparent;
          border-radius: 4px;
          color: $--color-info;
          transition: all 0.3s;
          border: solid 1px transparent;

          i.fa {
            font-size: 16px;
            margin-right: 12px;
          }

          strong {
            font-size: 16px;
            font-weight: 400;
          }

          &.active {
            background: $--color-info;
            color: #fff;
          }

          &:not(.active):hover {
            background: #fff;
            color: $--color-info;
          }
        }
      }
    }

    .list {
      flex-grow: 1;
      padding: 32px;
      padding-top: 0;

      .header {
        height: 60px;
        padding: 12px 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: $--color-white;
        margin-bottom: 16px;

        .center {
          flex-grow: 1;
        }

        .search {
          flex-grow: 1;
          padding: 12px 0;

          input[type="text"] {
            width: 400px;
            background: $--background-color-base;
            padding: 0 24px;
            border: none;
            transition: all 0.3s;
            border-radius: 35px;
            height: 48px;

            &:hover {
              background: darken($--background-color-base, 5%);
            }
          }
        }
      }
    }
  }
}
</style>
