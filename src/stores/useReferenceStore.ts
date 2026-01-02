import { defineStore } from 'pinia'

export interface IReferences {
    ID: string
    BIN: string
    NAME_RU: string
    SHORT_NAME: string
}

interface IReferenceStore {
    R_SOME_REF2: IReferences[]
    R_SOME_REF1: IReferences[]
}

export const useReferenceStore = defineStore(
    'reference',
    (): IReferenceStore => ({
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
    }),
)
