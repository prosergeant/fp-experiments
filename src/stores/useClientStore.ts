import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface IPerson {
    IIN: string
    isPersonBaseHandlerLoaded?: boolean
    someKey?: string
}

export const useClientStore = defineStore('client', () => {
    const CLIENT_CARD = ref<Partial<IPerson>>({})

    const updateClientCard = (ctx: any) => {
        console.log('updateClientCard', ctx)
        CLIENT_CARD.value = { ...CLIENT_CARD.value, ...ctx }
    }

    return {
        updateClientCard,
        CLIENT_CARD,
    }
})
