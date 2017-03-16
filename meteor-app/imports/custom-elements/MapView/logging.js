const NOOP = () => {};

export default (module, DEBUG) => ({
  log: DEBUG ? ((...args) => console.log(module, ...args)) : NOOP,
  logInfo: DEBUG ? ((...args) => console.info(module, ...args)) : NOOP,
  logWarn: DEBUG ? ((...args) => console.warn(module, ...args)) : NOOP,
  logError: DEBUG ? ((...args) => console.error(module, ...args)) : NOOP
});
