export type StateCreator<T> = (
  setState: (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void,
  getState: () => T,
  api: {
    setState: (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
    getState: () => T;
    subscribe: (listener: (state: T) => void) => () => void;
  }
) => T;

declare function create<T>(creator: StateCreator<T>): {
  (): T;
  <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
  getState: () => T;
  subscribe: (listener: (state: T) => void) => () => void;
};

declare const zustand: {
  create: typeof create;
};

export { create };
export default zustand;
