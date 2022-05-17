class Eve {
  constructor({ once, callback }) {
    const CALLBACK = (name, ...args) => {
      if (this.toDestroy === true) return false;

      if (once === true) {
        Object.defineProperty(this, 'toDestroy', { value: true })
      }

      return callback.apply(null, args)
    }

    Object.defineProperties(this, {
      once: { value: once },
      callback: { value: CALLBACK }
    })
  }
}

// ################ LOCAL ################
const prefix = '### Events:';
const STORAGE = Object.create(null)
const REGEX = /^[a-zA-Z0-9._]{1,}$/

const ERR = msg => { console.log(prefix, msg); return false; }
const VALID = path => path && REGEX.test(path)
const CLEANER = path => path.split(/\./).filter(v => v).join('.')
const PULL_TRIGGER = (key, args) => {
  const item = STORAGE[key]
  STORAGE[key].callback(key, ...args)
  item.toDestroy === true && off(key)
}
const ADD_EVENT = (...args) => {
  try {
    if (args.length < 2) return false

    const [path, callback, once = false] = args
    const name = CLEANER(path)

    if (has(name)) return ERR(`There is already an event '${name}'. Use the 'replace' method instead.`)

    const OK = VALID(name) && typeof callback === 'function'

    if (OK) STORAGE[name] = new Eve({ name, callback, once })

    return OK
  } catch (err) {
    return ERR(err.message);
  }
}
const REMOVE_EVENT = path => path in STORAGE && delete STORAGE[path]
const REMOVE_EVENTS = list => {
  list.forEach(REMOVE_EVENT)
  return Boolean(list.length)
}


// ################ EXPORTED ################
const on = (path, callback) => ADD_EVENT(path, callback)
const one = (path, callback) => ADD_EVENT(path, callback, true)

const off = (path, includeChildren = false) => {
  return path === '*'
    ? REMOVE_EVENTS(names())
    : REMOVE_EVENTS(find(path, includeChildren))
}

const find = (path = '', includeChildren = true) => {
  if (!path.length) return []
  if (includeChildren === false && has(path)) return [path]

  const clean = CLEANER(path)
  const regex = new RegExp(`^${clean}\\b`)

  return ordered().filter(v => includeChildren && v && regex.test(v))
}

const trigger = (path, ...args) => {
  const found = find(path).map(v => PULL_TRIGGER(v, args))
  return Boolean(found.length)
}

const replace = (path, callback) => {
  const name = CLEANER(path)

  if (!has(name)) return ERR(`There is no task with name: "${name}"`)

  const { once } = STORAGE[name]
  return REMOVE_EVENT(name) && ADD_EVENT(name, callback, once)
}

const has = path => path in STORAGE
const names = () => Object.keys(STORAGE)
const ordered = () => Object.keys(STORAGE).sort().reverse()

export default Object.freeze({
  on, one, off, has,
  find, trigger, replace,
  get names() { return names() },
  get ordered() { return ordered() },
})
