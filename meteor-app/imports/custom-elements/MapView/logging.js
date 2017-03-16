const NOOP = () => {};

export default (DEBUG) => ({
  log: DEBUG ? ((...args) => console.log(...args)) : NOOP,
  logInfo: DEBUG ? ((...args) => console.info(...args)) : NOOP,
  logWarn: DEBUG ? ((...args) => console.warn(...args)) : NOOP,
  logError: DEBUG ? ((...args) => console.error(...args)) : NOOP
});
