import { BaseView } from '../core/BaseView';
import { Text, Graphics, Container } from 'pixi.js';
import { SlotViewModel } from './SlotViewModel';
import { GameStage } from './types';

const CONFIG = {
    TEXT_Y: 460,
    TEXT_FONT_SIZE: 16,
    STAGE_FONT_SIZE: 12,
    BUTTON_Y: 560,
    BUTTON_WIDTH: 110,
    BUTTON_HEIGHT: 50,
    SPIN_X: 270,
    AUTO_X: 450,
    BET_X: 140,
    SPIN_COLOR: 0x27ae60,
    STOP_COLOR: 0xe74c3c,
    AUTO_COLOR: 0x3498db,
    BET_COLOR: 0x9b59b6,
    SHADOW_COLOR: 0x000000,
    SHADOW_ALPHA: 0.3,
    TEXT_COLOR: 0xecf0f1,
    STAGE_COLOR: 0x95a5a6,
    BUTTON_TEXT_COLOR: 0xffffff,
    BUTTON_TEXT_SIZE: 18,
    BUTTON_RADIUS: 10,
};

export class SlotUI extends BaseView {
    private balanceText!: Text;
    private betText!: Text;
    private lastWinText!: Text;
    private stageText!: Text;
    private spinBtn!: Container;
    private stopBtn!: Container;
    private autoBtn!: Container;
    private betBtn!: Container;
    private autoBtnText!: Text;
    private stopLocked = false;

    init(vm: SlotViewModel): void {
        this.createInfoDisplay(vm);
        this.createButtons(vm);
        this.setupListeners(vm);
    }

    private createInfoDisplay(vm: SlotViewModel): void {
        this.balanceText = new Text('Balance: $0', { fontSize: CONFIG.TEXT_FONT_SIZE, fill: CONFIG.TEXT_COLOR, fontFamily: 'Arial' });
        this.balanceText.position.set(80, CONFIG.TEXT_Y);
        this.addChild(this.balanceText);

        this.betText = new Text('Bet: $0', { fontSize: CONFIG.TEXT_FONT_SIZE, fill: CONFIG.TEXT_COLOR, fontFamily: 'Arial' });
        this.betText.position.set(320, CONFIG.TEXT_Y);
        this.addChild(this.betText);

        this.lastWinText = new Text('Last Win: $0', { fontSize: CONFIG.TEXT_FONT_SIZE, fill: CONFIG.TEXT_COLOR, fontFamily: 'Arial' });
        this.lastWinText.position.set(530, CONFIG.TEXT_Y);
        this.addChild(this.lastWinText);

        this.stageText = new Text('Stage: IDLE', { fontSize: CONFIG.STAGE_FONT_SIZE, fill: CONFIG.STAGE_COLOR, fontFamily: 'Arial' });
        this.stageText.position.set(80, CONFIG.TEXT_Y + 25);
        this.addChild(this.stageText);

        this.updateInfoDisplay(vm);
    }

    private createButtons(vm: SlotViewModel): void {
        this.spinBtn = this.createButton('SPIN', CONFIG.SPIN_X, CONFIG.BUTTON_Y, CONFIG.BUTTON_WIDTH + 50, CONFIG.BUTTON_HEIGHT, CONFIG.SPIN_COLOR, () => vm.startSpin());

        this.stopBtn = this.createButton('STOP', CONFIG.SPIN_X, CONFIG.BUTTON_Y, CONFIG.BUTTON_WIDTH + 50, CONFIG.BUTTON_HEIGHT, CONFIG.STOP_COLOR, () => {
            if (this.stopLocked) return;
            this.stopLocked = true;
            vm.stopSpin();
        });

        this.autoBtn = this.createButton('AUTO', CONFIG.AUTO_X, CONFIG.BUTTON_Y, CONFIG.BUTTON_WIDTH, CONFIG.BUTTON_HEIGHT, CONFIG.AUTO_COLOR, () => {
            if (vm.isAutoMode) {
                vm.stopAuto();
            } else {
                vm.startSpin(true);
            }
        });
        this.autoBtnText = this.autoBtn.children[2] as Text;

        this.betBtn = this.createButton(`BET: $${vm.model.currentBet}`, CONFIG.BET_X, CONFIG.BUTTON_Y, CONFIG.BUTTON_WIDTH, CONFIG.BUTTON_HEIGHT, CONFIG.BET_COLOR, () => vm.changeBet());

        this.stopBtn.visible = false;
        this.updateButtonStates(vm);
    }

