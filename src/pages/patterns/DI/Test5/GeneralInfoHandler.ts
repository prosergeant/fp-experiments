import { R_SOME_REF1, R_SOME_REF2 } from '@/pages/patterns/DI/Test5/tokens.ts'
import { DataHandler, type CLIENT_TYPE } from './DataHandler'
import { pipeAsync } from '@/lib/pipe'
import { Option } from '@/lib/option'
import { OptionRequestCache } from '@/lib/optionReqCache'
import { createToken, Inject } from '@/lib/inject'
import { container } from '@/lib/container.ts'
import type { IReferences } from '@/stores/useReferenceStore.ts'

export type TContractor = [CLIENT_TYPE, string]
type TAgreement = { DATE_OF_OVERDUE_START: string }

interface IMappedHistoryInteraction {
    docNumber: string
    coborrowerIin: string
    coborrowerFio: string
    dateOfOverdueStart: string
    sanctionType: string
    staffFio: string
    arrest: string
    dateArrest: string
    foreclosure_period: string
}
interface IHistoryInteraction {
    NUMBER_CONTRACT: string
    ARR_DATE: string
    PROP_AR_DATE: string
    AUTO_AR_DATE: string
    FROM_DATE: string
    TO_DATE: string
}
interface ILawSuits {
    NUMBER_CONTRACT: string
    contractor: TContractor
    cursor: string | null
    SANCTION_TYPE_ID: number | string
}
interface ICoborrower {
    ANOTHER_CLIENT_BIIN: string
}
interface IGuaranteeCoOwners {
    ANOTHERS:
        | {
              BIIN: string
          }[]
        | null
}
interface IPersonFIO {
    LASTNAME: { RU: string }
    FIRSTNAME: { RU: string }
    MIDDLENAME: { RU: string }
}
interface IEmployeeAssignmentHistory {
    LAST_UPDATE: string
    STAFF_IIN_TO: string
}

const getDataOption = <T>(ctx: T): Promise<Option<T>> => Promise.resolve(Option.fromNullable(ctx))

export const GENERAL_INFO_HANDLER = createToken<GeneralInfoHandler>('GENERAL_INFO_HANDLER')

export class GeneralInfoHandler extends DataHandler {
    private coborrowerCache = new OptionRequestCache<string, ICoborrower[]>()
    private guaranteeCache = new OptionRequestCache<string, IGuaranteeCoOwners[]>()
    private personCache = new OptionRequestCache<string, IPersonFIO>()
    private staffIinCache = new OptionRequestCache<string, string>()
    private overdueCache = new OptionRequestCache<string, string>()

    private contractor!: TContractor
    @Inject(R_SOME_REF1) private R_SOME_REF1!: IReferences[]
    @Inject(R_SOME_REF2) private R_SOME_REF2!: IReferences[]

    static MakeFio = (person: IPersonFIO): string =>
        [person.LASTNAME?.RU, person.FIRSTNAME?.RU, person.MIDDLENAME?.RU].filter(Boolean).join(' ')

    protected async canHandle(): Promise<boolean> {
        return !!this.context.clientStore.CLIENT_CARD.IIN
    }

    private getElFromReference = <T extends IReferences>(
        arr: T[],
        id: number | string,
        idKey: keyof T = 'ID',
    ): Option<IReferences> =>
        Option.fromNullable(arr)
            .filter((arr) => !!arr.length)
            .map((arr) => arr.find((el) => el?.[idKey] === id) as T)

    protected async process(): Promise<void> {
        this.contractor = [this.context.clientType, this.context.clientStore.CLIENT_CARD.IIN!]

        await this.loadParseHistsLaws()
    }

    private async loadParseHistsLaws(
        cursorHist: string | null = null,
        cursorLaw: string | null = null,
    ): Promise<Option<IMappedHistoryInteraction[]>> {
        return await pipeAsync(
            this.getHistoryAndLaws(cursorHist, cursorLaw),
            Option.MapAsync(this.mapHistories),
            Option.Tap(this.saveToStore),
        )
    }

    private makeKey(query: string, contractor: TContractor): string {
        const [type, iin] = contractor
        return `${query}|${type}|${iin}`
    }

    private saveToStore = (historyInteraction: IMappedHistoryInteraction[]) => {
        this.context.clientStore.updateClientCard({ historyInteraction })
    }

    private getHistoryAndLaws = async (
        cursorHist: string | null = null,
        cursorLaw: string | null = null,
    ): Promise<Option<[IHistoryInteraction[], ILawSuits[]]>> => {
        const history = (await this.getHistoryInteraction(cursorHist)).match({
            some: (h) => Option.Some(h),
            none: () => Option.Some([]),
        })
        const laws = (await this.getLawSuits(cursorLaw)).match({
            some: (l) => Option.Some(l),
            none: () => Option.Some([]),
        })
        return history.flatMap((h) => laws.map((l) => [h, l]))
    }

