import type { Node } from "./types";

export function sortNodesByPosition<NodeValue extends Node<any>>(
  a: NodeValue,
  b: NodeValue
) {
  return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
}
