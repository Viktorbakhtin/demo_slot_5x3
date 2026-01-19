import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { ReelSymbol, SYMBOLS } from './types';

const CONFIG = {
    REEL_WIDTH: 100,
    REEL_HEIGHT: 80,
    VISIBLE_SYMBOLS: 3,
    TOTAL_SYMBOLS: 20,
    SYMBOL_FONT_SIZE: 52,
    SYMBOL_FILL_COLOR: 0xffffff,
    SYMBOL_BG_COLOR: 0x34495e,
    SYMBOL_BG_ALPHA: 0.8,
    SYMBOL_BG_RADIUS: 8,
    SPIN_SPEED: 1600,
    FINAL_SPIN_DURATION: 0.35
};

export class Reel extends Container {
    private symbols: Text[] = [];
    private bg!: Graphics;
    private reelMask!: Graphics;
    private symbolContainer: Container;
    private spinTween: gsap.core.Tween | null = null;
    private isStopping: boolean = false;

    constructor() {
        super();
        this.symbolContainer = new Container();
        this.createBackground();
        this.createMask();
        this.createSymbols();
        this.addChild(this.symbolContainer);
    }

    private createBackground(): void {
        this.bg = new Graphics();
        this.bg.beginFill(CONFIG.SYMBOL_BG_COLOR, CONFIG.SYMBOL_BG_ALPHA);
        this.bg.drawRoundedRect(0, 0, CONFIG.REEL_WIDTH, CONFIG.REEL_HEIGHT * CONFIG.VISIBLE_SYMBOLS, CONFIG.SYMBOL_BG_RADIUS);
        this.bg.endFill();
        this.addChild(this.bg);
    }

    private createMask(): void {
        this.reelMask = new Graphics();
        this.reelMask.beginFill(0xffffff);
        this.reelMask.drawRect(0, 0, CONFIG.REEL_WIDTH, CONFIG.REEL_HEIGHT * CONFIG.VISIBLE_SYMBOLS);
        this.reelMask.endFill();
        this.addChild(this.reelMask);
        this.symbolContainer.mask = this.reelMask;
    }

    private createSymbols(): void {
        for (let i = 0; i < CONFIG.TOTAL_SYMBOLS; i++) {
            const symbol = new Text(this.randomSymbol(), {
                fontSize: CONFIG.SYMBOL_FONT_SIZE,
                fill: CONFIG.SYMBOL_FILL_COLOR,
                fontWeight: 'bold'
            });
            symbol.anchor.set(0.5);
            symbol.x = CONFIG.REEL_WIDTH / 2;
            symbol.y = CONFIG.REEL_HEIGHT / 2 + i * CONFIG.REEL_HEIGHT;
            this.symbols.push(symbol);
            this.symbolContainer.addChild(symbol);
        }
    }

    private randomSymbol(): ReelSymbol {
        return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }

    startSpin(): void {
        if (this.spinTween) this.spinTween.kill();
        this.isStopping = false;
        const distance = CONFIG.REEL_HEIGHT * CONFIG.TOTAL_SYMBOLS;
        this.spinLoop(distance);
    }

    private spinLoop(distance: number): void {
        this.spinTween = gsap.to(this.symbolContainer, {
            y: `+=${distance}`,
            duration: distance / CONFIG.SPIN_SPEED,
            ease: 'none',
            onUpdate: () => {
                this.symbols.forEach(symbol => {
                    const globalY = symbol.y + this.symbolContainer.y;
                    if (globalY > CONFIG.REEL_HEIGHT * (CONFIG.VISIBLE_SYMBOLS + 1)) {
                        symbol.y -= CONFIG.REEL_HEIGHT * CONFIG.TOTAL_SYMBOLS;
                        if (!this.isStopping) symbol.text = this.randomSymbol();
                    }
                });
            },
            onComplete: () => {
                if (this.isStopping) return;
                this.symbolContainer.y = 0;
                this.symbols.forEach((s, i) => s.y = CONFIG.REEL_HEIGHT / 2 + i * CONFIG.REEL_HEIGHT);
                this.spinLoop(distance);
            }
        });
    }

    stopSpin(finalSymbols: ReelSymbol[]): void {
        this.isStopping = true;
        if (this.spinTween) { this.spinTween.kill(); this.spinTween = null; }
        for (let i = 0; i < this.symbols.length; i++) {
            this.symbols[i].y = CONFIG.REEL_HEIGHT / 2 + i * CONFIG.REEL_HEIGHT;
            this.symbols[i].text = i < 3 ? finalSymbols[i] : this.randomSymbol();
        }
        this.symbolContainer.y = -CONFIG.REEL_HEIGHT * 3;
        this.spinTween = gsap.to(this.symbolContainer, { y: 0, duration: CONFIG.FINAL_SPIN_DURATION, ease: 'power3.out', onComplete: () => { this.isStopping = false; } });
    }
}
