<script setup lang="ts">
import { StreamIO, IO } from '@/lib/io'
import { ref } from 'vue'
import { Option } from '@/lib/option.ts'

const request = async (n: number): Promise<Option<number>> => {
    console.log('request called', n)
    // if (Math.random() < 0.25) throw new Error('some shit')
    const map: Record<number, number> = {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6,
        6: 7,
        7: 8,
        8: 9,
        9: 10,
        10: 11,
    }
    return await new Promise((r) => setTimeout(() => r(Option.fromNullable(map[n])), 500))
}

const reqIo = (n: number) => IO.Delay(() => request(n))

const infinityStream = (n: number): StreamIO<number> =>
    StreamIO.fromIOArray([reqIo(n)])
        .unNone()
        .appendWithLast(async (la) => {
            const res = await la
            return res ? infinityStream(res) : StreamIO.fromArray([])
        })
        .orElse(() => infinityStream(n))

const stream$ = infinityStream(0) //.share()

const res1 = ref<number[]>([])
const res2 = ref<number[]>([])

// stream$
//     .filter((n) => n > 0.5)
//     .take(1)
//     .compile()
//     .toArray()
//     .run()
//     .then((res) => {
//         res1.value = res
//     })

stream$
    .filter((n) => n === 3)
    .take(1)
    .compile()
    .toArray()
    .run()
    .then((res) => {
        res2.value = res
    })
</script>

<template>
    <div class="test6">
        <p>streams 3</p>
        <p>res1: {{ res1 }}</p>
        <p>res2: {{ res2 }}</p>
    </div>
</template>

<style>
body {
    background: black;
    color: white;
}
</style>