    private mapHistories = ([historyInteractions, lawSuits]: [
        IHistoryInteraction[],
        ILawSuits[],
    ]): Promise<IMappedHistoryInteraction[]> => {
        const emptyHistory = {} as IHistoryInteraction
        const emptyLaws = {} as ILawSuits

        const tempHist = historyInteractions.length ? historyInteractions : [emptyHistory]
        const tempLaws = lawSuits.length ? lawSuits : [emptyLaws]

        if (!historyInteractions.length && !lawSuits.length) return Promise.resolve([])

        return Promise.all(
            tempHist.flatMap((historyInteraction) =>
                tempLaws.map((law) => this.mapHistoryInteractionToRecord(historyInteraction, law)),
            ),
        )
    }
    private async resolveStaffFio(staffIin: string): Promise<string> {
        const fromRef = this.getElFromReference(this.R_SOME_REF1, staffIin, 'BIN').map(
            (r) => r.SHORT_NAME,
        )

        if (fromRef.isSome()) {
            return fromRef.getOrElse('')
        }

        if (staffIin) {
            // const gqlRes = await getFullnameByIin(staffIin.getOrElse(''))
            // return gqlRes.map((d) => d.Employee?.[0]?.FULLNAME?.RU ?? '').getOrElse('')
        }

        return ''
    }
    private mapHistoryInteractionToRecord = async (
        historyInteraction: IHistoryInteraction,
        lawSuits: ILawSuits,
    ): Promise<IMappedHistoryInteraction> => {
        const staffIin = await this.getStaffIinFromClient() // -> 100200300400

        // Получение всех необходимых данных параллельно
        const [coborrowerIins, overdueStartOption, sanctionTypeOption] = await Promise.all([
            this.getCobGuarIins(),
            this.getOverdueStartDate(
                historyInteraction.NUMBER_CONTRACT || lawSuits.NUMBER_CONTRACT,
            ),
            this.getSanctionTypeName(lawSuits.SANCTION_TYPE_ID),
        ])

        // Получение FIO созаемщика
        const coborrowerFio = await this.getPersonsByIin(coborrowerIins)

        return {
            // обычные переменные
            docNumber: historyInteraction.NUMBER_CONTRACT || lawSuits.NUMBER_CONTRACT,
            coborrowerIin: coborrowerIins.join(',\n'),
            coborrowerFio: coborrowerFio.map(GeneralInfoHandler.MakeFio).join(',\n'),
            // options
            dateOfOverdueStart: overdueStartOption.getOrElse(''),
            sanctionType: sanctionTypeOption.getOrElse(''),
            staffFio: await this.resolveStaffFio(staffIin.getOrElse('')),
            // funcs
            arrest: this.buildArrestInfo(historyInteraction),
            dateArrest: this.buildArrestDate(historyInteraction),
            foreclosure_period: this.buildForeclosurePeriod(historyInteraction),
        }
    }

    private getCobGuarIins = async (): Promise<string[]> => {
        const coborrowers: string[] = (await this.getCoborrower())
            .map((c) => c.map((c) => c.ANOTHER_CLIENT_BIIN))
            .filter(Boolean)
            .getOrElse([])
        const guarantors: string[] = (await this.getGuarantee())
            .map((g) =>
                g.flatMap(
                    ({ ANOTHERS = [] }) => ANOTHERS?.map((co) => co?.BIIN).filter(Boolean) || [],
                ),
            )
            .getOrElse([])

        return Array.from(new Set([...coborrowers, ...guarantors]))
    }

    private getCoborrower = (): Promise<Option<ICoborrower[]>> => {
        const key = this.makeKey('QUERY_GET_COBORROWER', this.contractor)
        return this.coborrowerCache.get(key, () =>
            pipeAsync(
                getDataOption<{ Coborrower: ICoborrower[] }>({
                    Coborrower: [{ ANOTHER_CLIENT_BIIN: 'ANOTHER_CLIENT_BIIN' }],
                }),
                Option.Map((h) => h?.Coborrower),
                Option.FilterIsNonEmptyArray,
            ),
        )
    }

    private getHistoryInteraction = (
        cursor: string | null = null,
    ): Promise<Option<IHistoryInteraction[]>> =>
        pipeAsync(
            getDataOption<{ HistoryInteraction: IHistoryInteraction[] }>({
                HistoryInteraction: [
                    {
                        NUMBER_CONTRACT: String(this.contractor),
                        ARR_DATE: '2025-11-11T10:20:30',
                        PROP_AR_DATE: '2026-11-11T10:20:30',
                        AUTO_AR_DATE: '2027-11-11T10:20:30',
                        FROM_DATE: '2028-11-11T10:20:30',
                        TO_DATE: '2029-11-11T10:20:30',
                    },
                ],
            }),
            Option.Map((h) => h?.HistoryInteraction),
            Option.FilterIsNonEmptyArray,
        )

    private getLawSuits = (cursor: string | null = null): Promise<Option<ILawSuits[]>> =>
        pipeAsync(
            getDataOption<{ LawSuits: ILawSuits[] }>({
                LawSuits: [
                    {
                        NUMBER_CONTRACT: cursor || 'no cursor',
                        contractor: this.contractor,
                        cursor,
                        SANCTION_TYPE_ID: 'id 1',
                    },
                ],
            }),
            Option.Map((l) => l?.LawSuits),
            Option.FilterIsNonEmptyArray,
        )

