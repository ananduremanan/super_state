import { useState, useRef, useEffect } from "react";

// Batch update scheduler
const batchScheduler = {
  scheduled: false,
  callbacks: new Set<() => void>(),

  schedule(callback: () => void) {
    this.callbacks.add(callback);

    if (!this.scheduled) {
      this.scheduled = true;
      // Use Promise.resolve() to batch updates in a microtask
      Promise.resolve().then(() => {
        this.scheduled = false;
        const callbacksToRun = Array.from(this.callbacks);
        this.callbacks.clear();
        callbacksToRun.forEach((cb: any) => cb());
      });
    }
  },
};

// For deep equality checks
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (!a || !b || typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => keysB.includes(key) && isEqual(a[key], b[key]));
}

// Create a global store for cross-component communication
type StoreSubscriber = () => void;
class GlobalStore {
  private subscribers = new Set<StoreSubscriber>();
  private pendingUpdates = new Map<ReactiveState<any>, any>();
  private batchUpdateScheduled = false;

  subscribe(subscriber: StoreSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  registerUpdate<T>(state: ReactiveState<T>, newValue: T) {
    this.pendingUpdates.set(state, newValue);

    if (!this.batchUpdateScheduled) {
      this.batchUpdateScheduled = true;
      batchScheduler.schedule(() => {
        this.batchUpdateScheduled = false;

        // Apply all pending updates
        this.pendingUpdates.forEach((value, state) => {
          state._applyUpdate(value);
        });
        this.pendingUpdates.clear();

        // Notify all subscribers once
        this.subscribers.forEach((sub) => sub());
      });
    }
  }
}

const globalStore = new GlobalStore();

type Listener = () => void;

class ReactiveState<T> {
  private _value: T;
  private listeners: Set<Listener> = new Set();
  private forceRenderFn: () => void;
  private isObject: boolean;

  constructor(initialValue: T, forceRender: () => void) {
    this._value = initialValue;
    this.forceRenderFn = forceRender;
    this.isObject = initialValue !== null && typeof initialValue === "object";
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    // Check equality based on type
    const isEqual = this.isObject
      ? this._deepEqual(this._value, newValue)
      : this._value === newValue;

    if (!isEqual) {
      // Register update with global store for batching
      globalStore.registerUpdate(this, newValue);
    }
  }

  // Internal method to apply the update (called by the global store)
  _applyUpdate(newValue: T) {
    this._value = newValue;
    this.listeners.forEach((listener) => listener());
  }

  private _deepEqual(a: any, b: any): boolean {
    return isEqual(a, b);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  forceRender(): void {
    this.forceRenderFn();
  }
}

export function supState<T>(initialValue: T): ReactiveState<T> {
  const stateRef = useRef<ReactiveState<T> | null>(null);
  const [, forceRender] = useState(0);
  const storeSubscribed = useRef(false);

  // Create the reactive state instance if it doesn't exist
  if (!stateRef.current) {
    stateRef.current = new ReactiveState<T>(initialValue, () =>
      forceRender((count) => count + 1)
    );
  }

  // Always call useEffect (not conditionally)
  useEffect(() => {
    // Only subscribe once
    if (!storeSubscribed.current) {
      storeSubscribed.current = true;

      // Register for global updates
      const unsubscribe = globalStore.subscribe(() => {
        if (stateRef.current) {
          stateRef.current.forceRender();
        }
      });

      // Return cleanup function
      return unsubscribe;
    }
  }, []);

  return stateRef.current;
}
