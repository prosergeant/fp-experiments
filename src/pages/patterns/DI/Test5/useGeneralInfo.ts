import { DATA_LOADING_CONTEXT, R_SOME_REF1, R_SOME_REF2 } from '@/pages/patterns/DI/Test5/tokens.ts'
import { GENERAL_INFO_HANDLER } from '@/pages/patterns/DI/Test5/GeneralInfoHandler'
import { container } from '@/lib/container'
import { useClientCard } from '@/pages/patterns/DI/Test5/useClientCard.ts'
import { PERSON_BASE_HANDLER } from '@/pages/patterns/DI/Test5/PersonBaseHandler.ts'
import { computed } from 'vue'
import { useReferenceStore } from '@/stores/useReferenceStore.ts'

export function useGeneralInfo() {
    const refStore = useReferenceStore()
    const scope = container.createChild()

    const { context } = useClientCard()

    scope.register(DATA_LOADING_CONTEXT, () => context)
    scope.register(R_SOME_REF2, refStore.R_SOME_REF2)
    scope.register(R_SOME_REF1, refStore.R_SOME_REF1)

    const step1 = scope.resolve(PERSON_BASE_HANDLER)
    const step2 = scope.resolve(GENERAL_INFO_HANDLER)

    void step1.setNext(step2).start()

    return {
        CLIENT_CARD: computed(() => context.clientStore.CLIENT_CARD),
    }
}
