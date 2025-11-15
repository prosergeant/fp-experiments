import { Option } from './option'

export class Either<L, R> {
	private readonly leftValue?: L
	private readonly rightValue?: R
	private readonly isRightValue: boolean

	private constructor(isRight: boolean, leftValue?: L, rightValue?: R) {
		this.leftValue = leftValue
		this.rightValue = rightValue
		this.isRightValue = isRight
	}

	static Left<L, R>(value: L): Either<L, R> {
		return new Either<L, R>(false, value)
	}

	static Right<L, R>(value: R): Either<L, R> {
		if (value === null || value === undefined)
			return Either.Left<L, R>(
				'Непредвиденная ошибка (null или undefined в правой части)' as L
			)
		return new Either<L, R>(true, undefined, value)
	}

	static FromOption =
		<L, R>(onNone: () => L) =>
		(option: Option<R>): Either<L, R> => {
			if (option.isSome()) {
				return Either.Right(option.value)
			}
			return Either.Left(onNone())
		}

	static fromOption<L, R>(option: Option<R>, onNone: () => L): Either<L, R> {
		if (option.isSome()) {
			return Either.Right(option.value)
		}
		return Either.Left(onNone())
	}

	static Map =
		<L, R, T>(fn: (r: R) => T) =>
		(either: Either<L, R>): Either<L, T> =>
			either.map(fn)

	static FlatMap =
		<L, R, T>(fn: (r: R) => Either<L, T>) =>
		(either: Either<L, R>): Either<L, T> =>
			either.flatMap(fn)

	static FlatMapAsync =
		<L, R, T>(fn: (r: R) => Promise<Either<L, T>>) =>
		(either: Either<L, R>): Promise<Either<L, T>> =>
			either.flatMapAsync(fn)

	static Tap =
		<L, R>(fn: (r: R) => void) =>
		(either: Either<L, R>): Either<L, R> =>
			either.tap(fn)

	isRight(): boolean {
		return this.isRightValue
	}

	map<T>(fn: (r: R) => T): Either<L, T> {
		if (this.isRight()) {
			return Either.Right(fn(this.rightValue as R))
		}
		return Either.Left(this.leftValue as L)
	}

	flatMap<T>(fn: (r: R) => Either<L, T>): Either<L, T> {
		if (this.isRight()) {
			return fn(this.rightValue as R)
		}
		return Either.Left(this.leftValue as L)
	}

	async flatMapAsync<T>(fn: (r: R) => Promise<Either<L, T>>): Promise<Either<L, T>> {
		if (this.isRight()) {
			return await fn(this.rightValue as R)
		}
		return Promise.resolve(Either.Left(this.leftValue as L))
	}

	tap(fn: (r: R) => void): Either<L, R> {
		if (this.isRight()) {
			fn(this.rightValue as R)
		}
		return this
	}

	fold<T>(onLeft: (l: L) => T, onRight: (r: R) => T): T {
		if (this.isRight()) {
			return onRight(this.rightValue as R)
		} else {
			return onLeft(this.leftValue as L)
		}
	}
}
