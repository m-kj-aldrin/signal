import { Signal } from "../src/signal.js";

/**@type {Signal<string>} */
const text_signal = new Signal("");

const text_input = document.createElement("input");
const text_output = document.createElement("output");

document.body.append(text_input, text_output);

Signal.effect(() => {
  text_output.value = text_signal.value;
});

text_input.addEventListener("input", (e) => {
  text_signal.value = text_input.value;
});
