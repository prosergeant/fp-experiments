import { createToken } from '@/lib/inject.ts'
import type { IReferences } from '@/pages/patterns/DI/Test5/useGeneralInfo.ts'
import type { IDataLoadingContext } from '@/pages/patterns/DI/Test5/DataHandler.ts'

export const R_SOME_REF1 = createToken<IReferences[]>('R_SOME_REF1')
export const R_SOME_REF2 = createToken<IReferences[]>('R_SOME_REF2')
export const DATA_LOADING_CONTEXT = createToken<IDataLoadingContext>('DATA_LOADING_CONTEXT')
export const SOME_KEY = createToken<string>()
