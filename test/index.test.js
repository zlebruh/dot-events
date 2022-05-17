import events from '../src/index'

const CB = () => { }

const METHODS = ['on', 'one', 'off', 'has', 'find', 'trigger', 'replace']
const GETTERS = ['names', 'ordered']

const filterExported = (type, target = events) => {
  const keys = Object.keys(target)
  if (type === 'array') return keys.filter(v => Array.isArray(target[v]))
  if (type === 'function') return keys.filter(v => typeof target[v] === type)
  return keys
}
describe('Ensure only the expected methods and getters are exposed', () => {
  test('Verify all methods exist and match exactly what is exposed', () => {
    const keysLocal = [...METHODS].sort()
    const keysExposed = filterExported('function').sort()
    expect(keysLocal.length).toBe(keysExposed.length)
    expect(keysLocal).toEqual(keysExposed)
  })

  test('Verify all getters exist and match exactly what is exposed', () => {
    const keysLocal = [...GETTERS].sort()
    const keysExposed = filterExported('array').sort()
    expect(keysLocal.length).toBe(keysExposed.length)
    expect(keysLocal).toEqual(keysExposed)
  })

  test('Verify the file expose only the select methods and getters and nothing else', () => {
    const keysLocal = [...METHODS, ...GETTERS].sort()
    const keysExposed = filterExported('all').sort()
    expect(keysLocal.length).toBe(keysExposed.length)
    expect(keysLocal).toEqual(keysExposed)
  })
})

describe('Event system - Adding events', () => {
  test('Add simple valid event', () => {
    const act = events.on('turbo', CB)
    expect(act).toBe(true)
  })

  test('Add the another event with the same name', () => {
    const act = events.on('turbo', CB)
    expect(act).toBe(false)
  })

  test('Add branch to existing event', () => {
    const act = events.on('turbo.diesel', CB)
    expect(act).toBe(true)
  })

  test('Adding already existing branch to existing event root', () => {
    const act = events.on('turbo.diesel', CB)
    expect(act).toBe(false)
  })

  test('Adding a branch to unexisting event root', () => {
    const act = events.on('dragon.diesel', CB)
    expect(act).toBe(true)
  })

  test('Adding a sub-branch to unexisting event root', () => {
    const act = events.on('turbo.butters.diesel.injection', CB)
    expect(act).toBe(true)
  })

  test('Adding a sub-branch to existing event root', () => {
    const act = events.on('turbo.diesel.injection', CB)
    expect(act).toBe(true)
  })
})

describe('Event system - Using insufficient arguments', () => {
  test('Add event without arguments', () => {
    expect(events.on()).toBe(false)
  })

  test('Add event without name', () => {
    expect(events.on(CB)).toBe(false)
  })

  test('Add event without callback', () => {
    expect(events.on('CB_is_a_valid_name')).toBe(false)
  })

  test('Add event with special characters', () => {
    expect(events.on('!@{Pdoroti_e_gotina', CB)).toBe(false)
  })
})

describe('Event system - Replacing events', () => {
  test('Add another simple valid event', () => {
    const act = events.on('cheetah', CB)
    expect(act).toBe(true)
  })

  test('Replace existing event', () => {
    const act = events.replace('cheetah', CB)
    expect(act).toBe(true)
  })

  test('Replace unexisting event', () => {
    const act = events.replace('cheetah3000', CB)
    expect(act).toBe(false)
  })

  test('Replace existing sub-event', () => {
    const act = events.replace('turbo.diesel', CB)
    expect(act).toBe(true)
  })

  test('Replace unexisting sub-event', () => {
    const act = events.replace('turbo.diesel5000', CB)
    expect(act).toBe(false)
  })
})

describe('Event system - Triggering events', () => {
  const DATA = { oh: 'yeah' };
  test('Trigger existing event with data', () => {
    expect(events.trigger('turbo', DATA)).toBe(true)
  })

  test('Trigger existing event without data', () => {
    expect(events.trigger('turbo')).toBe(true)
  })

  test('Trigger unexisting event', () => {
    expect(events.trigger('turbo_diesel', DATA)).toBe(false)
  })

  test('Trigger existing sub-event', () => {
    expect(events.trigger('turbo.diesel', DATA)).toBe(true)
  })

  test('Trigger unexisting sub-event', () => {
    expect(events.trigger('turbo.turbo_diesel.smahjez')).toBe(false)
  })
})

