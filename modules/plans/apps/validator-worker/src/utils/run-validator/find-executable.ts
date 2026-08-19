import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Recursively searches for an executable/file by name
 * inside the given directory and all its child directories.
 *
 * @returns Full path to the executable, or null if not found.
 */
export function findExecutable(rootPath: string, executableName: string): null | string {
	const entries = readdirSync(rootPath, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = join(rootPath, entry.name);

		if (entry.isFile() && entry.name === executableName) {
			return fullPath;
		}

		if (entry.isDirectory()) {
			// Return immediately once found to avoid traversing the rest of a large
			// pruned monorepo or development checkout.
			const result = findExecutable(fullPath, executableName);

			if (result) {
				return result;
			}
		}
	}

	return null;
}
