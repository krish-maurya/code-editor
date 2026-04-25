import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

/* UI Theme (line numbers + fold gutter + editor layout) */
export const syncSpaceTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#0a0f14",
    color: "#e5e7eb",
    fontSize: "13px",
  },

  ".cm-editor": {
    backgroundColor: "#0a0f14",
  },

  ".cm-editor.cm-focused": {
    outline: "none",
  },

  ".cm-scroller": {
    fontFamily: "JetBrains Mono, monospace",
    backgroundColor: "#0a0f14",
  },

  ".cm-content": {
    caretColor: "#34d399",
    padding: "16px 0",
  },

  ".cm-cursor": {
    borderLeft: "2px solid #34d399",
  },

  ".cm-activeLine": {
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  /* Line Number Gutter */
  ".cm-gutters": {
    backgroundColor: "#0a0f14",
    color: "#6b7280",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    minWidth: "60px",
  },

  ".cm-lineNumbers": {
    backgroundColor: "#0a0f14",
  },

  ".cm-gutterElement": {
    padding: "0 14px 0 10px",
    fontSize: "12px",
    lineHeight: "1.625",
    textAlign: "right",
  },

  ".cm-activeLineGutter": {
    backgroundColor: "rgba(255,255,255,0.03)",
    color: "#d1d5db !important",
  },

  /* Fold Gutter */
  ".cm-foldGutter": {
    backgroundColor: "#0a0f14",
    width: "16px",
  },

  ".cm-foldGutter .cm-gutterElement": {
    color: "transparent",
    fontSize: "10px",
    padding: "0 2px",
    lineHeight: "1.625",
    cursor: "pointer",
    transition: "color 0.15s",
  },

  ".cm-foldGutter .cm-gutterElement:hover": {
    color: "#4b5563",
  },

  ".cm-foldPlaceholder": {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "none",
    color: "#9ca3af",
    borderRadius: "4px",
    padding: "0 6px",
    margin: "0 4px",
    fontSize: "11px",
    cursor: "pointer",
  },

  ".cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(52, 211, 153, 0.18) !important",
  },

  ".cm-matchingBracket": {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    outline: "1px solid rgba(52, 211, 153, 0.3)",
    borderRadius: "2px",
  },

  /* Scrollbar */
  ".cm-scroller::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },

  ".cm-scroller::-webkit-scrollbar-track": {
    background: "#0a0f14",
  },

  ".cm-scroller::-webkit-scrollbar-thumb": {
    background: "#1f2937",
    borderRadius: "3px",
  },

  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    background: "#374151",
  },
  /* Autocomplete Popup */

  ".cm-tooltip": {
    backgroundColor: "#111827",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    color: "#e5e7eb",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },

  ".cm-tooltip-autocomplete": {
    backgroundColor: "#111827",
  },

  ".cm-tooltip ul": {
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "13px",
    padding: "6px",
  },

  ".cm-tooltip li": {
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  ".cm-tooltip li[aria-selected]": {
    backgroundColor: "#1f2937",
    color: "#ffffff",
  },

  ".cm-completionLabel": {
    color: "#e5e7eb",
  },

  ".cm-completionDetail": {
    color: "#9ca3af",
  },

  ".cm-completionIcon": {
    color: "#60a5fa",
  },

  ".cm-tooltip-autocomplete ul li:hover": {
    backgroundColor: "#1f2937",
  },
});

/* Syntax Colors */
export const syncSpaceHighlight = syntaxHighlighting(
  HighlightStyle.define([
    /* Keywords → pink */
    {
      tag: tags.keyword,
      color: "#f472b6",
    },

    /* Types / interfaces → cyan */
    {
      tag: [tags.typeName, tags.className],
      color: "#67e8f9",
    },

    /* Strings → orange */
    {
      tag: tags.string,
      color: "#fb923c",
    },

    /* Function names → purple */
    {
      tag: [tags.function(tags.variableName)],
      color: "#c084fc",
    },

    /* Variables → white */
    {
      tag: tags.variableName,
      color: "#e5e7eb",
    },

    /* Properties → blue */
    {
      tag: tags.propertyName,
      color: "#60a5fa",
    },

    /* Comments → gray italic */
    {
      tag: tags.comment,
      color: "#6b7280",
      fontStyle: "italic",
    },

    /* Numbers */
    {
      tag: tags.number,
      color: "#facc15",
    },
  ])
);