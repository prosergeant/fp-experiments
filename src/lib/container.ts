import { INJECT_META, type InjectableInstance, type Token } from '@/lib/inject.ts'

export type ResolveContext = {
    profile?: 'jedi' | 'sith' | 'neutral'
    controller?: 'player' | 'ai'
    character?: {
        id: string
        name: string
        maxHp: number
        hp: number
        baseDamage: number
    }
}

// prettier-ignore
type Provider<T> =
    | ((ctx: ResolveContext) => T)
    | T

type Scope = 'Singleton' | 'Transient'

type Binding<T> = {
    provider: Provider<T>
    scope: Scope
    when?: (ctx: ResolveContext) => boolean
}

class Container {
    private bindings = new Map<Token<any>, Binding<any>[]>()

    // кэш singleton-инстансов (factory тоже может быть singleton)
    private instances = new Map<Binding<any>, any>()

    // защита от повторной активации
    private activated = new WeakSet<object>()

    register<T>(token: Token<T>, provider: Provider<T>, scope: Scope = 'Singleton') {
        const arr = this.bindings.get(token) || []
        arr.push({ provider, scope })
        this.bindings.set(token, arr)
    }

    bind<T>(token: Token<T>) {
        const self = this

        return {
            to(provider: Provider<T>, scope: Scope = 'Singleton') {
                const binding: Binding<T> = { provider, scope }

                const arr = self.bindings.get(token) || []
                arr.push(binding)
                self.bindings.set(token, arr)

                return {
                    when(predicate: (ctx: ResolveContext) => boolean) {
                        binding.when = predicate
                        return this
                    },
                }
            },
        }
    }

    resolve<T>(token: Token<T>, ctx: ResolveContext = {}): T {
        const bindings = this.bindings.get(token)

        if (!bindings || bindings.length === 0) {
            throw new Error(`No bindings for token ${token?.toString()}`)
        }

        const candidates = bindings.filter((b) => !b.when || b.when(ctx))

        if (candidates.length === 0) {
            throw new Error(
                `No matching binding for token ${token.toString()} with ctx ${JSON.stringify(ctx)}`,
            )
        }

        if (candidates.length > 1) {
            throw new Error(`Ambiguous bindings for token ${token.toString()}`)
        }

        const binding = candidates[0]!

        if (binding.scope === 'Singleton' && this.instances.has(binding)) {
            return this.instances.get(binding)
        }

        if (!binding.provider) {
            throw new Error(`No provider for token ${token?.toString()}`)
        }

        const instance =
            typeof binding.provider === 'function' ? binding.provider(ctx) : binding.provider

        // если объект — активировать граф
        if (typeof instance === 'object' && instance !== null) {
            this.activateDeep(instance, ctx)
        }

        if (binding.scope === 'Singleton') {
            this.instances.set(binding, instance)
        }

        return instance
    }

    private activateDeep<T extends object>(obj: T, ctx: ResolveContext) {
        if (this.activated.has(obj)) return
        this.activated.add(obj)

        const target = obj as T & InjectableInstance<T>
        const meta = target[INJECT_META]
        if (!meta) return

        for (const entry of meta) {
            if (entry.kind === 'field') {
                ;(obj as any)[entry.name] = this.resolve(entry.token, ctx)
            }

            if (entry.kind === 'method') {
                const deps = entry.tokens.map((t) => this.resolve(t, ctx))
                ;(obj as any)[entry.name](...deps)
            }
        }
    }
}

export const container = new Container()
