# dot-events
Simple dot-enhanced event system for browsers and Node.js 

## Add to your project
```javascript
import events from 'dot-events'
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

## Example 1
```javascript
function eventHandler() {
  console.log(name, ':::', ...args);
}

events.on('ui.sidebar.title', eventHandler);
events.trigger('ui.sidebar.title', {oh: 'yeah'});

// ### Result
// ui.sidebar.title ::: {oh: 'yeah'}
```

## All methods
```javascript
function eventHandler() {
  console.log(name, ':::', ...args);
}

events.on('ui.sidebar.title', eventHandler);         // Returns Boolean
events.one('ui.sidebar.title', eventHandler);        // Returns Boolean
events.off('ui.sidebar.title', eventHandler);        // Returns Boolean
events.find('ui.sidebar.title');                     // Returns String[]
events.trigger('ui.sidebar.title', {some: 'data'});  // Returns Boolean
events.replace('ui.sidebar.title', newEventHandler); // Returns Boolean
```

## Also has a couple of getters
```javascript
events.names   // Returns String[]
events.ordered // Returns String[]
```

## Execution order
Each event brach is being executed starting from its deepest members
