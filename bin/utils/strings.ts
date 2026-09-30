export function parseListString(string: string, separator: string): readonly string[] {
  return string.split(separator).filter((filePath) => filePath !== '');
}
