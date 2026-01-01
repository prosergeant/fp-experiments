import type { Character } from '@/pages/patterns/DI/Test4/character.ts'
import type { World } from '@/pages/patterns/DI/Test4/world.ts'
import { createToken } from '@/lib/inject.ts'
import { container } from '@/lib/container.ts'

export interface Controller {
    takeTurn(self: Character, world: World): void
}

class PlayerController implements Controller {
    takeTurn(self: Character, world: World) {
        console.log(`[Player] ${self.name} waits for input`)
        // здесь позже будет UI / input
    }
}

class AIController implements Controller {
    takeTurn(self: Character, world: World) {
        const enemy = world.findEnemy(self)

        if (!enemy) {
            console.log(`[AI] ${self.name} has no enemies`)
            return
        }

        console.log(`[AI] ${self.name} attacks ${enemy.name}`)
        self.attack(enemy)
    }
}

export const CONTROLLER = createToken<Controller>()

container
    .bind(CONTROLLER)
    .to(new PlayerController())
    .when((ctx) => ctx.controller === 'player')

container
    .bind(CONTROLLER)
    .to(new AIController())
    .when((ctx) => ctx.controller === 'ai')
