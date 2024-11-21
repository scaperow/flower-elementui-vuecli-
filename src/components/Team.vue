<template>
  <section class="mine">
    <file-list root-name="我的共享"
               :filter="filter"
               ref="fileList"></file-list>
  </section>
</template>
<script>

import Parse from 'parse'
import Http from '@/api/common'
import { mapGetters } from 'vuex'
import NanoId from 'nanoid'
import ShareModal from './Share'
import CreateModal from './Create'
import FileList from './FileList'
const WorksClass = Parse.Object.extend('works')

export default {
  computed: {
    ...mapGetters({
      user: 'user/user'
    }),
    currentFolder () {
      return _.last(this.folderPath)
    }
  },
  components: {
    ShareModal, CreateModal, FileList
  },
  data () {
    return {
      filter: null
    }
  },
  created () {
    this.filter = new Parse.Query(WorksClass).
      equalTo('creator', this.user.objectId).
      doesNotExist('isDelete')
  }
}
</script>
<style lang="scss" scoped>
</style>



