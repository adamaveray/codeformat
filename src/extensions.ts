export default {
  js: ['js', 'jsx', 'cjs', 'cjsx', 'mjs', 'mjsx'],
  jsx: ['jsx', 'cjsx', 'mjsx'],
  ts: ['ts', 'tsx', 'cts', 'ctsx', 'mts', 'mtsx'],
  tsx: ['tsx', 'ctsx', 'mtsx'],

  css: ['css'],
  scss: ['scss'],

  md: ['md', 'mdown', 'markdown'],
} satisfies Record<string, string[]>;
