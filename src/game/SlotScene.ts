import { Text } from 'pixi.js';
import { BaseView } from '../core/BaseView';
import { SlotViewModel } from './SlotViewModel';
import { FSM } from '../core/FSM';
import { GameStage, SpinResult } from './types';
import { SlotMockService } from './SlotMockService';
import gsap from 'gsap';
import { Reel } from './Reel';

const CONFIG = {
    REEL_COUNT: 5,
    REEL_START_X: 80,
    REEL_START_Y: 200,
    REEL_GAP: 110,
    WIN_TEXT_X: 350,
    WIN_TEXT_Y: 320,
    WIN_TEXT_FONT_SIZE: 64,
    WIN_TEXT_FILL: 0xf1c40f,
    WIN_TEXT_STROKE: 0x000000,
    WIN_TEXT_STROKE_THICKNESS: 4,
    WIN_SCALE_DURATION: 0.5,
    WIN_SHOW_DURATION: 1500,
    WIN_FADE_DURATION: 0.3,
    AUTO_STOP_DELAY: 1000,
    SPIN_STOP_DELAY: 500
};

export class SlotScene extends BaseView {
    private fsm!: FSM<GameStage>;
    private vm!: SlotViewModel;
    private mockService!: SlotMockService;
    private reels: Reel[] = [];
    private winText!: Text;
    private currentResult: SpinResult | null = null;
    private autoStopTimeout: number | null = null;
    private stopLocked: boolean = false;

    init(vm: SlotViewModel): void {
        this.vm = vm;
        this.mockService = new SlotMockService();
        this.setupFSM();
        this.createReels();
        this.createWinDisplay();
        this.setupViewModelListeners();
    }

    private setupFSM(): void {
        this.fsm = new FSM<GameStage>(GameStage.IDLE);
        this.fsm.addTransition({ from: GameStage.IDLE, to: GameStage.SPINNING });
        this.fsm.addTransition({ from: GameStage.SPINNING, to: GameStage.SHOWING_WIN });
        this.fsm.addTransition({ from: GameStage.SHOWING_WIN, to: GameStage.IDLE });
        this.fsm.onEnter(GameStage.SPINNING, () => this.onEnterSpinning());
        this.fsm.onEnter(GameStage.SHOWING_WIN, () => this.onEnterShowingWin());
        this.fsm.onEnter(GameStage.IDLE, () => this.onEnterIdle());
    }

    private createReels(): void {
        for (let i = 0; i < CONFIG.REEL_COUNT; i++) {
            const reel = new Reel();
            reel.x = CONFIG.REEL_START_X + i * CONFIG.REEL_GAP;
            reel.y = CONFIG.REEL_START_Y;
            this.reels.push(reel);
            this.addChild(reel);
        }
    }

    private createWinDisplay(): void {
        this.winText = new Text('', {
            fontSize: CONFIG.WIN_TEXT_FONT_SIZE,
            fill: CONFIG.WIN_TEXT_FILL,
            fontWeight: 'bold',
            stroke: CONFIG.WIN_TEXT_STROKE,
            //@ts-ignore
            strokeThickness: CONFIG.WIN_TEXT_STROKE_THICKNESS
        });
        this.winText.anchor.set(0.5);
        this.winText.x = CONFIG.WIN_TEXT_X;
        this.winText.y = CONFIG.WIN_TEXT_Y;
        this.winText.visible = false;
        this.addChild(this.winText);
    }

    private setupViewModelListeners(): void {
        this.vm.on('spinStart', () => {
            this.fsm.transition(GameStage.SPINNING);
        });
        this.vm.on('spinStop', () => {
            this.handleStop();
        });
    }

    private async handleStop(): Promise<void> {
        if (this.stopLocked) return;
        this.stopLocked = true;

        if (this.autoStopTimeout) {
            clearTimeout(this.autoStopTimeout);
            this.autoStopTimeout = null;
        }
        if (!this.currentResult) return;
        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].stopSpin(this.currentResult.matrix[i]);
        }
        await new Promise(resolve => setTimeout(resolve, CONFIG.SPIN_STOP_DELAY));
        this.fsm.transition(GameStage.SHOWING_WIN);
        this.vm.onSpinComplete(this.currentResult);
    }

    private async onEnterSpinning(): Promise<void> {
        this.winText.visible = false;
        if (this.autoStopTimeout) {
            clearTimeout(this.autoStopTimeout);
            this.autoStopTimeout = null;
        }
        this.currentResult = await this.mockService.getSpinResult();
        this.reels.forEach(reel => reel.startSpin());
        this.autoStopTimeout = window.setTimeout(() => {
            this.handleStop();
        }, CONFIG.AUTO_STOP_DELAY);
    }

    private async onEnterShowingWin(): Promise<void> {
        if (!this.currentResult || this.currentResult.winAmount <= 0) {
            this.fsm.transition(GameStage.IDLE);
            return;
        }
        this.winText.text = `WIN: $${this.currentResult.winAmount}`;
        this.winText.visible = true;
        this.winText.scale.set(0);
        await gsap.to(this.winText.scale, {
            x: 1,
            y: 1,
            duration: CONFIG.WIN_SCALE_DURATION,
            ease: 'back.out(1.7)'
        });
        await new Promise(resolve => setTimeout(resolve, CONFIG.WIN_SHOW_DURATION));
        await gsap.to(this.winText, {
            alpha: 0,
            duration: CONFIG.WIN_FADE_DURATION
        });
        this.winText.alpha = 1;
        this.fsm.transition(GameStage.IDLE);
    }

    private onEnterIdle(): void {
        this.stopLocked = false;
        this.winText.visible = false;
        this.vm.onWinShown();
        this.currentResult = null;
    }
}
