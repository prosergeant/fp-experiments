import { Option } from './option'

export class IO<A> {
    private constructor(private readonly thunk: () => Promise<A>) {}

    static Of<A>(a: A): IO<A> {
        return new IO(() => Promise.resolve(a))
    }
    static Delay<A>(f: () => A | Promise<A>): IO<A> {
        return new IO(() => Promise.resolve().then(f))
    }

    static Sequence<A>(ios: IO<A>[]): IO<A[]> {
        return new IO(async () => {
            const result: A[] = []
            for (const io of ios) {
                result.push(await io.run())
            }
            return result
        })
    }

    static SequencePar<A>(ios: IO<A>[]): IO<A[]> {
        return new IO(() => Promise.all(ios.map((io) => io.run())))
    }

    run(): Promise<A> {
        return this.thunk()
    }

    map<B>(f: (a: A) => B): IO<B> {
        return new IO(() => this.run().then(f))
    }
    flatMap<B>(f: (a: A) => IO<B>): IO<B> {
        return new IO(() => this.run().then((a) => f(a).run()))
    }
    orElse(other: IO<A>): IO<A> {
        return new IO(() => this.run().catch(() => other.run()))
    }

    // (выполнить сайд‑эффект и вернуть исходное значение)
    tap(f: (a: A) => void | Promise<void>): IO<A> {
        return new IO(async () => {
            const a = await this.run()
            await f(a)
            return a
        })
    }
}

export class StreamIO<A> {
    constructor(readonly gen: () => AsyncIterable<IO<A>>) {}

    // from array of IO
    static fromIOArray<A>(arr: IO<A>[]): StreamIO<A> {
        return new StreamIO(async function* () {
            for (const io of arr) yield io
        })
    }

    // from array of raw values
    static fromArray<A>(arr: A[]): StreamIO<A> {
        return StreamIO.fromIOArray(arr.map(IO.Of))
    }

    map<B>(f: (a: A) => B): StreamIO<B> {
        const self = this
        return new StreamIO(async function* () {
            for await (const io of self.gen()) {
                yield io.map(f)
            }
        })
    }

    flatMap<B>(f: (a: A) => StreamIO<B>): StreamIO<B> {
        const self = this
        return new StreamIO(async function* () {
            for await (const io of self.gen()) {
                const a = await io.run()
                const inner = f(a)
                for await (const io2 of inner.gen()) {
                    yield io2
                }
            }
        })
    }

    filter(p: (a: A) => boolean): StreamIO<A> {
        const self = this
        return new StreamIO(async function* () {
            for await (const io of self.gen()) {
                const a = await io.run()
                if (p(a)) yield IO.Of(a)
            }
        })
    }

    tap(f: (a: A) => void): StreamIO<A> {
        const self = this
        return new StreamIO(async function* () {
            for await (const io of self.gen()) {
                const a = await io.run()
                f(a)
                yield IO.Of(a)
            }
        })
    }

    take(n: number): StreamIO<A> {
        const self = this
        return new StreamIO(async function* () {
            let i = 0
            for await (const io of self.gen()) {
                if (i++ >= n) break
                yield io
            }
        })
    }

    repeat(): StreamIO<A> {
        const self = this
        return new StreamIO(async function* () {
            while (true) {
                for await (const io of self.gen()) {
                    yield io
                }
            }
        })
    }

    repeatN(n: number): StreamIO<A> {
        const self = this
        return new StreamIO(async function* () {
            for (let i = 0; i < n; i++) {
                for await (const io of self.gen()) {
                    yield io
                }
            }
        })
    }

    unNone<B>(this: StreamIO<Option<B>>): StreamIO<B> {
        const self = this
        return new StreamIO(async function* () {
            for await (const io of self.gen()) {
                const opt = await io.run()
                if (opt.isSome()) {
                    yield IO.Of(opt.value)
                }
            }
        })
    }

    orElse(other: () => StreamIO<A>): StreamIO<A> {
        const self = this

        return new StreamIO(async function* () {
            try {
                for await (const io of self.gen()) {
                    try {
                        const v = await io.run()
                        yield IO.Of(v)
                    } catch (ioErr) {
                        // Ошибка внутри IO — fallback
                        const fallback = other()
                        for await (const io2 of fallback.gen()) {
                            yield io2
                        }
                        return
                    }
                }
            } catch (streamErr) {
                // Ошибка в самом генераторе — тоже fallback
                const fallback = other()
                for await (const io2 of fallback.gen()) {
                    yield io2
                }
                return
            }
        })
    }

