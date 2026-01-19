import { Application } from 'pixi.js';
import { SlotModel } from './game/SlotModel';
import { SlotViewModel } from './game/SlotViewModel';
import { SlotScene } from './game/SlotScene';
import { SlotUI } from './game/SlotUI';

declare global {
    interface Window {
        app: Application;
    }
}

(async () => {
    const app = new Application();
    await app.init({
        width: 700,
        height: 720,
        background: 0x16213e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    document.body.appendChild(app.canvas);

    const model = new SlotModel();
    const viewModel = new SlotViewModel(model);

    const scene = new SlotScene();
    scene.init(viewModel);

    const ui = new SlotUI();
    ui.init(viewModel);

    app.stage.addChild(scene);
    app.stage.addChild(ui);
})();