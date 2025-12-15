import { Option } from '@/lib/option.ts'
import { computed, ref } from 'vue'

export type InsuranceRule = 'FORCE_ON' | 'FORBIDDEN' | 'OPTIONAL'

export type RangeInfo = {
    minSum: number
    maxSum: number
    minTerm: number
    maxTerm: number
    rate: number
    insurancePremium: number | null
    insuranceRule: InsuranceRule
}

export type ProductInfo = {
    productCode: number
    productName: string
    minSum: number
    maxSum: number
    minTerm: number
    maxTerm: number
    ranges: RangeInfo[]
}

export type LoanSelection = {
    sum: number
    term: number
}

export type ToggleState = {
    visible: boolean
    checked: boolean
    disabled: boolean
}

type Spec<T> = (candidate: T) => boolean

const and =
    <T>(...specs: Spec<T>[]): Spec<T> =>
    (candidate) =>
        specs.every((spec) => spec(candidate))

const between =
    <T>(selector: (t: T) => number, min: number, max: number): Spec<T> =>
    (candidate) => {
        const value = selector(candidate)
        return value >= min && value <= max
    }

const rangeSpec = (range: RangeInfo): Spec<LoanSelection> =>
    and(
        between((s) => s.sum, range.minSum, range.maxSum),
        between((s) => s.term, range.minTerm, range.maxTerm),
    )

const resolveRange = (selection: LoanSelection, ranges: RangeInfo[]): Option<RangeInfo> =>
    Option.fromNullable(ranges.find((range) => rangeSpec(range)(selection)))

const insuranceRuleMap: Record<InsuranceRule, (userValue: boolean) => ToggleState> = {
    FORCE_ON: () => ({
        visible: true,
        checked: true,
        disabled: true,
    }),

    FORBIDDEN: () => ({
        visible: false,
        checked: false,
        disabled: true,
    }),

    OPTIONAL: (userValue) => ({
        visible: true,
        checked: userValue,
        disabled: false,
    }),
}

export function useLoanCalculator(product: ProductInfo) {
    const sum = ref(product.minSum)
    const term = ref(product.minTerm)
    const userInsurance = ref(false)

    const activeRange = computed(() =>
        resolveRange({ sum: sum.value, term: term.value }, product.ranges),
    )

    const insuranceToggle = computed<ToggleState>(() =>
        activeRange.value
            .map((range) => insuranceRuleMap[range.insuranceRule](userInsurance.value))
            .getOrElse(insuranceRuleMap['FORBIDDEN'](false)),
    )

    const makePayload = () => ({
        amount: sum.value,
        term: term.value,
        rate: activeRange.value.map((r) => r.rate).getOrElse(0),
        insurance: insuranceToggle.value.checked,
        insurancePremium: activeRange.value.map((r) => r.insurancePremium).getOrElse(0),
    })

    return {
        sum,
        term,
        activeRange,
        insuranceToggle,
        userInsurance,
        makePayload,
    }
}
