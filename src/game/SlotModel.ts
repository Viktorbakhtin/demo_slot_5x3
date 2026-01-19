import { BaseModel } from '../core/BaseModel';

const CONFIG = {
    INITIAL_BALANCE: 1000,
    INITIAL_BET: 1,
    AVAILABLE_BETS: [1, 2, 5, 10, 20, 50, 100],
};

export class SlotModel extends BaseModel {
    balance: number = CONFIG.INITIAL_BALANCE;
    currentBet: number = CONFIG.INITIAL_BET;
    lastWin: number = 0;
    availableBets: number[] = CONFIG.AVAILABLE_BETS;

    constructor() {
        super();
    }

    canPlaceBet(): boolean {
        return this.balance >= this.currentBet;
    }

    placeBet(): boolean {
        if (!this.canPlaceBet()) {
            return false;
        }
        this.balance -= this.currentBet;
        this.lastWin = 0;
        return true;
    }

    applyWin(amount: number): void {
        this.lastWin = amount;
        this.balance += amount;
    }

    changeBet(bet: number): boolean {
        if (this.availableBets.includes(bet)) {
            this.currentBet = bet;
            return true;
        }
        return false;
    }

    getNextBet(): number {
        const currentIndex = this.availableBets.indexOf(this.currentBet);
        const nextIndex = (currentIndex + 1) % this.availableBets.length;
        return this.availableBets[nextIndex];
    }
}
