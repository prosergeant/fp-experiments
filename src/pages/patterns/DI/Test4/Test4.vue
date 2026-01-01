<script setup lang="ts">
import { container } from '@/lib/container'
import { CHARACTER } from '@/pages/patterns/DI/Test4/character.ts'
import { World } from '@/pages/patterns/DI/Test4/world.ts'

const player = container.resolve(CHARACTER, {
    profile: 'jedi',
    controller: 'player',
    character: {
        id: 'luke',
        name: 'Luke',
        hp: 100,
        maxHp: 100,
        baseDamage: 25,
    },
})

const npc = container.resolve(CHARACTER, {
    profile: 'sith',
    controller: 'ai',
    character: {
        id: 'vader',
        name: 'Vader',
        hp: 200,
        maxHp: 200,
        baseDamage: 45,
    },
})

console.log('\n')
const world = new World([player, npc])
world.tick()
</script>

<template>
    <div>di 4</div>
</template>

<style>
body {
    background: black;
    color: white;
}
</style>
