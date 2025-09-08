export default {
  js: ['js', 'jsx', 'cjs', 'cjsx', 'mjs', 'mjsx'],
  jsx: ['jsx', 'cjsx', 'mjsx'],
  ts: ['ts', 'tsx', 'cts', 'ctsx', 'mts', 'mtsx'],
  tsx: ['tsx', 'ctsx', 'mtsx'],

  css: ['css'],
  scss: ['scss'],
} satisfies Record<string, string[]>;
