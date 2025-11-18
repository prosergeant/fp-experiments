<script setup lang="ts">
import { StreamIO } from '@/lib/io'
import { ref } from 'vue'

type TCity = Record<string, number>

const checkIns$ = StreamIO.fromArray([
    'Sydney',
    'Dublin',
    'Cape Town',
    'Lima',
    'Singapore',
]).repeatN(600_000)

const topCities = (cityCheckIns: TCity): [string, number][] =>
    Object.entries(cityCheckIns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)

const result = ref<[string, number][][]>([])

const processChunk = (chunk: string[]) => {
    const local: TCity = {}

    for (const city of chunk) {
        local[city] = (local[city] ?? 0) + 1
    }

    return local
}

const mergeCounters = (acc: TCity, part: TCity): TCity => {
    for (const [city, count] of Object.entries(part)) {
        acc[city] = (acc[city] ?? 0) + count
    }
    return acc
}

const prepareCheckins = () =>
    checkIns$
        .append(() => StreamIO.fromArray(['Sydney', 'Lima', 'Dublin', 'Sydney', 'Sydney', 'Lima']))
        .chunkN(100_000)
        .map(processChunk)
        .scanReduce({}, mergeCounters)
        .map(topCities)
        .compile()
        .toArray()
        .run()
        .then((res) => {
            console.log(res) //.flat())
            result.value = res.reverse().slice(0, 10)
        })

const diff = ref(0)

const start = async () => {
    const start = Date.now()
    await prepareCheckins()
    const stop = Date.now()
    diff.value = stop - start
}
</script>

<template>
    <div class="test5">
        <p>streams and chunks</p>
        <button @click="start">start</button>
        <p>time diff: {{ diff / 1000 }}s</p>
        <pre>{{ result }}</pre>
    </div>
</template>

<style scoped></style>
