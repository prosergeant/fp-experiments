<script setup lang="ts">
import { Inject, createToken } from '@/lib/inject'
import { container } from '@/lib/container'

class Force {
    use() {
        console.log('force use')
    }
}

class DarkForce extends Force {
    use() {
        console.log('dark force')
    }
}

class Lightsaber {
    swing() {
        console.log('saber swing')
    }
}

const LOGGER_VER = createToken<string>()

class Logger {
    @Inject(LOGGER_VER) private readonly version!: string

    log(msg: string) {
        console.log(`[Logger]:${this.version}:`, msg)
    }
}

class Metrics {
    increment(v: string) {
        console.log('some metrics:', v)
    }
}

class MissionConfig {}

const FORCE = createToken<Force>()
const SABER = createToken<Lightsaber>()
const LOGGER = createToken<Logger>()
const METRICS = createToken<Metrics>()
const MISSION_CONFIG = createToken<MissionConfig>()
const TESTSTR = createToken<string>()
const FORCEUSER = createToken<ForceUser>()

class ForceUser {
    @Inject(FORCE) private force!: Force
    @Inject(SABER) private saber!: Lightsaber
    @Inject(LOGGER) private logger!: Logger
    @Inject(METRICS) private metrics!: Metrics
    @Inject(MISSION_CONFIG) private config!: MissionConfig
    @Inject(TESTSTR) private test!: string

    fight() {
        this.logger.log('fight started')
        this.metrics.increment('fight')
        this.force.use()
        this.saber.swing()
    }
}

const forceInstances: Record<string, Force> = {}

container.register(FORCE, (ctx) => {
    const profile = ctx.profile!

    if (!forceInstances[profile]) {
        // prettier-ignore
        switch (profile) {
            case 'jedi': forceInstances[profile] = new Force(); break
            case 'sith': forceInstances[profile] = new DarkForce(); break
            default: throw new Error('Unknown profile')
        }
    }

    return forceInstances[profile]
})

container.register(SABER, new Lightsaber())
container.register(LOGGER, new Logger())
container.register(LOGGER_VER, 'v1')
container.register(METRICS, new Metrics())
container.register(MISSION_CONFIG, new MissionConfig())
container.register(TESTSTR, 'new MissionConfig()')
container.register(FORCEUSER, new ForceUser())

const luke = container.resolve(FORCEUSER, { profile: 'jedi' })
luke.fight()
</script>

<template>
    <div>di 2</div>
</template>

<style scoped></style>
