/**@typedef {(init:boolean)=>void} ContextCallback */

/**
 * @template T
 */
export class Signal {
  static #is_batching = false;

  /**@type {Set<ContextCallback>} */
  static #batch_context = new Set();

  /**@type {ContextCallback} */
  static #current_context = null;

  /**
   * Create an effect that runs every time the value of Signal is set
   * @param {ContextCallback} fn
   */
  static effect(fn) {
    Signal.#current_context = fn;
    fn(true);
    Signal.#current_context = undefined;
  }

  /**
   * Updates to signals inside a batch context signals dependent effects only once if multiple signals shares same effects
   * @param {ContextCallback} fn
   */
  static batch(fn) {
    Signal.#is_batching = true;
    fn(true);
    Signal.#is_batching = false;
    Signal.#batch_context.forEach((context) => context(false));
    Signal.#batch_context.clear();
  }

  #value = null;

  /**@type {Set<ContextCallback>} */
  #context = new Set();

  /** @param {T} init */
  constructor(init) {
    this.#value = init;
  }

  /**
   * Returns the value of the Signal
   */
  get value() {
    if (Signal.#current_context != undefined) {
      this.#context.add(Signal.#current_context);
    }

    return this.#value;
  }

  /**
   * Sets the value of the signal
   * @param {T} v
   */
  set value(v) {
    this.#value = v;

    if (Signal.#is_batching) {
      this.#context.forEach((context) => Signal.#batch_context.add(context));
    } else {
      this.#context.forEach((context) => context(false));
    }
  }

  /**
   * Run all the referenced effects manually
   */
  signal() {
    if (Signal.#is_batching) {
      this.#context.forEach((context) => Signal.#batch_context.add(context));
    } else {
      this.#context.forEach((context) => context(false));
    }
  }

  // TODO - Removes a effect based on id
  clear(id) {}
}
