import { createToken, Inject } from '@/lib/inject.ts'
import { container } from '@/lib/container.ts'
import { DAMAGE_SYSTEM, type DamageSystem } from '@/pages/patterns/DI/Test4/damageSystem.ts'
import type { CharacterStats } from '@/pages/patterns/DI/Test4/character.ts'

export const COMBAT = createToken<CombatService>()

export class CombatService {
    @Inject(DAMAGE_SYSTEM) private damage!: DamageSystem

    attack(attacker: CharacterStats, defender: CharacterStats) {
        console.log(`[Combat] ${attacker.name} attacks ${defender.name}`)
        this.damage.apply(defender, attacker.baseDamage)
    }
}

container.register(COMBAT, new CombatService())
