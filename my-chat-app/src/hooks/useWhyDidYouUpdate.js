import { useRef } from "react";

// Deep compare
const isEqual = (a, b) => {
  if (Object.is(a, b)) return true;

  if (
    typeof a === "object" &&
    a !== null &&
    typeof b === "object" &&
    b !== null
  ) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    for (let key of aKeys) {
      if (!isEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
};

export const useWhyRender = (name, props = {}, state = {}) => {
  const prev = useRef({ props, state });

  // 🔥 Detect changes BEFORE DOM updates (this is key)
  const changes = {};

  // --- PROP CHANGES ---
  for (let key in props) {
    if (!isEqual(props[key], prev.current.props[key])) {
      changes[`prop:${key}`] = {
        from: prev.current.props[key],
        to: props[key],
      };
    }
  }

  // deleted props
  for (let key in prev.current.props) {
    if (!(key in props)) {
      changes[`prop:${key}`] = {
        from: prev.current.props[key],
        to: undefined,
      };
    }
  }

  // --- STATE CHANGES ---
  for (let key in state) {
    if (!isEqual(state[key], prev.current.state[key])) {
      changes[`state:${key}`] = {
        from: prev.current.state[key],
        to: state[key],
      };
    }
  }

  // deleted state keys
  for (let key in prev.current.state) {
    if (!(key in state)) {
      changes[`state:${key}`] = {
        from: prev.current.state[key],
        to: undefined,
      };
    }
  }

  // LOG
  if (Object.keys(changes).length === 0) {
    console.log(
      `%c[WHY RENDER] ${name}`,
      "color:#ffcc00;font-weight:bold;",
      "⛔ No prop/state changes — parent re-rendered"
    );
  } else {
    console.log(
      `%c[WHY RENDER] ${name}`,
      "color:#00ffa2;font-weight:bold;",
      changes
    );
  }

  // store latest
  prev.current = { props, state };
};
