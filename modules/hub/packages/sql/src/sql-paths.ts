import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolves to `modules/hub/sql/`.
 *
 * - Dev / monorepo build: this file lives under `.../packages/clickhouse/{src|dist}/`, so two
 *   `..` segments reach `modules/hub/`, then `sql/`.
 * - Docker runner (`nodejs.dockerfile`): only `dist/` is copied to `/app/dist/`, so two `..`
 *   from `/app/dist` escape to `/sql` (wrong). There, SQL is under `/app/modules/hub/sql`.
 */
function resolveSqlRoot(): string {
	const fromModuleTree = path.resolve(moduleDir, '..', '..', '..', 'sql');
	if (existsSync(fromModuleTree)) {
		return fromModuleTree;
	}
	const fromAppWorkdir = path.resolve(process.cwd(), 'modules', 'hub', 'sql');
	if (existsSync(fromAppWorkdir)) {
		return fromAppWorkdir;
	}
	return fromModuleTree;
}

const SQL_ROOT = resolveSqlRoot();

/**
 * Returns the absolute path to a pipeline `.sql` file shipped with the hub module.
 * Pass it directly to `querySQLFromFile()`.
 *
 * @example
 * await querySQLFromFile(client, pipelinePath('loader/2-build_hist_node_travel_times.sql'));
 */
export function pipelinePath(name: string): string {
	return path.join(SQL_ROOT, name);
}
