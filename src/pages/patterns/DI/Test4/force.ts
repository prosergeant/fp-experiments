import { createToken, Inject } from '@/lib/inject.ts'
import { container } from '@/lib/container.ts'

export const FORCE = createToken<Force>()
export const SABER = createToken<Lightsaber>()

export interface Force {
    init: () => void
    use: () => void
}

export class LightForce implements Force {
    @Inject()
    init() {
        console.log('[LightForce] init')
    }
    use() {
        console.log('[LightForce] use')
    }
}

class DarkForce implements Force {
    @Inject()
    init() {
        console.log('[DarkForce] init')
    }
    use() {
        console.log('[DarkForce] use')
    }
}

class GrayForce implements Force {
    @Inject()
    init() {
        console.log('[GrayForce] init')
    }
    use() {
        console.log('[GrayForce] use')
    }
}

export class Lightsaber {
    @Inject()
    init() {
        console.log('[LightSaber] init')
    }
    swing() {
        console.log('[LightSaber] swing')
    }
}

container
    .bind(FORCE)
    .to(new LightForce())
    .when((ctx) => ctx.profile === 'jedi')

container
    .bind(FORCE)
    .to(new DarkForce())
    .when((ctx) => ctx.profile === 'sith')

// container
//     .bind(FORCE)
//     .to(new GrayForce())
//     .when((ctx) => ctx.profile === 'neutral')

container.register(SABER, new Lightsaber())
