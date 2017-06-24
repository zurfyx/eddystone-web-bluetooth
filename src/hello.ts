/**
 * Gretter function.
 * @param name Your name.
 * @param exclamationMark Set to true to display a ! at the end of the sentence. Otherwise a . will
 * be shown instead.
 */
export function hello(name: string, exclamationMark = true) {
  return `Hello ${name}${exclamationMark ? '!' : '.'}`;
}
