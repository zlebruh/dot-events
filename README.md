# dot-events
Simple dot-enhanced event system for browsers and Node.js 

## Add to your project
```javascript
const events = require('dot-events');
```

## Usage
```javascript
events.on('message', (text) => {
  console.log('MSG:', text);
});
events.trigger('message', 'What happen?');

// ### Result
// What: What happen?
```

There, you're all set. If simplcity is what you're looking for, you have it.

## Methods
```typescript
events.on(name: string, cb: Function);
events.one(name: string, cb: Function);
events.replace(name: string, Function);
events.trigger(name: string, ...any); // Any number of parameters

events.off(name: string);
// OR...

// The second argument will remove all branches (sub events) of "name"
events.off(name: string, true);
```

## Dot notation
If you try using this tool for something more than the most brain dead scenario, you may as well take a look at its dot notation aspect.

Consider the following example:
```typescript
events.on(name: string, cb: Function);
```
While not explicitly stated, most special characters are not allowed in ***name***.
Dots, however, are welcome.

Dots separate what I consider event **branches**. All events reside in a flat structure for performance and simplicity reasons. However, `dot-events` suppors virtual branches of events.

### Let's observe
```typescript
events.on('state.ui' cb: Function);
events.trigger('state.ui', some_data);
events.trigger('state.xxx', moar_data);
```

In this particular case, **ui** is just a branch of **state**.

Triggering **state.ui** will execute the callback.

Triggering **state.xxx** will return false because there is no such event.

Triggering **state** will execute the callbacks for every event that has the following format **state.XXX**, including all sub-branches for each branch itself.

And yes, you can totally do **state.super.duper.specific.thing.happened**

## Examples
### Prerequisites for the following complicated examples
```javascript
function ACTION(name) {
  return (...args) => console.log(name, ':::', ...args);
}

let ui_state  = {
  loaded: true,
  title: 'she is great',
};
```

### 1. I'm too young to die
```javascript
events.on('ui.sidebar.title', ACTION('ui.sidebar.title'));
events.trigger('ui.sidebar.title', ui_state);

// ### Result
// ui.sidebar.title ::: {yes: true, she: "is great"}
```

### 2. Hey, not too rough
```javascript
events.on('ui.sidebar.title', ACTION('ui.sidebar.title'));
// This will only happen once
events.one('ui.sidebar.loaded', ACTION('ui.sidebar.loaded'));
events.trigger('ui.sidebar', ui_state);
console.log('===');
events.trigger('ui.sidebar', ui_state);

// ### Result
// ui.sidebar.title ::: {loaded: true, title: "she is great"}
// ui.sidebar.loaded ::: {loaded: true, title: "she is great"}
// ===
// ui.sidebar.title ::: {loaded: true, title: "she is great"}
```

### 3. Hurt me plenty
```javascript
events.on('ui', ACTION('ui'));
events.on('ui.sidebar', ACTION('ui.sidebar'));
events.on('ui.sidebar.title', ACTION('ui.sidebar.title'));
// This will only happen once
events.one('ui.sidebar.loaded', ACTION('ui.sidebar.loaded'));
events.trigger('ui', ui_state);
console.log('===');
events.trigger('ui', ui_state);

// ### Result
// ui.sidebar.title ::: {loaded: true, title: "she is great"}
// ui.sidebar.loaded ::: {loaded: true, title: "she is great"}
// ui.sidebar ::: {loaded: true, title: "she is great"}
// ui ::: {loaded: true, title: "she is great"}
// ===
// ui.sidebar.title ::: {loaded: true, title: "she is great"}
// ui.sidebar ::: {loaded: true, title: "she is great"}
// ui ::: {loaded: true, title: "she is great"}
```

### 4. Nightmare!
```javascript
events.on('ui', ACTION('ui'));
events.on('calls', ACTION('calls'));

const ONE_BIG_STATE = {
  oh: 'yeah',
  yes: false,
};
events.trigger('ui', ONE_BIG_STATE);
ONE_BIG_STATE.yes = true;
console.log('===');
events.trigger('ui calls', ONE_BIG_STATE);

// ### Result
// ui ::: {oh: "yeah", yes: false}
// ===
// ui ::: {oh: "yeah", yes: true}
// calls ::: {oh: "yeah", yes: true}
```

## Execution order
Each event brach is being executed starting from its deepest members

## Emiting multiple events with a single trigger
As shown in example 4, we can trigger as many **unique** event names as we want passing along the same data which is often helpful. You're free to chop your events, triggers and data as you wish.

### Here's how
```javascript
events.trigger('eventOne eventTwo', {some: 'common data');
```

### What about stupid scenarios?
```javascript
events.trigger('eventOne eventTwo eventOne eventOne eventOne', {some: 'common data');
```

Dupes are being filtered out. Only unique strings string-chops are being considered and no event is being executed twice.

## There's more to talk about
...but time is scarce