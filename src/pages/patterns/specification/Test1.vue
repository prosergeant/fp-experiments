<script setup lang="ts">
import { useLoanCalculator } from './useTest1.ts'
import product from './test1.json'
import { ref } from 'vue'

const { sum, term, activeRange, insuranceToggle, userInsurance, makePayload } = useLoanCalculator(
    product.products[0]!,
)

const payload = ref<any>({})
</script>

<template>
    <div>
        <input type="number" v-model="sum" />
        <input type="number" v-model="term" />

        <div v-if="insuranceToggle.visible">
            <label>
                <input
                    type="checkbox"
                    v-bind="insuranceToggle"
                    @change="userInsurance = $event?.target?.checked"
                />
                Страховка
            </label>
        </div>

        <button @click="payload = makePayload()">makePayload</button>
        <p>userInsurance: {{ userInsurance }}</p>
        <pre>{{ payload }}</pre>
        <pre>{{ activeRange }}</pre>
    </div>
</template>
