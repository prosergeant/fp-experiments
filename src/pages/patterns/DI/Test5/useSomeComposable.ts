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
import { useReferenceStore } from '@/stores/useReferenceStore.ts'
import { computed } from 'vue'

export function useSomeComposable() {
    const scope = container.createChild()
    const refStore = useReferenceStore()

    const { context } = useClientCard()

    scope.register(DATA_LOADING_CONTEXT, context)
    scope.register(SOME_KEY, 'someVar')
    scope.register(R_SOME_REF2, []) //refStore.R_SOME_REF2)
    scope.register(R_SOME_REF1, []) //refStore.R_SOME_REF1)

    const step1 = scope.resolve(PERSON_BASE_HANDLER)
    const step2 = scope.resolve(SOME_HANDLER)
    const step3 = scope.resolve(GENERAL_INFO_HANDLER)

    step1
        .setNext(step2)
        .setNext(step3)
        .start()
        .then(() => {
            context.clientStore.CLIENT_CARD.IIN = '4556'
        })

    return {
        CLIENT_CARD: computed(() => context.clientStore.CLIENT_CARD),
    }
}
