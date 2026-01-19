import { EventEmitter } from 'eventemitter3';

export abstract class BaseViewModel extends EventEmitter {
    protected emitUpdate(): void {
        this.emit('update');
    }
}