    sliding(n: number): StreamIO<A[]> {
        const self = this

        return new StreamIO(async function* () {
            if (n <= 0) {
                throw new Error('sliding window size must be > 0')
            }

            const buffer: A[] = []

            for await (const io of self.gen()) {
                const value = await io.run()

                // Добавляем новое значение
                buffer.push(value)

                // Если переполнились — удаляем старое
                if (buffer.length > n) {
                    buffer.shift()
                }

                // Начинаем yield'ить когда буфер заполнен
                if (buffer.length === n) {
                    yield IO.Of([...buffer])
                }
            }
        })
    }

    chunkN(n: number): StreamIO<A[]> {
        const self = this

        return new StreamIO(async function* () {
            if (n <= 0) {
                throw new Error('chunkN size must be > 0')
            }

            const buffer: A[] = []

            for await (const io of self.gen()) {
                const value = await io.run()

                // Добавляем новое значение
                buffer.push(value)

                if (buffer.length === n) {
                    yield IO.Delay(() => buffer)
                    buffer.length = 0
                }
            }

            // если остался хвост — тоже вернуть
            if (buffer.length > 0) {
                yield IO.Delay(() => buffer)
            }
        })
    }

    scanReduce<B>(zero: B, f: (acc: B, value: A) => B): StreamIO<B> {
        const self = this
        return new StreamIO(async function* () {
            let acc = zero
            for await (const io of self.gen()) {
                acc = f(acc, await io.run())
                yield IO.Delay(() => acc)
            }
        })
    }

    append(other: () => StreamIO<A>): StreamIO<A> {
        const self = this

        return new StreamIO(async function* () {
            // Первый поток
            for await (const io of self.gen()) {
                yield io
            }

            // Лениво создаём второй поток
            const snd = other()

            for await (const io of snd.gen()) {
                yield io
            }
        })
    }

    appendWithLast(other: (la?: Promise<A>) => Promise<StreamIO<A>>): StreamIO<A> {
        const self = this

        let lastItem: IO<A> | undefined

        return new StreamIO(async function* () {
            // Первый поток
            for await (const io of self.gen()) {
                lastItem = io
                yield io
            }

            // Лениво создаём второй поток
            const snd = await other(lastItem?.run?.())

            for await (const io of snd.gen()) {
                yield io
            }
        })
    }

    memoize(): StreamIO<A> {
        const self = this
        let cache: IO<A>[] | null = null
        let computing: Promise<void> | null = null

        async function computeCache() {
            const result: IO<A>[] = []
            for await (const io of self.gen()) {
                result.push(io)
            }
            cache = result
        }

        return new StreamIO(async function* () {
            if (!cache) {
                if (!computing) {
                    computing = computeCache()
                }
                await computing
            }

            for (const io of cache!) {
                yield io
            }
        })
    }

    share(): StreamIO<A> {
        const self = this
        const gen = self.gen() // общий генератор
        const buffer: IO<A>[] = [] // Для будущих читателей
        let reading = false
        let done = false

        return new StreamIO(async function* () {
            let index = 0

            while (true) {
                if (index < buffer.length) {
                    yield buffer[index]
                    index++
                    continue
                }

                if (done) return

                if (!reading) {
                    reading = true
                    const { value, done: isDone } = await gen[Symbol.asyncIterator]().next()
                    reading = false

                    if (isDone) {
                        done = true
                        return
                    }

                    buffer.push(value)
                    yield value
                    index++
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 0))
                }
            }
        })
    }

    compile() {
        const self = this

        return {
            toArray(): IO<A[]> {
                return IO.Delay(async () => {
                    const out: A[] = []
                    for await (const io of self.gen()) {
                        out.push(await io.run())
                    }
                    return out
                })
            },

            drain(): IO<void> {
                return IO.Delay(async () => {
                    for await (const io of self.gen()) {
                        await io.run()
                    }
                })
            }
        }
    }
}
