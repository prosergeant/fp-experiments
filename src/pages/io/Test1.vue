<script setup lang="ts">
import { IO } from '@/lib/io'
import { Option } from '@/lib/option'
import { ref } from 'vue'

const ratesHistory = ref<number[][]>([])
const result = ref(0)

// тут у нас типа запрос на какой нибудь сервис который может выдать ошибку
const dirtyRequest = (): Promise<Record<string, number>> =>
    new Promise((resolve, reject) => {
        if (Math.random() < 0.25) throw new Error('ne pupa i ne lupa')
        const key = Math.random() < 0.5 ? 'pupa' : 'lupa'
        setTimeout(() => resolve({ [key]: Math.random() }), 100)
    })

// оборачиваем наш грязный код в ИО
const getKeyFromDirty = (): IO<Record<string, number>> => IO.Delay(dirtyRequest)

// просто хелпер функция как стратегия восстановления
const retry = <A,>(f: IO<A>, maxRetries: number): IO<A> =>
    Array.from({ length: maxRetries })
        .map(() => f)
        .reduce((program, retryAction) => program.orElse(retryAction), f)

/**
 * соединяет два массива как молния на куртке
 * вовзращает кортеж
 * пример a = [1,2,3], b = ['a','b','c']
 * zip(a,b) = [[1,'a'], [2,'b'], [3, 'c']]
 * не самая лучшая реализация зип, но мне хотелось чтобы было в стиле фп
 */
const zip = <A, B>(arr1: A[], arr2: B[]): [A, B][] =>
    arr1
        .map((item, index) => [item, arr2[index]] as [A, B])
        .filter((pair): pair is [A, B] => pair[0] !== undefined && pair[1] !== undefined)

/**
 * получаем тенденцию
 * сначала зипуем массив с самим собой
 * пример [1,2,3] -> [[1,2], [2,3]]
 * таким образом у нас в одном кортеже получается инфа о текущем и о предыдущем курсе
 */
const tranding = (rates: number[]): boolean =>
    rates.length > 2 && zip(rates, rates.slice(1)).every(([prevRate, rate]) => rate > prevRate)

/**
 * это аналог из скалы
 * def lastRates(from: Currency, to: Currency): IO[List[BigDecimal]] = {
 *     for {
 *         table1 <- retry(exchangeTable(from), 10)
 *         table2 <- retry(exchangeTable(from), 10)
 *         table3 <- retry(exchangeTable(from), 10)
 *         lastTables = List(table1, table2, table3)
 *     } yield lastTables.flatMap(_.get(Currency(to)))
 * }
 *
 * exchangeTable возвращает IO[Map[Currency, BigDecimal]]
 */
const lastRates = (): IO<number[]> =>
    // prettier-ignore
    retry(getKeyFromDirty(), 10)
        .flatMap((t1) =>
            retry(getKeyFromDirty(), 10)
                .flatMap((t2) =>
                    retry(getKeyFromDirty(), 10)
                        .map((t3) => [t1, t2, t3]),
                ),
        )
        .map((rates) =>
            rates.flatMap((item) =>
                Option.fromNullable(item?.pupa)
                    .map((v) => [v])
                    .getOrElse([]),
            ),
        )

const exchangeIfTranding = (amount: number): IO<number> =>
    lastRates()
        .tap((rates) => {
            ratesHistory.value.push(rates)
        })
        .flatMap((rates) =>
            tranding(rates) ? IO.Of(amount * rates[rates.length - 1]!) : exchangeIfTranding(amount),
        )

const start = () => {
    ratesHistory.value.length = 0
    result.value = 0
    exchangeIfTranding(1000)
        .run()
        .then((res) => {
            result.value = res
        })
        .catch((err) => {
            console.log('laterBitches err', err)
        })
}
</script>

<template>
    <div class="test1">
        <p>pupa</p>
        <button @click="start">start</button>

        <p v-for="rate in ratesHistory" :key="JSON.stringify(rate)">{{ rate }}</p>
        <p>result: {{ result }}</p>
    </div>
</template>

<style scoped>
.test1 {
    display: flex;
    flex-direction: column;
    gap: 2px;

    p {
        padding: 0;
        line-height: 0;
    }

    button {
        padding: 2px 4px;
    }
}
</style>
