import { createToken, Inject } from '@/lib/inject.ts'
import { container } from '@/lib/container.ts'
import { COMBAT, CombatService } from '@/pages/patterns/DI/Test4/combat.ts'
import { type Force, Lightsaber, FORCE, SABER } from '@/pages/patterns/DI/Test4/force.ts'
import { type Controller, CONTROLLER } from '@/pages/patterns/DI/Test4/controller.ts'
import type { World } from '@/pages/patterns/DI/Test4/world.ts'

export interface CharacterStats {
    name: string
    maxHp: number
    hp: number
    baseDamage: number
}

export const CHARACTER = createToken<Character>()
const STATS = createToken<CharacterStats>()

export class Character {
    @Inject(FORCE) private force!: Force
    @Inject(SABER) private saber!: Lightsaber
    @Inject(STATS) private stats!: CharacterStats
    @Inject(COMBAT) private combat!: CombatService
    @Inject(CONTROLLER) private controller!: Controller

    get name() {
        return this.stats.name
    }

    takeTurn(world: World) {
        this.controller.takeTurn(this, world)
    }

    attack(target: Character) {
        this.force.use()
        this.saber.swing()
        this.combat.attack(this.stats, target.stats)
    }
}

container.register(CHARACTER, () => new Character(), 'Transient')

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
