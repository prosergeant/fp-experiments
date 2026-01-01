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
        {
            name: 'IO-Test7',
            path: '/io/test7',
            component: () => import('@/pages/io/Test7.vue'),
        },
        {
            name: 'Spec-Test1',
            path: '/spec/test1',
            component: () => import('@/pages/patterns/specification/Test1.vue'),
        },
        {
            name: 'DI-Test1',
            path: '/di/test1',
            component: () => import('@/pages/patterns/DI/Test1.vue'),
        },
        {
            name: 'DI-Test2',
            path: '/di/test2',
            component: () => import('@/pages/patterns/DI/Test2.vue'),
        },
        {
            name: 'DI-Test3',
            path: '/di/test3',
            component: () => import('@/pages/patterns/DI/Test3.vue'),
        },
        {
            name: 'DI-Test4',
            path: '/di/test4',
            component: () => import('@/pages/patterns/DI/Test4/Test4.vue'),
        },
        {
            name: 'DI-Test5',
            path: '/di/test5',
            component: () => import('@/pages/patterns/DI/Test5/Test5.vue'),
        },
    ],
})

export default router
