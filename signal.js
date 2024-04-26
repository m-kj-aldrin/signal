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

  /**@param {ContextCallback} fn */
  static effect(fn) {
    Signal.#current_context = fn;
    fn(true);
    Signal.#current_context = undefined;
  }

  /**@param {ContextCallback} fn */
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

  get value() {
    if (Signal.#current_context != undefined) {
      this.#context.add(Signal.#current_context);
    }

    return this.#value;
  }

  /** @param {T} v */
  set value(v) {
    this.#value = v;

    if (Signal.#is_batching) {
      this.#context.forEach((context) => Signal.#batch_context.add(context));
    } else {
      this.#context.forEach((context) => context(false));
    }
  }
}
