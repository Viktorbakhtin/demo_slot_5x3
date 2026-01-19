import { Container } from 'pixi.js';

export abstract class BaseView extends Container {
    abstract init(...args: any[]): void;

    destroy(options?: any): void {
        super.destroy(options);
    }
}