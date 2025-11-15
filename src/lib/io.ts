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
