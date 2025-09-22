import type { ReactElement, ReactNode } from "react";

type Components = Partial<Record<string, unknown>>;

declare function ReactMarkdown(props: {
  children?: ReactNode;
  className?: string;
  components?: Components;
}): ReactElement;

export default ReactMarkdown;
