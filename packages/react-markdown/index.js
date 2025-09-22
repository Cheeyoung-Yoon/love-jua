import React, { useMemo } from "react";

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const nodes = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      nodes.push({ type: "paragraph", content: paragraph.join(" ") });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      nodes.push({ type: "list", ordered: false, items: list });
      list = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^#{1,6}\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      const depth = trimmed.match(/^#+/)[0].length;
      const content = trimmed.replace(/^#{1,6}\s+/, "").trim();
      nodes.push({ type: "heading", depth, content });
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed)) {
      flushParagraph();
      if (!list) list = [];
      list.push(trimmed.replace(/^[-*+]\s+/, ""));
      continue;
    }
    if (/^>\s*/.test(trimmed)) {
      flushParagraph();
      flushList();
      nodes.push({ type: "blockquote", content: trimmed.replace(/^>\s*/, "") });
      continue;
    }
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return nodes;
}

function parseInline(text) {
  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith("**")) {
      tokens.push({ type: "strong", content: token.slice(2, -2) });
    } else if (token.startsWith("_")) {
      tokens.push({ type: "em", content: token.slice(1, -1) });
    } else if (token.startsWith("`")) {
      tokens.push({ type: "code", content: token.slice(1, -1) });
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) });
  }
  return tokens;
}

function renderInline(tokens, keyPrefix, components) {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (token.type === "text") return token.content;
    const Comp = components?.[token.type === "strong" ? "strong" : token.type === "em" ? "em" : "code"] ??
      (token.type === "strong" ? "strong" : token.type === "em" ? "em" : "code");
    return React.createElement(Comp, { key }, token.content);
  });
}

function renderNode(node, index, components) {
  const key = `md-${index}`;
  if (node.type === "heading") {
    const tag = `h${Math.min(6, node.depth)}`;
    const Comp = components?.[tag] ?? tag;
    return React.createElement(Comp, { key }, renderInline(parseInline(node.content), `${key}-inline`, components));
  }
  if (node.type === "paragraph") {
    const Comp = components?.p ?? "p";
    return React.createElement(Comp, { key }, renderInline(parseInline(node.content), `${key}-inline`, components));
  }
  if (node.type === "list") {
    const Comp = components?.ul ?? "ul";
    const Item = components?.li ?? "li";
    return React.createElement(
      Comp,
      { key },
      node.items.map((item, itemIndex) =>
        React.createElement(Item, { key: `${key}-item-${itemIndex}` }, renderInline(parseInline(item), `${key}-item-${itemIndex}`, components))
      )
    );
  }
  if (node.type === "blockquote") {
    const Comp = components?.blockquote ?? "blockquote";
    return React.createElement(Comp, { key }, renderInline(parseInline(node.content), `${key}-inline`, components));
  }
  return null;
}

const ReactMarkdown = ({ children, className, components }) => {
  const markdown = useMemo(() => {
    if (Array.isArray(children)) {
      return children.join("");
    }
    return typeof children === "string" ? children : "";
  }, [children]);

  const nodes = useMemo(() => parseMarkdown(markdown), [markdown]);

  return React.createElement(
    "div",
    { className },
    nodes.map((node, index) => renderNode(node, index, components))
  );
};

export default ReactMarkdown;
