export type StateTransition<T extends string> = {
    from: T | T[];
    to: T;
};

export class FSM<T extends string> {
    private currentState: T;
    private transitions: Map<T, Set<T>> = new Map();
    private onEnterCallbacks: Map<T, (() => void)[]> = new Map();
    private onExitCallbacks: Map<T, (() => void)[]> = new Map();

    constructor(initialState: T) {
        this.currentState = initialState;
    }

    addTransition(transition: StateTransition<T>): void {
        const fromStates = Array.isArray(transition.from) ? transition.from : [transition.from];

        fromStates.forEach(from => {
            if (!this.transitions.has(from)) {
                this.transitions.set(from, new Set());
            }
            this.transitions.get(from)!.add(transition.to);
        });
    }

    onEnter(state: T, callback: () => void): void {
        if (!this.onEnterCallbacks.has(state)) {
            this.onEnterCallbacks.set(state, []);
        }
        this.onEnterCallbacks.get(state)!.push(callback);
    }

    onExit(state: T, callback: () => void): void {
        if (!this.onExitCallbacks.has(state)) {
            this.onExitCallbacks.set(state, []);
        }
        this.onExitCallbacks.get(state)!.push(callback);
    }

    transition(to: T): boolean {
        const allowedTransitions = this.transitions.get(this.currentState);

        if (!allowedTransitions || !allowedTransitions.has(to)) {
            console.warn(`Invalid transition from ${this.currentState} to ${to}`);
            return false;
        }

        const exitCallbacks = this.onExitCallbacks.get(this.currentState);
        if (exitCallbacks) {
            exitCallbacks.forEach(cb => cb());
        }

        this.currentState = to;

        const enterCallbacks = this.onEnterCallbacks.get(to);
        if (enterCallbacks) {
            enterCallbacks.forEach(cb => cb());
        }

        return true;
    }

    getCurrentState(): T {
        return this.currentState;
    }

    is(state: T): boolean {
        return this.currentState === state;
    }

    canTransitionTo(state: T): boolean {
        const allowedTransitions = this.transitions.get(this.currentState);
        return allowedTransitions ? allowedTransitions.has(state) : false;
    }
}