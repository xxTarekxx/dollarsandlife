"use client";

import React, { forwardRef, useLayoutEffect, useRef } from "react";

export type AutosizeTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> & {
  /** Minimum height in approximate lines (used before first paint). */
  minRows?: number;
};

function mergeRefs<T>(...refs: Array<React.Ref<T> | null | undefined>) {
  return (node: T | null) => {
    refs.forEach((r) => {
      if (typeof r === "function") (r as (n: T | null) => void)(node);
      else if (r && typeof r === "object" && "current" in r) (r as React.MutableRefObject<T | null>).current = node;
    });
  };
}

function measureHeight(el: HTMLTextAreaElement, minRows: number) {
  const cs = getComputedStyle(el);
  const lhRaw = parseFloat(cs.lineHeight);
  const fontSize = parseFloat(cs.fontSize) || 16;
  const lineHeight = Number.isFinite(lhRaw) && lhRaw > 0 ? lhRaw : fontSize * 1.35;
  const pad =
    (parseFloat(cs.paddingTop) || 0) +
    (parseFloat(cs.paddingBottom) || 0) +
    (parseFloat(cs.borderTopWidth) || 0) +
    (parseFloat(cs.borderBottomWidth) || 0);
  const minH = Math.max(minRows, 1) * lineHeight + pad;
  el.style.height = "auto";
  const h = Math.max(minH, el.scrollHeight);
  el.style.height = `${h}px`;
}

const AutosizeTextarea = forwardRef<HTMLTextAreaElement, AutosizeTextareaProps>(function AutosizeTextarea(
  { minRows = 2, style, onChange, value, className, ...rest },
  ref
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    measureHeight(el, minRows);
  }, [value, minRows]);

  return (
    <textarea
      ref={mergeRefs(innerRef, ref)}
      value={value}
      rows={1}
      className={className}
      onChange={(e) => {
        onChange?.(e);
        measureHeight(e.currentTarget, minRows);
      }}
      style={{
        overflow: "hidden",
        resize: "none",
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    />
  );
});

export default AutosizeTextarea;
