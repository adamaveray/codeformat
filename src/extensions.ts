export default {
  js: ['js', 'cjs', 'mjs'],
  jsx: ['jsx', 'cjsx', 'mjsx'],
  ts: ['ts', 'cts', 'mts'],
  tsx: ['tsx', 'ctsx', 'mtsx'],

  css: ['css'],
  scss: ['scss'],

  md: ['md', 'mdown', 'markdown'],
} satisfies Record<string, string[]>;
