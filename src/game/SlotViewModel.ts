import { BaseViewModel } from '../core/BaseViewModel';
import { SlotModel } from './SlotModel';
import { GameStage, SpinResult } from './types';

const CONFIG = {
    AUTO_SPINS_COUNT: 999,
    AUTO_SPIN_DELAY_MS: 100,
};

export class SlotViewModel extends BaseViewModel {
    model: SlotModel;
    stage: GameStage = GameStage.IDLE;
    isAutoMode: boolean = false;
    autoSpinsRemaining: number = 0;

    constructor(model: SlotModel) {
        super();
        this.model = model;
    }

    canSpin(): boolean {
        return this.stage === GameStage.IDLE && this.model.canPlaceBet();
    }

    canStop(): boolean {
        return this.stage === GameStage.SPINNING;
    }

    startSpin(auto: boolean = false): void {
        if (!this.canSpin()) return;

        if (auto && !this.isAutoMode) {
            this.isAutoMode = true;
            this.autoSpinsRemaining = CONFIG.AUTO_SPINS_COUNT;
        }

        if (!this.model.placeBet()) {
            this.stopAuto();
            return;
        }

        this.setStage(GameStage.SPINNING);
        this.emit('spinStart');
        this.emitUpdate();
    }

    stopSpin(): void {
        if (this.canStop()) {
            this.emit('spinStop');
        }
    }

    stopAuto(): void {
        this.isAutoMode = false;
        this.autoSpinsRemaining = 0;
        this.emitUpdate();
    }

    onSpinComplete(result: SpinResult): void {
        if (result) {
            this.setStage(GameStage.SHOWING_WIN);
            this.model.applyWin(result.winAmount);
        }
        this.emit('spinComplete', result);
        this.emitUpdate();
    }

    onWinShown(): void {
        this.setStage(GameStage.IDLE);

        if (this.isAutoMode && this.autoSpinsRemaining > 0) {
            this.autoSpinsRemaining--;
            if (this.autoSpinsRemaining > 0 && this.model.canPlaceBet()) {
                setTimeout(() => this.startSpin(false), CONFIG.AUTO_SPIN_DELAY_MS);
            } else {
                this.stopAuto();
            }
        }

        this.emitUpdate();
    }

    changeBet(): void {
        if (this.stage !== GameStage.IDLE) return;
        const nextBet = this.model.getNextBet();
        this.model.changeBet(nextBet);
        this.emitUpdate();
    }

    private setStage(stage: GameStage): void {
        this.stage = stage;
        this.emit('stageChange', stage);
    }
}
