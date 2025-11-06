/* * */

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { type RollupOptions } from 'rollup';
import { dts } from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import { preserveDirective } from 'rollup-preserve-directives';

import packageJson from '../../package.json';

/* * */

// List of peer dependencies
const external = [
	...Object.keys(packageJson.peerDependencies || {}),
	...Object.keys(packageJson.dependencies || {}),
];

/* * */

export function rollupConfig(options?: { watch?: boolean }): RollupOptions[] {
	const isWatch = options?.watch ?? false;
	
	// In watch mode, only build JS, skip type definitions for faster rebuilds
	if (isWatch) {
		return [
			{
				external,
				input: './index.ts',
				output: [
					{
						dir: 'dist',
						format: 'esm',
						preserveModules: true,
						preserveModulesRoot: '.',
						sourcemap: true,
					},
				],
				plugins: [
					tsConfigPaths(),
					nodeResolve({
						allowExportsFolderMapping: false,
					}),
					preserveDirective(),
					commonjs(),
					typescript({
						exclude: ['**/*.test.tsx', '**/*.test.ts', '**/*.stories.tsx', '**/*.stories.ts', 'scripts/**'],
						tsconfig: './tsconfig.json',
						// Use incremental compilation for faster rebuilds
						incremental: true,
					}),
					postcss({
						autoModules: true,
						extract: 'index.css',
						sourceMap: true,
					}),
				],
			},
		];
	}
	
	return [
		{
			external,
			input: './index.ts',
			output: [
				{
					dir: 'dist',
					format: 'esm',
					preserveModules: true,
					preserveModulesRoot: '.',
					sourcemap: true,
				},
			],
			plugins: [
				tsConfigPaths(),
				nodeResolve({
					allowExportsFolderMapping: false,
				}),
				preserveDirective(),
				commonjs(),
				typescript({
					exclude: ['**/*.test.tsx', '**/*.test.ts', '**/*.stories.tsx', '**/*.stories.ts', 'scripts/**'],
					tsconfig: './tsconfig.json',
					// Use incremental compilation for faster builds
					incremental: true,
				}),
				postcss({
					autoModules: true,
					extract: 'index.css',
					sourceMap: true,
				}),
			],
		},
		{
			external: [/\.css$/],
			input: './index.ts',
			output: [
				{
					file: 'dist/index.d.ts',
					format: 'esm',
				},
			],
			plugins: [
				tsConfigPaths(),
				dts({
					// Use incremental compilation for faster type generation
					compilerOptions: {
						incremental: true,
						tsBuildInfoFile: '.tsbuildinfo',
					},
				}),
			],
		},
	];
}
