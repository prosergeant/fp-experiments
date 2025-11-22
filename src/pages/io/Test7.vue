<script setup lang="ts">
import { StreamIO, IO } from '@/lib/io.ts'
import { ref } from 'vue'

type TType = 'pupa' | 'lupa'
type TData = { type: TType; message: string }

let ws: null | WebSocket = null
const res = ref<string[]>([])

function socketStream(url: string): StreamIO<string> {
    return new StreamIO(async function* () {
        ws = new WebSocket(url)

        const queue: string[] = []
        let pump: null | (() => void) = null

        await new Promise<void>((res) => {
            if (ws) ws.onopen = () => res()
        })

        ws.onmessage = (msg) => {
            queue.push(msg.data)
            // дергаем next() генератора
            pump?.()
        }

        try {
            while (true) {
                if (queue.length === 0) {
                    await new Promise<void>((res) => (pump = res))
                    pump = null
                }
                yield IO.Of(queue.shift()!)
            }
        } finally {
            ws.close()
        }
    })
}

const socket$ = socketStream('wss://ws.ifelse.io')

socket$
    .map((data) => {
        try {
            return JSON.parse(data) as TData
        } catch {
            return { type: 'pupa', message: 'lupa' } satisfies TData
        }
    })
    .tap((v) => {
        console.log('tap', v)
    })
    .filter((data) => data.type === 'pupa')
    .map((data) => data.message)
    .tap((s) => {
        res.value.push(s)
    })
    .take(10)
    .compile()
    .toArray()
    .run()
    .then((res) => {
        console.log(res)
    })

const generateData = (type: TType, message: string) =>
    JSON.stringify({
        type,
        message,
    })

let test = 1

const sendTest = () => {
    ws?.send(generateData('pupa', `${test++}`))
    ws?.send(generateData('lupa', `${test++}`))
}
</script>

<template>
    <div>stream socket</div>
    <button @click="sendTest">send test info</button>
    <pre>{{ res }}</pre>
</template>

<style scoped></style>
