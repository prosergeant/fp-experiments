export class Option<T> {
    private readonly _tag: 'Some' | 'None'
    private readonly _value?: T

    constructor(tag: 'Some' | 'None', value?: T) {
        this._tag = tag
        this._value = value
    }

    static Some<T>(value: T): Option<NonNullable<T>> {
        if (value === undefined || value === null) return Option.None()
        return new Option('Some', value)
    }

    static None(): Option<never> {
        return new Option('None')
    }

    static Tap =
        <T>(fn: (value: T) => void) =>
        (option: Option<T>): Option<T> => {
            option.map(fn)
            return option
        }

    static Filter =
        <T>(predicate: (value: T) => boolean) =>
        (option: Option<T>): Option<T> =>
            option.filter(predicate)

    static FilterIsNonEmptyArray = <T>(option: Option<T>): Option<T> =>
        option.filter((v) => Array.isArray(v) && v.length > 0)

    static Map =
        <T, U>(fn: (value: T) => U) =>
        (option: Option<T>): Option<NonNullable<U>> =>
            option.map(fn)

    static FlatMap =
        <T, U>(fn: (value: T) => Option<U>) =>
        (option: Option<T>): Option<U> =>
            option.flatMap(fn)

    static MapAsync =
        <T, U>(fn: (value: T) => Promise<U>) =>
        async (option: Option<T>): Promise<Option<U>> =>
            option.isSome() ? Option.Some(await fn(option.value!)) : Option.None()

    static FlatMapAsync =
        <T, U>(fn: (value: T) => Promise<Option<U>>) =>
        async (option: Option<T>): Promise<Option<U>> =>
            option.isSome() ? await fn(option.value) : Option.None()

    static fromNullable<T>(value: T | null | undefined): Option<T> {
        return value === null || value === undefined ? Option.None() : Option.Some(value)
    }

    static Do: Option<{}> = Option.Some({})

    static Bind<Key extends string, T, R>(
        key: Key,
        fn: (scope: T) => Option<R>,
    ): (ma: Option<T>) => Option<T & { [K in Key]: R }> {
        return (ma) =>
            ma.flatMap((scope) => fn(scope).map((value) => ({ ...scope, [key]: value }) as any))
    }

    static BindTo<Key extends string, T>(key: Key): (fa: Option<T>) => Option<{ [k in Key]: T }> {
        return (fa) => fa.map((value) => ({ [key]: value }) as any)
    }

    bind<Key extends string, R>(
        key: Key,
        fn: (value: T) => Option<R>,
    ): Option<T & { [K in Key]: R }> {
        return this.flatMap((value) =>
            fn(value).map((newValue) => ({ ...(value as any), [key]: newValue })),
        )
    }

    bindTo<Key extends string>(key: Key): Option<{ [k in Key]: T }> {
        return this.map((value) => ({ [key]: value }) as any)
    }

    get value(): T | undefined {
        return this._value
    }

    isSome(): this is Option<T> & { value: T } {
        return this._tag === 'Some'
    }

    isNone(): boolean {
        return this._tag === 'None'
    }

    map<U>(fn: (value: T) => U): Option<NonNullable<U>> {
        if (this.isSome()) {
            return Option.Some(fn(this.value))
        }
        return Option.None()
    }

    filter(predicate: (value: T) => boolean): Option<T> {
        if (this.isSome()) {
            return predicate(this.value!) ? this : Option.None()
        }
        return Option.None()
    }

    flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
        if (this.isSome()) {
            return fn(this.value)
        }
        return Option.None()
    }

    async flatMapAsync<U>(fn: (value: T) => Promise<Option<U>>): Promise<Option<U>> {
        if (this.isSome()) {
            return await fn(this.value)
        }
        return Option.None()
    }

    getOrElse(defaultValue: T): T {
        return this.isSome() ? this.value : defaultValue
    }

    orElse(otherOption: Option<T>): Option<T> {
        return this.isSome() ? this : otherOption
    }

    match<U>(matcher: { some: (value: T) => U; none: () => U }): U {
        return this.isSome() ? matcher.some(this.value) : matcher.none()
    }
}
