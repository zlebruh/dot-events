class Eve {
  /**
   * @param {object} params
   */
  constructor(params = null) {
    /**
     * @property {boolean} Eve#once
     * @property {function} Eve#callback
     */
    Object.defineProperties(this, {
      once: { value: params.once },
      callback: {
        value: (...args) => {
          if (this.toDestroy === true) return false;

          args.shift();
          if (params.once === true) {
            Object.defineProperty(this, 'toDestroy', { value: true });
          }
          return params.callback.apply(null, args);
        },
      },
    });
  }
}

// ################ LOCAL ################
const prefix = '### Events:';
const STORAGE = Object.create(null)
const REGEX = /^[a-zA-Z0-9._]{1,}$/

const VALID = path => path && REGEX.test(path)
const NAMES = () => Object.keys(STORAGE)
const ORDERED = () => Object.keys(STORAGE).sort().reverse()
const has = path => path in STORAGE
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

    if (has(name)) {
      console.log(prefix, `There is already an event '${name}'. Use the 'replace' method instead.`);
      return false;
    }
    const OK = VALID(name) && typeof callback === 'function'

    if (OK) STORAGE[name] = new Eve({ name, callback, once })

    return OK
  } catch (err) {
    console.log(prefix, err.message);
    return false;
  }
}
const REMOVE_EVENT = path => path in STORAGE && delete STORAGE[path]
const REMOVE_EVENTS = list => {
  list.forEach(REMOVE_EVENT)
  return Boolean(list.length)
}


// ################ EXPORTED ################
export const on = (path, callback) => ADD_EVENT(path, callback)
export const one = (path, callback) => ADD_EVENT(path, callback, true)

export const off = (path, includeChildren = false) => {
  if (path === '*') return REMOVE_EVENTS(NAMES())

  const found = find(path, includeChildren)
  return REMOVE_EVENTS(found)
}

export const find = (path = '', includeChildren = true) => {
  if (!path.length) return []
  if (includeChildren === false && has(path)) return [path]

  const clean = CLEANER(path)
  const regex = new RegExp(`^${clean}\\b`)

  return ORDERED().filter(v => includeChildren && v && regex.test(v))
}

export const trigger = (path, ...args) => {
  if (!has(path)) return false

  const found = find(path)
  found.length > 1
    ? found.forEach(v => PULL_TRIGGER(v, args))
    : PULL_TRIGGER(path, args)

  return true
}

export const replace = (path, callback) => {
  const name = CLEANER(path)
  if (has(name)) {
    const { once } = STORAGE[name]
    REMOVE_EVENT(name)
    return ADD_EVENT(name, callback, once)
  }

  console.log(prefix, `There is no task with name: "${path}"`);
  return false
}

const regular = {
  on, one, off, has,
  find, trigger, replace
}

export const exported = Object.defineProperties(regular, {
  names: { get: NAMES },
  ordered: { get: ORDERED },
})

export default Object.freeze(exported)
