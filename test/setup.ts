/// <reference types="node" />
import "@testing-library/jest-dom";

// @headlessui/react's Transition emits setTimeout(NaN) under jsdom (the
// computed-style transition duration is NaN), which Node surfaces as
// TimeoutNaNWarning. The behaviour is harmless in tests, so silence just that
// warning while keeping every other one visible.
process.removeAllListeners("warning");
process.on("warning", (warning) => {
  if (warning.name === "TimeoutNaNWarning") return;
  console.warn(warning);
});

// @headlessui/react's Listbox and Grain's Select schedule state updates
// (transitions, floating-ui repositioning) on later ticks, after userEvent's
// act() boundary has already closed. React 19 emits an act(...) warning via
// console.error for each one. Filter just those warnings — anything else
// (legit errors, prop-types, etc.) still surfaces.
const originalError = console.error;
const THIRD_PARTY_NOISE = [
  // @headlessui/react Listbox + Grain Select schedule state updates on later
  // ticks; userEvent's act() boundary has already closed by then.
  /not wrapped in act\(\.\.\.\)/,
  // headless-ui still reads element.ref to forward refs the React-18 way;
  // React 19 emits this deprecation notice for every render.
  /Accessing element\.ref was removed in React 19/,
];
console.error = (...args: unknown[]) => {
  const first = args[0];
  if (
    typeof first === "string" &&
    THIRD_PARTY_NOISE.some((pattern) => pattern.test(first))
  ) {
    return;
  }
  originalError(...args);
};
