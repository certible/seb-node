/**
 * Utility function, removes the fragment (part after #) from a URL
 */
export function removeURLFragment(url: string): string {
  return url.split('#')[0];
}
