import { container } from '@/lib/container.ts'
import { useClientCard } from '@/pages/patterns/DI/Test5/useClientCard.ts'
import {
    DATA_LOADING_CONTEXT,
    R_SOME_REF1,
    R_SOME_REF2,
    SOME_KEY,
} from '@/pages/patterns/DI/Test5/tokens.ts'
import { PERSON_BASE_HANDLER } from '@/pages/patterns/DI/Test5/PersonBaseHandler.ts'
import { SOME_HANDLER } from '@/pages/patterns/DI/Test5/SomeHandler.ts'
import { GENERAL_INFO_HANDLER } from '@/pages/patterns/DI/Test5/GeneralInfoHandler.ts'

export function useSomeComposable() {
    const scope = container.createChild()

    const { context } = useClientCard()

    scope.register(DATA_LOADING_CONTEXT, () => context, 'Transient')
    scope.register(SOME_KEY, 'someVar')
    scope.register(R_SOME_REF2, [])
    scope.register(R_SOME_REF1, [])

    const step1 = scope.resolve(PERSON_BASE_HANDLER)
    const step2 = scope.resolve(SOME_HANDLER)
    const step3 = scope.resolve(GENERAL_INFO_HANDLER)

    void step1.setNext(step2).setNext(step3).start()

    return {
        CLIENT_CARD: context.clientStore.CLIENT_CARD,
    }
}
