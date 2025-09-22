import type { PointerEventHandler, RefObject } from "react";

type DragState = {
  event: PointerEvent;
  target: EventTarget | null;
  first: boolean;
  last: boolean;
  active: boolean;
  movement: [number, number];
  offset: [number, number];
  delta: [number, number];
  cancel: () => void;
};

type DragHandler = (state: DragState) => void;

type Target = RefObject<Element | null> | Element | null | (() => Element | null);

type UseDragConfig = {
  target?: Target;
  pointer?: {
    touch?: boolean;
  };
};

type BindProps = {
  onPointerDown?: PointerEventHandler;
};

export declare function useDrag(handler: DragHandler, config?: UseDragConfig): (bindProps?: BindProps) => {
  onPointerDown: PointerEventHandler;
};

declare const _default: {
  useDrag: typeof useDrag;
};

export default _default;
