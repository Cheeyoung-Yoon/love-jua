import { useCallback, useEffect, useRef } from "react";

function resolveTarget(target) {
  if (!target) return null;
  if (typeof target === "function") {
    return target();
  }
  if (Object.prototype.hasOwnProperty.call(target, "current")) {
    return target.current;
  }
  return target;
}

export function useDrag(handler, config = {}) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const stateRef = useRef({
    active: false,
    movement: [0, 0],
    offset: [0, 0],
    lastEvent: null,
    pointerId: null,
  });

  const cleanup = useCallback(() => {
    const state = stateRef.current;
    if (!state.active) return;
    if (state.boundMove) {
      window.removeEventListener("pointermove", state.boundMove);
      state.boundMove = null;
    }
    if (state.boundUp) {
      window.removeEventListener("pointerup", state.boundUp);
      window.removeEventListener("pointercancel", state.boundUp);
      state.boundUp = null;
    }
    state.active = false;
    state.pointerId = null;
  }, []);

  const createHandlerState = useCallback(
    (event, overrides = {}) => {
      const state = stateRef.current;
      return {
        event,
        target: event.currentTarget || state.node || null,
        first: overrides.first ?? false,
        last: overrides.last ?? false,
        active: overrides.active ?? state.active,
        movement: state.movement.slice(),
        offset: state.offset.slice(),
        delta: overrides.delta || [0, 0],
        cancel: cleanup,
      };
    },
    [cleanup]
  );

  const startDrag = useCallback(
    (nativeEvent) => {
      if (nativeEvent.button !== undefined && nativeEvent.button !== 0) return;
      const state = stateRef.current;
      if (state.active) return;
      state.pointerId = nativeEvent.pointerId ?? null;
      state.active = true;
      state.lastEvent = nativeEvent;
      state.node = nativeEvent.currentTarget || nativeEvent.target;
      state.movement = [0, 0];
      state.offset = [0, 0];

      const moveHandler = (evt) => {
        if (state.pointerId != null && evt.pointerId !== state.pointerId) return;
        const dx = evt.movementX ?? evt.pageX - (state.lastEvent?.pageX ?? evt.pageX);
        const dy = evt.movementY ?? evt.pageY - (state.lastEvent?.pageY ?? evt.pageY);
        state.offset = [state.offset[0] + dx, state.offset[1] + dy];
        state.movement = [state.movement[0] + dx, state.movement[1] + dy];
        state.lastEvent = evt;
        handlerRef.current?.(
          createHandlerState(evt, {
            first: false,
            active: true,
            delta: [dx, dy],
          })
        );
      };

      const upHandler = (evt) => {
        if (state.pointerId != null && evt.pointerId !== state.pointerId) return;
        handlerRef.current?.(
          createHandlerState(evt, {
            first: false,
            last: true,
            active: false,
            delta: [0, 0],
          })
        );
        cleanup();
      };

      state.boundMove = moveHandler;
      state.boundUp = upHandler;
      window.addEventListener("pointermove", moveHandler, { passive: false });
      window.addEventListener("pointerup", upHandler, { passive: false });
      window.addEventListener("pointercancel", upHandler, { passive: false });

      handlerRef.current?.(
        createHandlerState(nativeEvent, {
          first: true,
          active: true,
          delta: [0, 0],
        })
      );
    },
    [cleanup, createHandlerState]
  );

  useEffect(() => cleanup, [cleanup]);

  useEffect(() => {
    const node = resolveTarget(config.target);
    if (!node) return undefined;
    const down = (event) => {
      event.preventDefault();
      startDrag(event);
    };
    node.addEventListener("pointerdown", down, { passive: false });
    return () => {
      node.removeEventListener("pointerdown", down);
    };
  }, [config.target, startDrag]);

  return useCallback(
    (bindProps = {}) => ({
      onPointerDown: (event) => {
        bindProps.onPointerDown?.(event);
        event.preventDefault();
        startDrag(event.nativeEvent || event);
      },
    }),
    [startDrag]
  );
}

const gesture = {
  useDrag,
};

export default gesture;
