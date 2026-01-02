<script setup lang="ts">
import { useGeneralInfo } from '@/pages/patterns/DI/Test5/useGeneralInfo.ts'

const { CLIENT_CARD } = useGeneralInfo()
</script>

<template>
    <pre>{{ CLIENT_CARD }}</pre>
    <router-link :to="{ name: 'DI-Test5-1' }">to some composable</router-link>
</template>

<style>
body {
    background: black;
    color: white;
}
</style>
