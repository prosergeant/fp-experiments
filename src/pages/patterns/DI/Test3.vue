<script setup lang="ts">
import { Inject, createToken } from '@/lib/inject'
import { container } from '@/lib/container'

const STATS = createToken<CharacterStats>()
const DAMAGE_SYSTEM = createToken<DamageSystem>()
const COMBAT = createToken<CombatService>()
const FORCE = createToken<Force>()
const SABER = createToken<Lightsaber>()
const JEDI = createToken<Jedi>()

interface CharacterStats {
    name: string
    maxHp: number
    hp: number
    baseDamage: number
}

class DamageSystem {
    apply(target: CharacterStats, dmg: number) {
        target.hp = Math.max(0, target.hp - dmg)
        console.log(`[Damage] ${target.name}: ${target.hp}/${target.maxHp}`)
    }
}

class CombatService {
    @Inject(DAMAGE_SYSTEM) private damage!: DamageSystem

    attack(attacker: CharacterStats, defender: CharacterStats, baseDamage: number) {
        console.log(`[Combat] ${attacker.name} attacks ${defender.name}`)
        this.damage.apply(defender, baseDamage)
    }
}

class Force {
    @Inject()
    init() {
        console.log('[Force] init')
    }

    use() {
        console.log('[Force] use')
    }
}

class DarkForce extends Force {
    init() {
        console.log('[DarkForce] init')
    }
    use() {
        console.log('[DarkForce] use')
    }
}

class GrayForce extends Force {
    use() {
        console.log('[GrayForce] before use')
        super.use()
        console.log('[GrayForce] use')
    }
}

class Lightsaber {
    @Inject()
    init() {
        console.log('[Lightsaber] init')
    }

    swing() {
        console.log('[Lightsaber] swing')
    }
}

class Jedi {
    @Inject(FORCE) force!: Force
    @Inject(SABER) saber!: Lightsaber
    @Inject(STATS) stats!: CharacterStats
    @Inject(COMBAT) combat!: CombatService

    fight(target: Jedi) {
        this.force.use()
        this.saber.swing()

        this.combat.attack(this.stats, target.stats, this.stats.baseDamage)
    }
}

container.register(DAMAGE_SYSTEM, new DamageSystem())
container.register(COMBAT, new CombatService())
container.register(JEDI, () => new Jedi(), 'Transient')
container.register(SABER, new Lightsaber())

container.register(
    STATS,
    (ctx) => {
        if (!ctx.character) {
            throw new Error('Character data required')
        }

        return { ...ctx.character }
    },
    'Transient',
)

const forceInstances: Record<string, Force> = {}

container.register(
    FORCE,
    (ctx) => {
        const profile = ctx.profile!

        if (!forceInstances[profile]) {
            // prettier-ignore
            switch (profile) {
                case 'jedi': forceInstances[profile] = new Force(); break
                case 'sith': forceInstances[profile] = new DarkForce(); break
                case 'neutral': forceInstances[profile] = new GrayForce(); break
                default: throw new Error('Unknown profile')
            }
        }

        return forceInstances[profile]
    },
    'Transient',
)

const luke = container.resolve(JEDI, {
    profile: 'jedi',
    character: {
        id: 'luke',
        name: 'Luke Skywalker',
        maxHp: 100,
        hp: 100,
        baseDamage: 25,
    },
})

const obiwan = container.resolve(JEDI, {
    profile: 'jedi',
    character: {
        id: 'obiwan',
        name: 'Obi-Wan Kenobi',
        maxHp: 120,
        hp: 120,
        baseDamage: 25,
    },
})

const vader = container.resolve(JEDI, {
    profile: 'sith',
    character: {
        id: 'vader',
        name: 'Darth Vader',
        maxHp: 200,
        hp: 200,
        baseDamage: 45,
    },
})

console.log('\n')

luke.fight(vader)
console.log('\n')

obiwan.fight(vader)
console.log('\n')

vader.fight(luke)
</script>

<template>
    <div>di 3</div>
</template>

<style>
body {
    background: black;
    color: white;
}
</style>
