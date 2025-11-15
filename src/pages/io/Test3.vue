<script setup lang="ts">
import { IO, StreamIO } from '@/lib/io'

const dieCast = (): number => {
    console.log('the die is cast')
    return Math.floor(Math.random() * 6) + 1
}

const castTheDie = IO.Delay(dieCast)

const infinityDieCastStream = StreamIO.fromIOArray([castTheDie]).repeat()

// 1) извлечь из потока и вернуть первые три нечетных числа;
infinityDieCastStream
    .filter((n) => n % 2 !== 0)
    .take(3)
    .runCollect()
    .then((res) => console.log('1)', res))

// 2) вернуть результаты первых пяти бросков кубика, но при этом
// удвоить все значения 6 (например, получив [1, 2, 3, 6, 4], вы
// должны вернуть [1, 2, 3, 12, 4]);
infinityDieCastStream
    .take(5)
    .map((n) => (n === 6 ? 12 : n))
    .runCollect()
    .then((res) => {
        console.log('2) 6 * 2', res)
    })

// 3) вернуть сумму результатов первых трех бросков;
infinityDieCastStream
    .take(3)
    .runCollect()
    .then((res) => {
        console.log(
            '3) sum',
            res,
            res.reduce((sum, i) => sum + i, 0),
        )
    })

// 4) бросать кубик до выпадения 5, а затем сделать еще два броска
// и вернуть три последних результата (число 5 и еще два значения);
infinityDieCastStream
    .filter((n) => n === 5)
    .take(1)
    .runCollect()
    .then((res) =>
        infinityDieCastStream
            .take(2)
            .runCollect()
            .then((res2) => {
                console.log('4)', res.concat(res2))
            }),
    )

// 5) вернуть первые три результата без изменений, а следующие три —
// с утроением (всего должно быть шесть результатов).
</script>

<template>
    <div>streams</div>
</template>

<style scoped></style>
