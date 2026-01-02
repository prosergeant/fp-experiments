import { Inject } from '@/lib/inject'
import { DATA_LOADING_CONTEXT } from '@/pages/patterns/DI/Test5/tokens.ts'
import { useClientStore } from '@/stores/useClientStore.ts'

export enum CLIENT_TYPE {
    odin = 1,
    dva,
    tri,
}

export interface IDataLoadingContext {
    route: string
    clientType: CLIENT_TYPE
    clientStore: ReturnType<typeof useClientStore>
    fetchReferenceList: (ctx: any) => Promise<void>
}

// Абстрактный обработчик
export abstract class DataHandler {
    @Inject(DATA_LOADING_CONTEXT) protected context!: IDataLoadingContext

    protected nextHandler?: DataHandler
    protected head: DataHandler

    constructor() {
        this.head = this
    }

    private setHead(head: DataHandler) {
        this.head = head
    }

    public setNext(handler: DataHandler): DataHandler {
        this.nextHandler = handler
        handler.setHead(this.head)
        return handler
    }

    public async start(): Promise<void> {
        await this.head.handle()
    }

    private async handle(): Promise<void> {
        if (await this.canHandle()) {
            await this.process()
        }

        if (this.nextHandler) {
            await this.nextHandler.handle()
        }
    }

    protected abstract canHandle(): Promise<boolean>
    protected abstract process(): Promise<void>
}