describe('Event system - another look at the "names" and "ordered" getters', () => {
  test('Ensure "names" and "ordered" getters work', () => {
    expect(events.names.length).toBe(6)
    expect(events.ordered.length).toBe(6)
  })
})

describe('Event system - Removing events', () => {
  test('Remove existing event', () => {
    const act = events.off('turbo')
    expect(act).toBe(true)
  })

  test('Remove unexisting event', () => {
    const act = events.off('turbo')
    expect(act).toBe(false)
  })

  test('Remove existing sub-event', () => {
    const act = events.off('turbo.diesel.injection')
    expect(act).toBe(true)
  })

  test('Remove unexisting sub-event', () => {
    const act = events.off('turbo.diesel.injection')
    expect(act).toBe(false)
  })

  test('Remove existing event or existing children', () => {
    const act = events.off('turbo', true)
    expect(act).toBe(true)
    expect(events.names.length).toBe(2)
  })

  test('Remove all existing events', () => {
    // Sanity check
    expect(events.names.length).toBe(2)

    // Actual test
    expect(events.off('*')).toBe(true)
    expect(events.names.length).toBe(0)
  })
})

describe('Event system - verify the flow', () => {
  test('Perform sanity', () => {
    if (events.names.length) events.off('*')
    expect(events.names.length).toBe(0)
  })

  test('Ensure adding, triggering, and removing deep trees work as expected ', () => {
    const CB_MOCK = jest.fn()
    events.one('aaa', CB_MOCK)
    events.on('aaa.bbb', CB_MOCK)
    events.on('aaa.bbb.ccc', CB_MOCK)
    events.on('aaa.bbb.ccc.ddd', CB_MOCK)
    events.one('aaa.bbb.ccc.ddd.eee', CB_MOCK)
    events.on('aaa.bbb.ccc.ddd.eee.fff', CB_MOCK)
    events.on('aaa.bbb.ccc.ddd.eee.fff.ggg', CB_MOCK)
    expect(events.names.length).toBe(7)

    events.trigger('aaa')
    expect(CB_MOCK).toHaveBeenCalled()
    expect(events.names.length).toBe(5)
    events.off('aaa.bbb.ccc.ddd.eee', true) 
    expect(events.names.length).toBe(3)

    events.off('aaa.bbb.ccc', true) 
    expect(events.names.length).toBe(1)

    events.off('aaa.bbb', true) 
    expect(events.names.length).toBe(0)
  })
})

describe('Event system - Finding events', () => {
  test('Perform sanity', () => {
    if (events.names.length) events.off('*')
    expect(events.names.length).toBe(0)
  })

  it('Set initial state', () => {
    const CB_MOCK = jest.fn()
    events.one('aaa', CB_MOCK)
    events.on('aaa.bbb', CB_MOCK)
    events.on('aaa.bbb.ccc', CB_MOCK)
    expect(events.names.length).toBe(3)
  })
  it('get 1 item', () => expect(events.find('aaa.bbb.ccc').length).toBe(1))
  it('get 2 items', () => expect(events.find('aaa.bbb').length).toBe(2))
  it('get 3 items', () => expect(events.find('aaa').length).toBe(3))
  it('get 0 items', () => {
    events.off('*')
    expect(events.find('aaa').length).toBe(0)
  })
})

// TODO: Merge this with the original "triggering" section
// ... but first make sure individual unit tests do not affect each other
describe('Event system - Triggering root events', () => {
  events.off('*')
  test('Trigger root event and verify all children have been called', () => {
    const CB_MOCK_1 = jest.fn()
    const CB_MOCK_2 = jest.fn()
    const CB_MOCK_3 = jest.fn()
    const CB_MOCK_4 = jest.fn()
    events.on('aaa.bbb.ccc.ddd.eee', CB_MOCK_1)
    events.on('aaa.bbb.ccc.ddd', CB_MOCK_2)
    events.on('aaa.bbb.ccc', CB_MOCK_3)
    events.on('aaa.bbb', CB_MOCK_4)
    
    events.trigger('aaa')
    expect(CB_MOCK_1).toHaveBeenCalled()
    expect(CB_MOCK_2).toHaveBeenCalled()
    expect(CB_MOCK_3).toHaveBeenCalled()
    expect(CB_MOCK_4).toHaveBeenCalled()
  })
})
