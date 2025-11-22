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

    try {
        await new Promise((r) => setTimeout(r, 50))
        return Option.Some(map[n])
    } catch {
        return Option.None()
    }
}

const reqStream = (n: number): StreamIO<number> =>
    StreamIO.fromIOArray([IO.Delay(() => request(n))])
        .unNone()
        .appendWithLast((lastPromise) =>
            lastPromise ? reqStream(lastPromise) : StreamIO.fromArray([]),
        )

const stream2$ = reqStream(0) //.share()

const res1 = ref<number[]>([])

stream2$
    // .take(2)
    .compile()
    .toArray()
    .run()
    .then((res) => {
        // res1.value.push(res.getOrElse(0))
        res1.value = res
    })
</script>

<template>
    <div class="test6">
        <p>streams 3</p>
        <p>res1: {{ res1 }}</p>
    </div>
</template>

<style>
body {
    background: black;
    color: white;
}
</style>
