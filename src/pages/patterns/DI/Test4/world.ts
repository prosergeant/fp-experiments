import type { Character } from '@/pages/patterns/DI/Test4/character.ts'

export class World {
    constructor(private characters: Character[]) {}

    findEnemy(self: Character) {
        return this.characters.find((c) => c !== self)
    }

    tick() {
        for (const c of this.characters) {
            c.takeTurn(this)
        }
    }
}
