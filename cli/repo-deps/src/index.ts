import * as fs from 'fs/promises';
import * as path from 'path';

const EXCLUDED_DIRS = new Set([
	'.git',
	'build',
	'coverage',
	'dist',
	'node_modules',
]);

const TEXT_EXTENSIONS = new Set([
	'.cjs',
	'.css',
	'.html',
	'.js',
	'.json',
	'.jsx',
	'.less',
	'.md',
	'.mjs',
	'.scss',
	'.ts',
	'.tsx',
	'.yaml',
	'.yml',
]);

async function findPackageJsonFiles(dir: string): Promise<string[]> {
	const results: string[] = [];

	async function walk(current: string): Promise<void> {
		const entries = await fs.readdir(current, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(current, entry.name);

			if (entry.isDirectory()) {
				if (!EXCLUDED_DIRS.has(entry.name)) {
					await walk(fullPath);
				}
				continue;
			}

			if (entry.isFile() && entry.name === 'package.json') {
				results.push(fullPath);
			}
		}
	}

	await walk(dir);

	return results;
}

async function findDependencyUsage(
	directory: string,
	dependency: string,
	packageJsonPath: string,
): Promise<boolean> {
	async function walk(current: string): Promise<boolean> {
		const entries = await fs.readdir(current, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(current, entry.name);

			if (entry.isDirectory()) {
				if (EXCLUDED_DIRS.has(entry.name)) {
					continue;
				}

				if (await walk(fullPath)) {
					return true;
				}

				continue;
			}

			if (fullPath === packageJsonPath) {
				continue;
			}

			if (!TEXT_EXTENSIONS.has(path.extname(fullPath))) {
				continue;
			}

			try {
				const contents = await fs.readFile(fullPath, 'utf8');

				if (contents.includes(dependency)) {
					return true;
				}
			} catch {
				// Ignore unreadable files
			}
		}

		return false;
	}

	return walk(directory);
}

(async function detectUnusedDependencies() {
	const rootDirectory = process.cwd();
	console.log(`Detecting unused dependencies in ${rootDirectory}`);
	const packageJsonFiles = await findPackageJsonFiles(rootDirectory);
	for (const packageJsonPath of packageJsonFiles) {
		try {
			const contents = await fs.readFile(packageJsonPath, 'utf8');
			const pkg = JSON.parse(contents);

			const dependencies = Object.keys(pkg.dependencies ?? {});
			if (dependencies.length === 0) {
				continue;
			}

			const packageDirectory = path.dirname(packageJsonPath);
			const unused: string[] = [];

			for (const dependency of dependencies) {
				const found = await findDependencyUsage(
					packageDirectory,
					dependency,
					packageJsonPath,
				);

				if (!found) {
					unused.push(dependency);
				}
			}

			if (unused.length > 0) {
				console.log(`\n${packageJsonPath}`);
				console.log(`Unused dependencies:`);
				unused.forEach(dep => console.log(`  - ${dep}`));
			}
		} catch (err) {
			console.error(`Failed to process ${packageJsonPath}`, err);
		}
	}
})();
