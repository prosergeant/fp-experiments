import { createToken } from '@/lib/inject.ts'
import { container } from '@/lib/container.ts'
import type { CharacterStats } from '@/pages/patterns/DI/Test4/character.ts'

export const DAMAGE_SYSTEM = createToken<DamageSystem>()

export class DamageSystem {
    apply(target: CharacterStats, dmg: number) {
        target.hp = Math.max(0, target.hp - dmg)
        console.log(`[Damage] ${target.name}: ${target.hp}/${target.maxHp}`)
    }
}

container.register(DAMAGE_SYSTEM, new DamageSystem())
