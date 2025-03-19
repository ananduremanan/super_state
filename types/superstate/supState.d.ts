type Listener = () => void;
declare class ReactiveState<T> {
    private _value;
    private listeners;
    private forceRenderFn;
    private isObject;
    constructor(initialValue: T, forceRender: () => void);
    get value(): T;
    set value(newValue: T);
    _applyUpdate(newValue: T): void;
    private _deepEqual;
    subscribe(listener: Listener): () => void;
    forceRender(): void;
}
export declare function supState<T>(initialValue: T): ReactiveState<T>;
export {};
