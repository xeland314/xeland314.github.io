export function generateUrl(url: string, time: number, baseUrl: string): string {
  if (!url) {
    return "";
  }
  return `${baseUrl}?url=${encodeURIComponent(url)}&t=${time}`;
}
