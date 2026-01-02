import { CLIENT_TYPE, type IDataLoadingContext } from '@/pages/patterns/DI/Test5/DataHandler'
import { useClientStore } from '@/stores/useClientStore.ts'

export function useClientCard() {
    const clientStore = useClientStore()

    const context: IDataLoadingContext = {
        clientType: CLIENT_TYPE.odin,
        clientStore,
        fetchReferenceList: async (ctx: any) => {
            console.log('fetchReferenceList', ctx)
        },
        route: 'di/test5',
    }

    return {
        context,
    }
}
