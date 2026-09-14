/* oxlint-disable vitest/require-hook -- Global extension file. */

import { expect } from 'vite-plus/test';

declare module 'vite-plus/test' {
  // oxlint-disable-next-line typescript/no-explicit-any -- Must match vitest's `Matchers<T = any>` declaration
  interface Matchers<T = any> {
    // TODO
  }
}
expect.extend({
  // TODO
});
