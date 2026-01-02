<script setup lang="ts">
import { useSomeComposable } from '@/pages/patterns/DI/Test5/useSomeComposable.ts'

const { CLIENT_CARD } = useSomeComposable()
</script>

<template>
    <pre>{{ CLIENT_CARD }}</pre>
    <router-link :to="{ name: 'DI-Test5' }">to generalInfo composable</router-link>
</template>

<style>
body {
    background: black;
    color: white;
}
</style>
