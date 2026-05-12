const CODE_BLOCK_CLASS = 'zen-code-block'
export const CODE_COPY_BUTTON_SELECTOR = '.zen-code-copy-button'

const resetTimers = new WeakMap<HTMLButtonElement, number>()

export function enhanceCodeBlockCopy(root: ParentNode): void {
  const blocks = Array.from(root.querySelectorAll<HTMLPreElement>('pre'))

  for (const pre of blocks) {
    if (pre.parentElement?.classList.contains(CODE_BLOCK_CLASS)) continue

    const code = pre.firstElementChild
    if (!(code instanceof HTMLElement) || code.tagName.toLowerCase() !== 'code') {
      continue
    }

    const wrapper = pre.ownerDocument.createElement('div')
    wrapper.className = CODE_BLOCK_CLASS

    const button = pre.ownerDocument.createElement('button')
    button.type = 'button'
    button.className = CODE_COPY_BUTTON_SELECTOR.slice(1)
    button.setAttribute('aria-label', 'Copy code block')
    button.title = 'Copy code block'
    button.textContent = 'Copy'

    pre.replaceWith(wrapper)
    wrapper.append(button, pre)
  }
}

export function getCodeBlockTextForCopyButton(button: Element): string | null {
  const block = button.closest(`.${CODE_BLOCK_CLASS}`)
  const code = block?.querySelector<HTMLElement>('pre > code')
  return code?.textContent ?? null
}

export function copyCodeBlockToClipboard(button: HTMLButtonElement): boolean {
  const text = getCodeBlockTextForCopyButton(button)
  if (text == null) return false

  const copied = writeClipboardText(text)
  setCopyButtonFeedback(button, copied ? 'copied' : 'failed')
  return copied
}

function writeClipboardText(text: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    const bridge = (window as Window & {
      zen?: { clipboardWriteText?: (value: string) => void }
    }).zen
    if (typeof bridge?.clipboardWriteText === 'function') {
      bridge.clipboardWriteText(text)
      return true
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    return false
  }

  return false
}

function setCopyButtonFeedback(
  button: HTMLButtonElement,
  state: 'copied' | 'failed'
): void {
  const previousTimer = resetTimers.get(button)
  if (previousTimer != null) window.clearTimeout(previousTimer)

  const copied = state === 'copied'
  button.dataset.copyState = state
  button.textContent = copied ? 'Copied' : 'Failed'
  button.setAttribute('aria-label', copied ? 'Copied code block' : 'Copy failed')
  button.title = copied ? 'Copied code block' : 'Copy failed'

  const resetTimer = window.setTimeout(() => {
    button.textContent = 'Copy'
    button.setAttribute('aria-label', 'Copy code block')
    button.title = 'Copy code block'
    delete button.dataset.copyState
    resetTimers.delete(button)
  }, 1400)
  resetTimers.set(button, resetTimer)
}
