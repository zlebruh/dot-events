# dot-events
Simple dot-enhanced event system for browsers and Node.js

## Add to your project
```javascript
import events from 'dot-events'
```

## Usage
```javascript
events.on('message', (text) => {
  console.log('MSG:', text)
})
events.trigger('message', 'What happen?')

// ### Result
// What: What happen?
```

## Expected usage: the *dot-natiotion*
Notice how calling the root "ui" caused the whole `ui.something.something` tree to execute
```javascript
events.on('ui', ACTION('ui'))
events.on('ui.sidebar', ACTION('ui.sidebar'))
events.on('ui.sidebar.title', ACTION('ui.sidebar.title'))
events.one('ui.sidebar.loaded', ACTION('ui.sidebar.loaded'))

events.trigger('ui', ui_state)
console.log('===============')
events.trigger('ui', ui_state)

// ### Result
// ui.sidebar.title ::: {loaded: true, title: "she is great"}
// ui.sidebar.loaded ::: {loaded: true, title: "she is great"}
// ui.sidebar ::: {loaded: true, title: "she is great"}
// ui ::: {loaded: true, title: "she is great"}
// ===============
// ui.sidebar.title ::: {loaded: true, title: "she is great"}
// ui.sidebar ::: {loaded: true, title: "she is great"}
// ui ::: {loaded: true, title: "she is great"}
```

There, you're all set. If simplcity is what you're looking for, you have it.

<br><hr><br>

## Methods
```typescript
events.on(name: string, cb: Function): Boolean
events.one(name: string, cb: Function): Boolean
events.find(name: string): String[]
events.replace(name: string, Function): Boolean
events.trigger(name: string, ...any): Boolean

events.off(name: string)
// OR...
// The second argument will remove all branches (sub events) of "name"
events.off(name: string, true)
```

## Getters
```javascript
// Current event names
events.names: String[]

// Ordered by deepest subbranch
// Also shows event execution order
events.ordered: String[]
```
<br><hr><br>

## Dot notation
If you try using this tool for something more than the most brain dead scenario, you may as well take a look at its dot notation aspect.

Consider the following example:
```typescript
events.on(name: string, cb: Function)
```
While not explicitly stated, most special characters are not allowed in ***name***.
Dots, however, are welcome.

Dots separate what I consider event **branches**. All events reside in a flat structure for performance and simplicity reasons. However, `dot-events` suppors virtual branches of events.

### Let's observe
```typescript
events.on('state.ui' cb: Function)
events.trigger('state.ui', some_data)
events.trigger('state.xxx', moar_data)
```

In this particular case, **ui** is just a branch of **state**.

Triggering **state.ui** will execute the callback.

Triggering **state.xxx** will return false because there is no such event.

Triggering **state** will execute the callbacks for every event that has the following format **state.XXX**, including all sub-branches for each branch itself.

And yes, you can totally do **state.super.duper.specific.thing.happened**

