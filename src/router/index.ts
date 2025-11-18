import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            name: 'IO-Test1',
            path: '/io/test1',
            component: () => import('@/pages/io/Test1.vue'),
        },
        {
            name: 'IO-Test2',
            path: '/io/test2',
            component: () => import('@/pages/io/Test2.vue'),
        },
        {
            name: 'IO-Test3',
            path: '/io/test3',
            component: () => import('@/pages/io/Test3.vue'),
        },
        {
            name: 'IO-Test4',
            path: '/io/test4',
            component: () => import('@/pages/io/Test4.vue'),
        },
        {
            name: 'IO-Test5',
            path: '/io/test5',
            component: () => import('@/pages/io/Test5.vue'),
        },
        {
            name: 'IO-Test6',
            path: '/io/test6',
            component: () => import('@/pages/io/Test6.vue'),
        },
    ],
})

export default router
