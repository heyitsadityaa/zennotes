import type { OutlineItem } from './outline'

const RENDERED_HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6'

export function findOutlineHeadingIndex(
  items: readonly OutlineItem[],
  line: number
): number {
  return items.findIndex((item) => item.line === line)
}

export function findRenderedHeadingForOutlineLine(
  previewRoot: ParentNode,
  items: readonly OutlineItem[],
  line: number
): HTMLElement | null {
  const outlineIndex = findOutlineHeadingIndex(items, line)
  if (outlineIndex < 0) return null
  const headings = previewRoot.querySelectorAll<HTMLElement>(RENDERED_HEADING_SELECTOR)
  return headings[outlineIndex] ?? null
}

export function previewScrollTopForHeading(
  previewScrollEl: HTMLElement,
  heading: HTMLElement,
  topMargin: number
): number {
  const containerRect = previewScrollEl.getBoundingClientRect()
  const headingRect = heading.getBoundingClientRect()
  const maxTop = Math.max(0, previewScrollEl.scrollHeight - previewScrollEl.clientHeight)
  const nextTop = previewScrollEl.scrollTop + headingRect.top - containerRect.top - topMargin
  return Math.max(0, Math.min(maxTop, nextTop))
}
