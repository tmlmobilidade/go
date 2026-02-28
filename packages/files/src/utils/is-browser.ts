/* * */

declare const window: typeof globalThis;
export const isBrowser = typeof window?.document !== 'undefined';
