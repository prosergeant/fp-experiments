import { DATA_LOADING_CONTEXT, R_SOME_REF1, R_SOME_REF2 } from '@/pages/patterns/DI/Test5/tokens.ts'
import { GENERAL_INFO_HANDLER } from '@/pages/patterns/DI/Test5/GeneralInfoHandler'
import { container } from '@/lib/container'
import { useClientCard } from '@/pages/patterns/DI/Test5/useClientCard.ts'
import { PERSON_BASE_HANDLER } from '@/pages/patterns/DI/Test5/PersonBaseHandler.ts'

interface IReferenceStore {
    R_SOME_REF2: IReferences[]
    R_SOME_REF1: IReferences[]
}

export interface IReferences {
    ID: string
    BIN: string
    NAME_RU: string
    SHORT_NAME: string
}

const useReferenceStore = (): IReferenceStore => ({
    R_SOME_REF2: [
        {
            ID: 'id 1',
            NAME_RU: 'R_SOME_REF2 name ru',
            BIN: 'bin 1',
            SHORT_NAME: 'R_SOME_REF2 short name',
        },
    ],
    R_SOME_REF1: [
        {
            ID: 'id 2',
            NAME_RU: 'R_SOME_REF1 name ru',
            BIN: '100200300400',
            SHORT_NAME: 'R_SOME_REF1 short name',
        },
    ],
})

export function useGeneralInfo() {
    const refStore = useReferenceStore()
    const scope = container.createChild()

    const { context } = useClientCard()

    scope.register(DATA_LOADING_CONTEXT, () => context, 'Transient')
    scope.register(R_SOME_REF2, refStore.R_SOME_REF2)
    scope.register(R_SOME_REF1, refStore.R_SOME_REF1)

    const step1 = scope.resolve(PERSON_BASE_HANDLER)
    const step2 = scope.resolve(GENERAL_INFO_HANDLER)

    void step1.setNext(step2).start()

    return {
        CLIENT_CARD: context.clientStore.CLIENT_CARD,
    }
}
