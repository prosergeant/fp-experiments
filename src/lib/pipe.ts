type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

interface PipeAsyncFn {
	<A>(value: Promise<A> | A): Promise<A>
	<A, B>(value: Promise<A> | A, fn1: (a: A) => B | Promise<B>): Promise<UnwrapPromise<B>>
	<A, B, C>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>
	): Promise<UnwrapPromise<C>>
	<A, B, C, D>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>
	): Promise<UnwrapPromise<D>>

	<A, B, C, D, E>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>,
		fn4: (d: UnwrapPromise<D>) => E | Promise<E>
	): Promise<UnwrapPromise<E>>

	<A, B, C, D, E, F>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>,
		fn4: (d: UnwrapPromise<D>) => E | Promise<E>,
		fn5: (e: UnwrapPromise<E>) => F | Promise<F>
	): Promise<UnwrapPromise<F>>

	<A, B, C, D, E, F, G>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>,
		fn4: (d: UnwrapPromise<D>) => E | Promise<E>,
		fn5: (e: UnwrapPromise<E>) => F | Promise<F>,
		fn6: (f: UnwrapPromise<F>) => G | Promise<G>
	): Promise<UnwrapPromise<G>>

	<A, B, C, D, E, F, G, H>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>,
		fn4: (d: UnwrapPromise<D>) => E | Promise<E>,
		fn5: (e: UnwrapPromise<E>) => F | Promise<F>,
		fn6: (f: UnwrapPromise<F>) => G | Promise<G>,
		fn7: (g: UnwrapPromise<G>) => H | Promise<H>
	): Promise<UnwrapPromise<H>>

	<A, B, C, D, E, F, G, H, I>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>,
		fn4: (d: UnwrapPromise<D>) => E | Promise<E>,
		fn5: (e: UnwrapPromise<E>) => F | Promise<F>,
		fn6: (f: UnwrapPromise<F>) => G | Promise<G>,
		fn7: (g: UnwrapPromise<G>) => H | Promise<H>,
		fn8: (h: UnwrapPromise<H>) => I | Promise<I>
	): Promise<UnwrapPromise<I>>

	<A, B, C, D, E, F, G, H, I, J>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>,
		fn4: (d: UnwrapPromise<D>) => E | Promise<E>,
		fn5: (e: UnwrapPromise<E>) => F | Promise<F>,
		fn6: (f: UnwrapPromise<F>) => G | Promise<G>,
		fn7: (g: UnwrapPromise<G>) => H | Promise<H>,
		fn8: (h: UnwrapPromise<H>) => I | Promise<I>,
		fn9: (i: UnwrapPromise<I>) => J | Promise<J>
	): Promise<UnwrapPromise<J>>

	<A, B, C, D, E, F, G, H, I, J, K>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>,
		fn4: (d: UnwrapPromise<D>) => E | Promise<E>,
		fn5: (e: UnwrapPromise<E>) => F | Promise<F>,
		fn6: (f: UnwrapPromise<F>) => G | Promise<G>,
		fn7: (g: UnwrapPromise<G>) => H | Promise<H>,
		fn8: (h: UnwrapPromise<H>) => I | Promise<I>,
		fn9: (i: UnwrapPromise<I>) => J | Promise<J>,
		fn10: (j: UnwrapPromise<J>) => K | Promise<K>
	): Promise<UnwrapPromise<K>>

	<A, B, C, D, E, F, G, H, I, J, K, L>(
		value: Promise<A> | A,
		fn1: (a: A) => B | Promise<B>,
		fn2: (b: UnwrapPromise<B>) => C | Promise<C>,
		fn3: (c: UnwrapPromise<C>) => D | Promise<D>,
		fn4: (d: UnwrapPromise<D>) => E | Promise<E>,
		fn5: (e: UnwrapPromise<E>) => F | Promise<F>,
		fn6: (f: UnwrapPromise<F>) => G | Promise<G>,
		fn7: (g: UnwrapPromise<G>) => H | Promise<H>,
		fn8: (h: UnwrapPromise<H>) => I | Promise<I>,
		fn9: (i: UnwrapPromise<I>) => J | Promise<J>,
		fn10: (j: UnwrapPromise<J>) => K | Promise<K>,
		fn11: (k: UnwrapPromise<K>) => L | Promise<L>
	): Promise<UnwrapPromise<L>>
}

interface PipeFn {
	<A>(value: A): A
	<A, B>(value: A, fn1: (a: A) => B): B
	<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C
	<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D
	<A, B, C, D, E>(
		value: A,
		fn1: (a: A) => B,
		fn2: (b: B) => C,
		fn3: (c: C) => D,
		fn4: (d: D) => E
	): E
	<A, B, C, D, E, F>(
		value: A,
		fn1: (a: A) => B,
		fn2: (b: B) => C,
		fn3: (c: C) => D,
		fn4: (d: D) => E,
		fn5: (e: E) => F
	): F
	<A, B, C, D, E, F, G>(
		value: A,
		fn1: (a: A) => B,
		fn2: (b: B) => C,
		fn3: (c: C) => D,
		fn4: (d: D) => E,
		fn5: (e: E) => F,
		fn6: (f: F) => G
	): G
	<A, B, C, D, E, F, G, H>(
		value: A,
		fn1: (a: A) => B,
		fn2: (b: B) => C,
		fn3: (c: C) => D,
		fn4: (d: D) => E,
		fn5: (e: E) => F,
		fn6: (f: F) => G,
		fn7: (g: G) => H
	): H
}

const pipeAsyncImplementation = async (
	value: Promise<any>,
	...fns: Array<(arg: any) => any | Promise<any>>
): Promise<any> => {
	let result = await value
	for (const fn of fns) {
		result = await fn(result)
	}
	return result
}

const pipeImplementation = (value: any, ...fns: Array<(arg: any) => any>): any =>
	fns.reduce((acc, fn) => fn(acc), value)

export const pipeAsync: PipeAsyncFn = pipeAsyncImplementation
export const pipe: PipeFn = pipeImplementation
