import { Option } from '@/lib/option'
import { pipeAsync } from '@/lib/pipe'
import { DataHandler } from '@/pages/patterns/DI/Test5/DataHandler.ts'
import { createToken } from '@/lib/inject.ts'
import { container } from '@/lib/container.ts'
import type { IPerson } from '@/stores/useClientStore.ts'

const getDataOption = <T>(ctx: T): Promise<Option<T>> => Promise.resolve(Option.fromNullable(ctx))

export const PERSON_BASE_HANDLER = createToken<PersonBaseInfoHandler>()

export class PersonBaseInfoHandler extends DataHandler {
    protected async canHandle(): Promise<boolean> {
        return !this.context.clientStore.CLIENT_CARD.isPersonBaseHandlerLoaded
    }

    protected async process(): Promise<void> {
        await pipeAsync(
            this.decryptIIN('123'),
            Option.fromNullable,
            Option.FlatMapAsync(this.getPersonsInfo),
            Option.Tap(this.setClientStore),
        )
    }

    private async decryptIIN(iin: string): Promise<string> {
        return Promise.resolve(iin)
    }

    private getPersonsInfo = (iin: string): Promise<Option<IPerson>> =>
        pipeAsync(
            getDataOption<{ Person: IPerson[] }>({
                Person: [{ IIN: iin }],
            }),
            Option.Map((p) => p?.Person?.[0]),
        )

    private setClientStore = (p: IPerson) => {
        this.context.clientStore.updateClientCard({
            ...p,
            isPersonBaseHandlerLoaded: true,
        })
    }
}

container.register(PERSON_BASE_HANDLER, () => new PersonBaseInfoHandler(), 'Transient')
