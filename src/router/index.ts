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
    ],
})

export default router
