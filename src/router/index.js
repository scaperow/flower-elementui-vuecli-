export default [
  {
    path: '/', component: () => import('@/components/Drawer')
  },
  {
    path: '/editor', component: () => import('@/components/Editor')
  }, {
    path: '/test', component: () => import('@/components/Test.vue')
  }, {
    path: '/draw', component: () => import('@/components/Drawer.vue')
  }, {
    path: '/tool', component: () => import('@/components/Tools.vue')
  }
]