    private createButton(label: string, x: number, y: number, width: number, height: number, color: number, callback: () => void): Container {
        const container = new Container();
        container.position.set(x, y);
        container.eventMode = 'static';
        container.cursor = 'pointer';

        const shadow = new Graphics();
        shadow.beginFill(CONFIG.SHADOW_COLOR, CONFIG.SHADOW_ALPHA);
        shadow.drawRoundedRect(0, 4, width, height, CONFIG.BUTTON_RADIUS);
        shadow.endFill();

        const bg = new Graphics();
        bg.beginFill(color);
        bg.drawRoundedRect(0, 0, width, height, CONFIG.BUTTON_RADIUS);
        bg.endFill();

        const text = new Text(label, { fontSize: CONFIG.BUTTON_TEXT_SIZE, fill: CONFIG.BUTTON_TEXT_COLOR, fontWeight: 'bold' });
        text.anchor.set(0.5);
        text.position.set(width / 2, height / 2);

        container.addChild(shadow, bg, text);

        container.on('pointerover', () => { if (container.eventMode === 'static') bg.tint = 0xcccccc; });
        container.on('pointerout', () => { bg.tint = 0xffffff; });
        container.on('pointerdown', () => { if (container.eventMode === 'static') { callback(); bg.tint = 0x888888; } });
        container.on('pointerup', () => { bg.tint = 0xffffff; });

        this.addChild(container);
        return container;
    }

    private setupListeners(vm: SlotViewModel): void {
        vm.on('update', () => {
            this.updateInfoDisplay(vm);
            this.updateButtonStates(vm);
        });
    }

    private updateInfoDisplay(vm: SlotViewModel): void {
        this.balanceText.text = `Balance: $${vm.model.balance}`;
        this.betText.text = `Bet: $${vm.model.currentBet}`;
        this.lastWinText.text = `Last Win: $${vm.model.lastWin}`;
        this.stageText.text = `Stage: ${vm.stage}`;
    }

    private updateButtonStates(vm: SlotViewModel): void {
        this.spinBtn.visible = false;
        this.stopBtn.visible = false;

        switch (vm.stage) {
            case GameStage.IDLE:
                this.stopLocked = false;
                this.spinBtn.visible = true;
                this.spinBtn.alpha = 1;
                this.spinBtn.eventMode = 'static';
                break;
            case GameStage.SPINNING:
                this.stopBtn.visible = true;
                if (this.stopLocked) {
                    this.stopBtn.alpha = 0.5;
                    this.stopBtn.eventMode = 'none';
                } else {
                    this.stopBtn.alpha = 1;
                    this.stopBtn.eventMode = 'static';
                }
                break;
            case GameStage.SHOWING_WIN:
                this.stopBtn.visible = true;
                this.stopBtn.alpha = 0.5;
                this.stopBtn.eventMode = 'none';
                break;
        }

        this.autoBtn.alpha = 1;
        this.autoBtn.eventMode = 'static';
        this.autoBtnText.text = vm.isAutoMode ? 'STOP AUTO' : 'AUTO';

        const betBtnText = this.betBtn.children[2] as Text;
        betBtnText.text = `BET: $${vm.model.currentBet}`;
        this.betBtn.alpha = vm.stage === GameStage.IDLE ? 1 : 0.5;
        this.betBtn.eventMode = vm.stage === GameStage.IDLE ? 'static' : 'none';
    }
}
