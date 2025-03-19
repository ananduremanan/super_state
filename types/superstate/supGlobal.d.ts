export declare function globalState<T>(initialValue: T): {
    value: T;
    subscribe(callback: () => void): () => void;
    useValue(): T;
};
