<script setup lang="ts">
import { IO, StreamIO } from '@/lib/io'
import { Option } from '@/lib/option'

type TKey = 'pupa' | 'lupa'

const dirtyRequest = (): Promise<Record<string, number>> =>
    new Promise((resolve) => {
        if (Math.random() < 0.25) throw new Error('ne pupa i ne lupa')
        const key = Math.random() < 0.5 ? 'pupa' : 'lupa'
        setTimeout(() => resolve({ [key]: Math.random() }), 100)
    })

const dirtyIO: IO<Record<string, number>> = IO.Delay(dirtyRequest)

const getKeyFromDirty =
    (key: TKey) =>
    (record: Record<string, number>): Option<number> =>
        Option.fromNullable(record?.[key])

const rates = (): StreamIO<number> =>
    StreamIO.fromIOArray([dirtyIO])
        .repeat()
        .map(getKeyFromDirty('pupa'))
        .unNone()
        .orElse(() => rates())

rates()
    .take(3)
    .runCollect()
    .then((res) => {
        console.log('rates 3', res)
    })
</script>

<template>
    <div>streams</div>
</template>

<style scoped></style>
