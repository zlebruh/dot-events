// Utilities
const Tools = require('zletools');

// Local stuff
const prefix = '### Events:';

// We don't want events that end with a "."
const specialRegex = /^([a-zA-Z0-9_]+)([.]?[a-zA-Z0-9_])+$/;

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
      once: {value: params.once},
      callback: {
        value: (...args) => {
          if (this.toDestroy === true) return false;

          args.shift();
          if (params.once === true) {
            Object.defineProperty(this, 'toDestroy', {value: true});
          }
          return params.callback.apply(null, args);
        },
      },
    });
  }
}

class Events {
  constructor() {
    /**
     * @property {array} Events#names
     */
    Object.defineProperties(this, {
      names: {get: () => Object.keys(this)},
    });
  }

  /**
   * @param {string} name
   * @param {cb} Function
   * @returns {boolean}
   */
  on(name, cb) {
    return Events.add(this, name, cb);
  }

  /**
   * @param {string} name
   * @param {cb} Function
   * @returns {boolean}
   */
  one(name, cb) {
    return Events.add(this, name, cb, true);
  }

  /**
   * @param {string} name
   * @param {boolean} [includeChildren]
   * @returns {boolean}
   */
  off(name, includeChildren) {
    return this.empty(name, includeChildren, this);
  }

  /**
   * @param {string} name
   * @param {boolean} [includeChildren]
   * @returns {boolean}
   */
  empty(rootName = '', includeChildren = false) {
    if (Events.hasSpecial(rootName, true)) return false;

    const { names } = this;
    if (rootName === '*') {
      names.forEach((name) => delete this[name]);
      return true;
    }

    const keys = Tools.isString(rootName, true)
      ? Events.filterBranch(rootName, names)
      : names;

    if (!keys.length) {
      return false;
    }

    if (this.has(rootName) && !includeChildren) {
      return delete this[rootName]; // eslint-disable-line no-param-reassign
    }

    if (includeChildren === true) {
      keys.forEach((key) => delete this[key]); // eslint-disable-line no-param-reassign
      return true;
    }

    return false;
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return Tools.is(this[name]);
  }

  /**
   * @param {string} name
   * @param {boolean} [lookForChildren]
   * @returns {string[]}
   */
  find(name = '', lookForChildren) {
    return Events.filterBranch(name, this.names, lookForChildren);
  }

  /**
   * @param {string} eventName
   * @param {boolean} [lookForChildren]
   * @returns {boolean}
   */
  trigger(eventName, ...args) {
    // Explaining the use of .sort() and .reverse() below
    // We need to execute the list starting from the deepest branch.
    // Otherwise a whole tree could be compromised...
    // if the root event has been called (and destroyed),
    // bringing all its children with it before...
    // they've been given the chance to execute their respective callbacks.
    const branchNames = Events
      .filterBranch(eventName, this.names)
      .sort()
      .reverse();

    if (!branchNames.length) {
      return false;
    }

    return branchNames.length > 1
      ? Events.triggerBranch.call(Events, ...[this, branchNames, ...args])
      : Events.pullTrigger.call(Events, ...[this, branchNames[0], ...args]);
  }

  /**
   * @returns {boolean}
   */
  replace(...args) {
    try {
      const params = Events.checkParams.call(Events, ...args);
      const { name } = params;
      if (this.has(name)) {
        params.once = this[name].once;
        return Events.addEvent(this, params);
      }

      console.log(prefix, `There is no task with name: "${name}"`);
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /** *********** Static *********** */
  /**
   * @returns {boolean}
   */
  static pullTrigger(...args) {
    const instance = args.shift();
    const [name] = args;
    const item = instance[name];
    if (item && Tools.isFunction(item.callback)) {
      item.callback.call(item, ...args);

      return item.toDestroy === true
        ? instance.off(name)
        : true;
    }

    return false;
  }

  /**
   * @returns {boolean}
   */
  static triggerBranch(...args) {
    const instance = args.shift();
    const trigger = this.pullTrigger.bind(Events);
    args.shift().forEach((name) => trigger(...[instance, name, ...args]));

    return true;
  }

  /**
   * @param {string} rootName
   * @param {Array} events
   * @param {boolean} [lookForChildren]
   * @returns {Array}
   */
  static filterBranch(rootName, events, lookForChildren) {
    if (!Tools.isString(rootName, true)) {
      console.log(prefix, Tools.textNotString(rootName, 'rootName'));
      return [];
    }

    const branch = Tools
      .filterUnique(rootName.split(' '))
      .reduce((result, _name, idx, roots) => {
        const name = roots[idx];
        if (name !== '' || Events.hasSpecial(name, true)) {
          const main = new RegExp(`^${name}\\.`);
          const child = new RegExp(`[a-zA-Z]+\\.${name}(\\.[a-zA-Z]+)?$`);

          return result.concat(events.filter((item) => {
            const match = item === name || main.test(item);
            return lookForChildren !== true
              ? match
              : match || child.test(item);
          }));
        }

        return result;
      }, []);

    return Tools.filterUnique(branch);
  }

   /**
   * @returns {boolean}
   */
  static add(...args) {
    try {
      const instance = args.shift();
      const params = Events.checkParams(...args);

      if (Events.hasSpecial(params.name, true)) {
        return false;
      }
      if (instance.has(params.name)) {
        console.log(prefix, `There is already an event "${params.name}". Use the "replace" method instead.`);
        return false;
      }

      return this.addEvent(instance, params);
    } catch (err) {
      // console.log(prefix, err);
      console.log(prefix, err.message);
      return false;
    }
  }

   /**
   * @param {Events} instance
   * @param {*} params
   * @returns {boolean}
   */
  static addEvent(instance, params) {
    try {
      Object.assign(instance, {
        [params.name]: new Eve(params),
      })
      return true;
    } catch (err) {
      console.log(prefix, err);
      return false;
    }
  }

  /**
   * @returns {{name:String, callback: Function, once:boolean}}
   */
  static checkParams(...args) {
    Tools.checkForNumberOfArguments(2, args);

    const [name, callback] = args;
    const once = args[2] || false;

    if (!Tools.isString(name, true)) {
      Tools.throwNotString(name, 'name');
    }
    if (!Tools.isFunction(callback)) {
      Tools.throwNotFn(callback, 'callback');
    }

    return {name, callback, once};
  }

  /**
   * @param {string} string
   * @param {boolean} [warn]
   * @returns {boolean}
   */
  static hasSpecial(string = '', warn) {
    if (string === '*') return false;

    const test = !specialRegex.test(string);
    if (test && warn === true) {
      Events.specialNotSupported(string);
    }
    return test;
  }

  static specialNotSupported(char = '') {
    console.log(prefix, `Error in [${JSON.stringify(char)}]. Special characters, white spaces in names, names ending with a dot, and completely empty strings, are not supported.`);
    return false;
  }
}

module.exports = new Events();
