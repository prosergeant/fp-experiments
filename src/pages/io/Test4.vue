<script setup lang="ts">
import { IO, StreamIO } from '@/lib/io'
import { Option } from '@/lib/option'
import { ref } from 'vue'

type TKey = 'pupa' | 'lupa'

const dirtyRequest = (): Promise<Record<string, number>> =>
    new Promise((resolve) => {
        console.log('dirtyRequest called')
        if (Math.random() < 0.25) throw new Error('ne pupa i ne lupa')
        const key = Math.random() < 0.5 ? 'pupa' : 'lupa'
        setTimeout(() => resolve({ [key]: Math.random() }), 100)
    })

const dirtyIO: IO<Record<string, number>> = IO.Delay(dirtyRequest)

const getKeyFromDirty =
    (key: TKey) =>
    (record: Record<string, number>): Option<number> =>
        Option.fromNullable(record?.[key])

const rates = (key: TKey): StreamIO<number> =>
    StreamIO.fromIOArray([dirtyIO])
        .repeat()
        .map(getKeyFromDirty(key))
        .unNone()
        .orElse(() => rates(key))

const zip = <A, B>(arr1: A[], arr2: B[]): [A, B][] =>
    arr1
        .map((item, index) => [item, arr2[index]] as [A, B])
        .filter((pair): pair is [A, B] => pair[0] !== undefined && pair[1] !== undefined)

const tranding = (rates: number[]): boolean =>
    rates.length > 1 && zip(rates, rates.slice(1)).every(([prevRate, rate]) => rate > prevRate)

const exchangeIfTranding = (amount: number, key: TKey): IO<number> =>
    rates(key)
        .sliding(3)
        .filter(tranding)
        .take(1)
        .compile()
        .toArray()
        .map((n) => n?.[0])
        .map((n) => n?.[n?.length - 1])
        .map((n) => (n || 0) * amount)

const res = ref(0)
const start = async () => {
    res.value = await exchangeIfTranding(1000, 'pupa').run()
}
</script>

<template>
    <div class="test4">
        <p>streams 2</p>
        <button @click="start">start</button>
        <p>res: {{ res }}</p>
    </div>
</template>

<style scoped></style>
