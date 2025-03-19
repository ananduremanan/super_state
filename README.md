# super_state

A Simple React State Management System

## Usage

### Installation

```bash
npm i @grampro/superstate
```

### Global State

A Simple Global State Management Utility

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

### Super State

A Simple State Management Utility

```jsx
"use client";

import { supState } from "@grampro/superstate";
import { ChevronDown, ChevronRight } from "@/icons/clipboard";
import React from "react";

export default function MobileMenu() {
  const isMenuOpen = supState(false);

  return (
    <div className="mb-4 sticky top-14 z-50 w-full py-4 backdrop-blur-xl md:hidden">
      <button
        onClick={() => {
          isMenuOpen.value = !isMenuOpen.value;
        }}
        className="flex items-center gap-2 px-4"
      >
        {isMenuOpen.value ? <ChevronDown /> : <ChevronRight />}
        Menu
      </button>

      {isMenuOpen.value && (
        <div className="absolute left-0 right-0 top-full bg-white dark:bg-black w-full px-4 h-[calc(100vh-1.5rem)] overflow-hidden z-10">
          <div>Menu 1</div>
        </div>
      )}
    </div>
  );
}
```
