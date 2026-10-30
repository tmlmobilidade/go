import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			'@': path.join(packageRoot, 'src'),
		},
	},
	test: {
		coverage: {
			exclude: [
				'node_modules/',
				'dist/',
				'**/*.test.ts',
				'**/*.spec.ts',
				'**/scripts/**',
			],
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
		},
		environment: 'node',
		exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
		globals: true,
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		testTimeout: 60000,
	},
});
