import { ref } from 'vue'
import { CLIENT_TYPE, type IDataLoadingContext } from '@/pages/patterns/DI/Test5/DataHandler'

export function useClientCard() {
    const context: IDataLoadingContext = {
        clientType: CLIENT_TYPE.odin,
        clientStore: {
            CLIENT_CARD: ref({
                IIN: '900800700600',
            }),
            updateClientCard: function (ctx: any) {
                console.log('updateClientCard', ctx)
                this.CLIENT_CARD.value = { ...this.CLIENT_CARD.value, ...ctx }
            },
        },
        fetchReferenceList: async (ctx: any) => {
            console.log('fetchReferenceList', ctx)
        },
        route: 'di/test5',
    }

    return {
        context,
    }
}
