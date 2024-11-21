export default [
  {
    path: '/',
    redirect: '/welcome'
  },
  {
    name: 'welcome',
    path: '/welcome',
    component: () => import('@/components/Welcome'),
    children: [
      {
        path: 'mine/:folderId?',
        component: () => import('@/components/Mine'),
        meta: {
          keepAlive: true
        }
      },
      {
        path: 'team/:folderId?',
        component: () => import('@/components/Team'),
        meta: {
          keepAlive: true
        }
      },
      {
        path: 'favorite/:folderId?',
        component: () => import('@/components/Favorite'),
        meta: {
          keepAlive: true
        }
      },
      {
        path: 'recycle/:folderId?',
        component: () => import('@/components/Recycle'),
        meta: {
          keepAlive: true
        }
      },
      {
        path: '',
        redirect: '/welcome/mine'
      }
    ]
  },
  {
    name: 'map',
    path: '/map/:id?',
    component: () => import(`@/components/MapEditor`)
  },
  {
    path: '/personal',
    name: 'personal',
    component: () => import('@/components/Personal')
  },
  {
    path: '/login', component: () => import('@/components/Login')
  },
  {
    path: '/403', component: () => import('@/components/error/NotAccess')
  },
  {
    path: '/404', component: () => import('@/components/error/NotFound')
  }
]