import { useEffect, useRef, useState } from "react";

export function create(createState) {
  let state;
  const listeners = new Set();

  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (nextState === state) return;
    state = replace ? nextState : { ...state, ...nextState };
    listeners.forEach((listener) => listener(state));
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const api = { setState, getState, subscribe };

  state = createState(setState, getState, api);

  const useStore = (selector = (s) => s, equalityFn = Object.is) => {
    const selectorRef = useRef(selector);
    selectorRef.current = selector;
    const equalityRef = useRef(equalityFn);
    equalityRef.current = equalityFn;
    const [selected, setSelected] = useState(() => selectorRef.current(state));

    useEffect(() => {
      return subscribe((currentState) => {
        const nextSelected = selectorRef.current(currentState);
        setSelected((prev) => (equalityRef.current(prev, nextSelected) ? prev : nextSelected));
      });
    }, []);

    useEffect(() => {
      selectorRef.current = selector;
    }, [selector]);

    useEffect(() => {
      equalityRef.current = equalityFn;
    }, [equalityFn]);

    useEffect(() => {
      const nextSelected = selectorRef.current(state);
      setSelected((prev) => (equalityRef.current(prev, nextSelected) ? prev : nextSelected));
    }, [selector, equalityFn]);

    return selected;
  };

  useStore.setState = setState;
  useStore.getState = getState;
  useStore.subscribe = subscribe;
  useStore.api = api;

  return useStore;
}

const zustand = { create };

export default zustand;