    private getStaffIinFromClient = async (): Promise<Option<string>> => {
        const key = this.makeKey('QUERY_GET_EMPLOYEE_ASSIGNMENT_HISTORY', this.contractor)

        return this.staffIinCache.get(key, async () =>
            pipeAsync(
                getDataOption<{
                    EmployeeAssignmentHistory: IEmployeeAssignmentHistory[]
                }>({
                    EmployeeAssignmentHistory: [
                        {
                            STAFF_IIN_TO: '100200300400',
                            LAST_UPDATE: '2026-01-01T21:29:30',
                        },
                    ],
                }),
                Option.Map(
                    (res) =>
                        res?.EmployeeAssignmentHistory?.slice()?.sort(
                            (a, b) =>
                                new Date(b.LAST_UPDATE).getTime() -
                                new Date(a.LAST_UPDATE).getTime(),
                        )?.[0]?.STAFF_IIN_TO,
                ),
            ),
        )
    }

    private getGuarantee = (): Promise<Option<IGuaranteeCoOwners[]>> => {
        const key = this.makeKey('QUERY_GET_GUARANTEE', this.contractor)
        return this.guaranteeCache.get(key, () =>
            pipeAsync(
                getDataOption<{ Guarantee: IGuaranteeCoOwners[] }>({
                    Guarantee: [{ ANOTHERS: [{ BIIN: 'CO_OWNERS_BIIN_0' }] }],
                }),
                Option.Map((g) => g?.Guarantee),
                Option.FilterIsNonEmptyArray,
            ),
        )
    }

    private getPersonsByIin = async (iins: string[]): Promise<IPersonFIO[]> => {
        const results = await Promise.all(
            iins.map((iin) => {
                const key = this.makeKey('QUERY_SEARCH_PERSON_BY_IIN', this.contractor)
                return this.personCache.get(key, () =>
                    pipeAsync(
                        getDataOption<{ Person: IPersonFIO[] }>({
                            Person: [
                                {
                                    FIRSTNAME: { RU: `Firstname ${iin}` },
                                    LASTNAME: { RU: 'Lastname' },
                                    MIDDLENAME: { RU: 'Middlename' },
                                },
                            ],
                        }),
                        Option.Map((p) => p?.Person?.[0]),
                    ),
                )
            }),
        )

        return results.flatMap((r) => (r.isSome() ? r.value : []))
    }

    private getOverdueStartDate = (number: string): Promise<Option<string>> => {
        const key = this.makeKey('QUERY_GET_AGREEMENT', this.contractor)
        return this.overdueCache.get(key, () =>
            pipeAsync(
                getDataOption<{ Agreement: TAgreement[] }>({
                    Agreement: [{ DATE_OF_OVERDUE_START: '2025-12-30T10:20:30' }],
                }),
                Option.Map((a) => a?.Agreement?.[0]?.DATE_OF_OVERDUE_START),
            ),
        )
    }

    private getSanctionTypeName = (sanctionTypeId: number | string): Option<string> =>
        Option.Some(
            this.getElFromReference(this.R_SOME_REF2, sanctionTypeId)
                .flatMap((r) => Option.fromNullable(r.NAME_RU))
                .getOrElse(''),
        )

    private buildArrestInfo = (historyInteraction: IHistoryInteraction): string => {
        const arrestAccountDate = this.getDateOpt(historyInteraction.ARR_DATE)
            .map(() => 'Банковский счет')
            .getOrElse('')

        const propertyArrestDate = this.getDateOpt(historyInteraction.PROP_AR_DATE)
            .map(() => 'Имущество')
            .getOrElse('')

        const transportArrestDate = this.getDateOpt(historyInteraction.AUTO_AR_DATE)
            .map(() => 'Транспорт')
            .getOrElse('')

        return [arrestAccountDate, propertyArrestDate, transportArrestDate]
            .filter(Boolean)
            .join(',\n')
    }

    private getDateOpt = (date?: string): Option<string> =>
        Option.fromNullable(date)
            // .map(formatToLocaleDate)
            .filter((f) => f !== 'Invalid Date')

    private buildArrestDate = (historyInteraction: IHistoryInteraction): string => {
        const getDate = (date?: string) => this.getDateOpt(date).getOrElse('')

        const arrestAccountDate = getDate(historyInteraction.ARR_DATE)
        const propertyArrestDate = getDate(historyInteraction.PROP_AR_DATE)
        const transportArrestDate = getDate(historyInteraction.AUTO_AR_DATE)

        return [arrestAccountDate, propertyArrestDate, transportArrestDate]
            .filter(Boolean)
            .join(',\n')
    }

    private buildForeclosurePeriod = (historyInteraction: IHistoryInteraction): string =>
        // prettier-ignore
        Option.Do
            .bind('from', () => this.getDateOpt(historyInteraction.FROM_DATE))
            .bind('to', () => this.getDateOpt(historyInteraction.TO_DATE))
            .map(({ from, to }) => `С ${from} По ${to}`)
            .getOrElse('')
}

container.register(GENERAL_INFO_HANDLER, () => new GeneralInfoHandler(), 'Transient')
