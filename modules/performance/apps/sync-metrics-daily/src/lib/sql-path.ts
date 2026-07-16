/* * */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* * */

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function resolveSqlRoot(): string {
	const fromModuleTree = path.resolve(moduleDir, '..', '..', '..', 'sql');
	if (existsSync(fromModuleTree)) {
		return fromModuleTree;
	}

	const fromAppWorkdir = path.resolve(process.cwd(), 'modules', 'performance', 'sql');
	if (existsSync(fromAppWorkdir)) {
		return fromAppWorkdir;
	}

	return fromModuleTree;
}

const SQL_ROOT = resolveSqlRoot();

export function performanceSqlPath(name: string): string {
	return path.join(SQL_ROOT, name);
}
