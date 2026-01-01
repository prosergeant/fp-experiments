<script setup lang="ts">
import { Inject, createToken } from '@/lib/inject'
import { container } from '@/lib/container'

const FORCE = createToken<Force>()
const SABER = createToken<Lightsaber>()
const TESTKEY = createToken<string>()
const JEDI = createToken<Jedi>()

class Force {
    @Inject()
    init() {
        console.log('[Force] init')
    }

    use() {
        console.log('[Force] use')
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

class Jedi {
    @Inject(FORCE) force!: Force
    @Inject(SABER) saber!: Lightsaber
    @Inject(TESTKEY) private test_key!: string

    constructor() {
        console.log('[Jedi] init')
    }

    getTestKey() {
        console.log(this.test_key)
    }

    fight() {
        this.force.use()
        this.saber.swing()
    }
}

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

container.register(SABER, new Lightsaber())
container.register(
    TESTKEY,
    (ctx) => {
        // prettier-ignore
        switch (ctx?.profile) {
            case 'jedi': return 'jedi_var'
            case 'sith': return 'sith_var'
            case 'neutral': return 'gray_var'
            default: return ''
        }
    },
    'Transient',
)
container.register(JEDI, () => new Jedi(), 'Transient')

console.log('luke')
const luke = container.resolve(JEDI, { profile: 'jedi' })
luke.getTestKey()
luke.fight()

console.log('\n\n')

console.log('vader')
const vader = container.resolve(JEDI, { profile: 'sith' })
vader.getTestKey()
vader.fight()

console.log('\n\n')

console.log('mace')
const mace = container.resolve(JEDI, { profile: 'neutral' })
mace.getTestKey()
mace.fight()

console.log('\n\n')

console.log('templeGuard')
const templeGuard = container.resolve(JEDI, { profile: 'neutral' })
templeGuard.getTestKey()
templeGuard.fight()
</script>

<template>
    <div>di</div>
</template>
