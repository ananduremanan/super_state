// Global state store and subscriptions
const store = new Map<string, any>();
const subscriptions = new Map<string, Set<() => void>>();
let idCounter = 0;

// Batch updates for better performance
const batchUpdates = {
  pending: false,
  queue: new Set<() => void>(),

  schedule(callback: () => void) {
    this.queue.add(callback);

    if (!this.pending) {
      this.pending = true;
      Promise.resolve().then(() => {
        this.pending = false;
        const callbacks = Array.from(this.queue);
        this.queue.clear();
        callbacks.forEach((cb: any) => cb());
      });
    }
  },
};

// The main exported function to create global state
export function globalState<T>(initialValue: T) {
  // Generate a unique ID for this state instance
  const id = `state_${idCounter++}`;

  // Initialize the state in the store
  store.set(id, initialValue);

  // Create state handler object with getters and setters
  const stateHandler = {
    get value() {
      return store.get(id);
    },

    set value(newValue: T) {
      const currentValue = store.get(id);

      // Only update if value actually changed
      if (newValue !== currentValue) {
        batchUpdates.schedule(() => {
          store.set(id, newValue);

          // Notify all subscribers
          const subs = subscriptions.get(id);
          if (subs) {
            subs.forEach((callback) => callback());
          }
        });
      }
    },

    // Subscribe to changes
    subscribe(callback: () => void) {
      if (!subscriptions.has(id)) {
        subscriptions.set(id, new Set());
      }

      subscriptions.get(id)!.add(callback);

      // Return unsubscribe function
      return () => {
        const subs = subscriptions.get(id);
        if (subs) {
          subs.delete(callback);
          if (subs.size === 0) {
            subscriptions.delete(id);
          }
        }
      };
    },

    // For use in React components - it returns a simple hook
    // that makes the component re-render when the state changes
    useValue() {
      const [, forceUpdate] = React.useState({});

      React.useEffect(() => {
        return stateHandler.subscribe(() => forceUpdate({}));
      }, []);

      return stateHandler.value;
    },
  };

  return stateHandler;
}

// React import for the useValue method
import React from "react";
