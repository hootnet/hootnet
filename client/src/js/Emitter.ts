import _ from 'lodash';

class Emitter {
  events: { [name: string]: [any?] }
  constructor() {
    this.events = {};
  }

  emit(event: string, ...args: any) {
    if (this.events[event]) {
      this.events[event].forEach((fn) => fn(...args));
    }
    return this;
  }

  on(event, fn) {
    if (this.events[event]) this.events[event].push(fn);
    else this.events[event] = [fn];
    return this;
  }

  off(event: string, fn) {
    if (event && _.isFunction(fn)) {
      const listeners = this.events[event];
      const index = listeners.findIndex((_fn) => _fn === fn);
      listeners.splice(index, 1);
    } else this.events[event] = [fn];
    return this;
  }
}
export default Emitter
