export default {
  js: ['js', 'cjs', 'mjs'],
  jsx: ['jsx', 'cjsx', 'mjsx'],
  ts: ['ts', 'cts', 'mts'],
  tsx: ['tsx', 'ctsx', 'mtsx'],

  css: ['css'],
  scss: ['scss'],

  html: ['html', 'htm'],
  htmlLike: ['astro', 'svelte', 'vue'],

  md: ['md', 'mdown', 'markdown'],
  yaml: ['yaml', 'yml'],
} as const satisfies Record<string, readonly string[]>;
