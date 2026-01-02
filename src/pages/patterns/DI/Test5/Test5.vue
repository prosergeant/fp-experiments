<script setup lang="ts">
import { useGeneralInfo } from '@/pages/patterns/DI/Test5/useGeneralInfo.ts'
import { useSomeComposable } from '@/pages/patterns/DI/Test5/useSomeComposable.ts'

const { CLIENT_CARD } = useGeneralInfo()

const { CLIENT_CARD: CLIENT_CARD2 } = useSomeComposable()
</script>

<template>
    <pre>{{ CLIENT_CARD }}</pre>
    <pre>{{ CLIENT_CARD2 }}</pre>
</template>

<style>
body {
    background: black;
    color: white;
}
</style>
