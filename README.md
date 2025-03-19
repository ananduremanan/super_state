# super_state

A Simple React State Management System

## Usage

```typescript
// store.ts
import { globalState } from "@grampro/superstate";

// Create states that can be imported and used anywhere
export const count = globalState(0);
export const user = globalState({ name: "", loggedIn: false });
export const todos = globalState(["Learn React", "Build an app"]);
```

```jsx
// Component One
import React from "react";
import { count } from "./store";

export default function DisplayCounter() {
  const currentCount = count.useValue();

  return (
    <div>
      <p>Count from other component: {currentCount}</p>
      <button onClick={() => (count.value = count.value + 5)}>Add 5</button>
    </div>
  );
}
```

```jsx
// Component Two
import React from "react";
import { count } from "./store";

export default function Counter() {
  const currentCount = count.useValue();

  return (
    <div>
      <p>Count: {currentCount}</p>
      <button onClick={() => (count.value += 1)}>Increment</button>
      <button onClick={() => (count.value -= 1)}>Decrement</button>
    </div>
  );
}
```
