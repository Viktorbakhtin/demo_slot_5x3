export abstract class BaseModel {
    protected _data: Record<string, any> = {};

    protected setState(key: string, value: any): void {
        this._data[key] = value;
    }

    protected getState<T>(key: string): T {
        return this._data[key] as T;
    }
}