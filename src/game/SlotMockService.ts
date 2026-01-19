import { ISlotMockService, SpinResult, ReelMatrix, ReelSymbol, SYMBOLS } from './types';

const CONFIG = {
    REEL_COUNT: 5,
    ROW_COUNT: 3,
    WIN_PROBABILITY: 0.3,
    MATCH_MIN: 3,
    WIN_MULTIPLIER: 10,
};

export class SlotMockService implements ISlotMockService {
    async getSpinResult(): Promise<SpinResult> {
        const matrix = this.generateMatrix();
        const winAmount = this.calculateWin(matrix);
        return { matrix, winAmount };
    }

    private generateMatrix(): ReelMatrix {
        const matrix: ReelMatrix = [];
        const hasWin = Math.random() < CONFIG.WIN_PROBABILITY;
        const winSymbol = hasWin ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : null;

        for (let col = 0; col < CONFIG.REEL_COUNT; col++) {
            const reel: ReelSymbol[] = [];
            for (let row = 0; row < CONFIG.ROW_COUNT; row++) {
                if (hasWin && row === 1) {
                    reel.push(winSymbol!);
                } else {
                    reel.push(this.randomSymbol());
                }
            }
            matrix.push(reel);
        }

        console.log('Generated matrix:', matrix);
        return matrix;
    }

    private randomSymbol(): ReelSymbol {
        return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }

    private calculateWin(matrix: ReelMatrix): number {
        const centerLine = matrix.map(reel => reel[1]);
        const firstSymbol = centerLine[0];

        let matchCount = 1;
        for (let i = 1; i < centerLine.length; i++) {
            if (centerLine[i] === firstSymbol) {
                matchCount++;
            } else {
                break;
            }
        }

        if (matchCount >= CONFIG.MATCH_MIN) {
            const symbolIndex = SYMBOLS.indexOf(firstSymbol);
            return matchCount * CONFIG.WIN_MULTIPLIER * (symbolIndex + 1);
        }

        return 0;
    }
}
