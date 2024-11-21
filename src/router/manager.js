export default [
  {
    path: '/',
    redirect: '/welcome'
  },
  {
    name: 'Welcome',
    path: '/welcome',
    component: () => import('@/components/manager/Welcome')
  },
  {
    name: 'Element',
    path: '/element',
    component: () => import(`@/components/manager/Element`)
  },
  {
    name: 'Organization',
    path: '/organization',
    component: () => import(`@/components/manager/Organization`)
  },
  {
    name: 'Style',
    path: '/style',
    component: () => import(`@/components/manager/Style`)
  }
]