const events = require('../index');

const CB = () => {};

// Adding events
test('Add simple valid event', () => {
  const act = events.on('turbo', CB);
  expect(act).toBe(true);
});

test('Add the another event with the same name', () => {
  const act = events.on('turbo', CB);
  expect(act).toBe(false);
});

test('Add branch to existing event', () => {
  const act = events.on('turbo.diesel', CB);
  expect(act).toBe(true);
});

test('Adding already existing branch to existing event root', () => {
  const act = events.on('turbo.diesel', CB);
  expect(act).toBe(false);
});

test('Adding a branch to unexisting event root', () => {
  const act = events.on('dragon.diesel', CB);
  expect(act).toBe(true);
});

test('Adding a sub-branch to unexisting event root', () => {
  const act = events.on('turbo.butters.diesel.injection', CB);
  expect(act).toBe(true);
});

test('Adding a sub-branch to existing event root', () => {
  const act = events.on('turbo.diesel.injection', CB);
  expect(act).toBe(true);
});

// ### Using insufficient arguments
test('Add event without arguments', () => {
  expect(events.on()).toBe(false);
});

test('Add event without name', () => {
  expect(events.on(CB)).toBe(false);
});

test('Add event without callback', () => {
  expect(events.on('CB_is_a_valid_name')).toBe(false);
});

test('Add event with special characters', () => {
  expect(events.on('!@{Pdoroti_e_gotina', CB)).toBe(false);
});

// Replacing events
test('Add another simple valid event', () => {
  const act = events.on('cheetah', CB);
  expect(act).toBe(true);
});

test('Replace existing event', () => {
  const act = events.replace('cheetah', CB);
  expect(act).toBe(true);
});

test('Replace unexisting event', () => {
  const act = events.replace('cheetah3000', CB);
  expect(act).toBe(false);
});

test('Replace existing sub-event', () => {
  const act = events.replace('turbo.diesel', CB);
  expect(act).toBe(true);
});

test('Replace unexisting sub-event', () => {
  const act = events.replace('turbo.diesel5000', CB);
  expect(act).toBe(false);
});

// Triggering events
const DATA = {oh: 'yeah'};
test('Trigger existing event with data', () => {
  expect(events.trigger('turbo', DATA)).toBe(true);
});

test('Trigger existing event without data', () => {
  expect(events.trigger('turbo')).toBe(true);
});

test('Trigger unexisting event', () => {
  expect(events.trigger('turbo_diesel', DATA)).toBe(false);
});

test('Trigger existing sub-event', () => {
  expect(events.trigger('turbo.diesel', DATA)).toBe(true);
});

test('Trigger unexisting sub-event', () => {
  expect(events.trigger('turbo.turbo_diesel.smahjez')).toBe(false);
});

// Removing events
test('Remove existing event', () => {
  const act = events.off('turbo');
  expect(act).toBe(true);
});

test('Remove unexisting event', () => {
  const act = events.off('turbo');
  expect(act).toBe(false);
});

test('Remove existing sub-event', () => {
  const act = events.off('turbo.diesel.injection');
  expect(act).toBe(true);
});

test('Remove unexisting sub-event', () => {
  const act = events.off('turbo.diesel.injection');
  expect(act).toBe(false);
});

test('Remove existing event or existing children', () => {
  const act = events.off('turbo', true);
  expect(act).toBe(true);
});

test('Remove all existing events', () => {
  expect(events.empty('*')).toBe(true);
});
