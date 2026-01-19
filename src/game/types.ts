export type ReelSymbol = typeof SYMBOLS[number];
export type ReelMatrix = ReelSymbol[][];

export interface SpinResult {
    matrix: ReelMatrix;
    winAmount: number;
}

export enum GameStage {
    IDLE = 'IDLE',
    SPINNING = 'SPINNING',
    SHOWING_WIN = 'SHOWING_WIN'
}

export interface ISlotMockService {
    getSpinResult(): Promise<SpinResult>;
}

export interface ISlotMockService {
    getSpinResult(): Promise<SpinResult>;
}

export const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣', '🔔', '🎰'];