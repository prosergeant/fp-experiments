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

    tap(f: (a: A) => IO<any>): StreamIO<A> {
        const self = this
        return new StreamIO(async function* () {
            for await (const io of self.gen()) {
                const a = await io.run()
                await f(a).run()
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

    async runCollect(): Promise<A[]> {
        const out: A[] = []
        for await (const io of this.gen()) {
            out.push(await io.run())
        }
        return out
    }
}
