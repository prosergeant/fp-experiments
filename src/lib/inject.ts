export const INJECT_META = Symbol('inject_meta')

type InjectEntry<T> =
    | {
          kind: 'field'
          name: PropertyKey
          token: Token<T>
      }
    | {
          kind: 'method'
          name: PropertyKey
          tokens: Token<T>[]
      }

export type InjectableInstance<T> = {
    [INJECT_META]?: InjectEntry<T>[]
}

export type Token<T> = symbol & { readonly __type: (v: T) => T }
export const createToken = <T>(description?: string): Token<T> => Symbol(description) as Token<T>

export function Inject<T>(
    token: Token<T>,
): (value: undefined, context: ClassFieldDecoratorContext<any, T>) => void

export function Inject<T extends any[]>(
    ...tokens: { [K in keyof T]: Token<T[K]> }
): (value: Function, context: ClassMethodDecoratorContext<any, (...args: T) => any>) => void

export function Inject(...tokens: any[]) {
    return function (
        value: any,
        context: ClassFieldDecoratorContext | ClassMethodDecoratorContext,
    ) {
        context.addInitializer(function (this: any) {
            if (!this[INJECT_META]) {
                this[INJECT_META] = []
            }

            if (context.kind === 'field') {
                // поле
                this[INJECT_META].push({
                    kind: 'field',
                    name: context.name,
                    token: tokens[0],
                })
            }

            if (context.kind === 'method') {
                // метод
                this[INJECT_META].push({
                    kind: 'method',
                    name: context.name,
                    tokens,
                })
            }
        })
    }
}
