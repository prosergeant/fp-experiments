import { DataHandler } from '@/pages/patterns/DI/Test5/DataHandler.ts'
import { createToken, Inject } from '@/lib/inject.ts'
import { container } from '@/lib/container.ts'
import { SOME_KEY } from '@/pages/patterns/DI/Test5/tokens.ts'

export const SOME_HANDLER = createToken<SomeHandler>()

export class SomeHandler extends DataHandler {
    @Inject(SOME_KEY) private someKey!: string

    protected async canHandle(): Promise<boolean> {
        return !!this.context.clientStore.CLIENT_CARD.IIN
    }

    protected async process(): Promise<void> {
        console.log('SomeHandler')
        this.context.clientStore.CLIENT_CARD.someKey = this.someKey
    }
}

container.register(SOME_HANDLER, () => new SomeHandler(), 'Transient')
