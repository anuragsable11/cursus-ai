/**
 * Shared look for text inputs, textareas and input-like containers: a white
 * field with a hairline ring that darkens on hover and widens on focus.
 * Uses focus-within so it works on a wrapper as well as on the input itself.
 */
export const fieldClasses =
  "rounded-md bg-surface text-sm text-ink shadow-field outline-none transition-shadow duration-150 " +
  "placeholder:text-ink-faint hover:shadow-field-hover focus-within:shadow-field-focus focus-visible:outline-none";
