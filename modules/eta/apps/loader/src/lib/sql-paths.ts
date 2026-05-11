import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolves to `modules/eta/sql/`, regardless of whether this file runs from
 * `src/lib/` (dev via tsx) or `dist/lib/` (compiled). One level deeper than
 * `src/index.ts`, so one extra `..` vs the old resolution from `src/`.
 */
const SQL_ROOT = path.resolve(moduleDir, '..', '..', '..', '..', 'sql');

/**
 * Returns the absolute path to a pipeline `.sql` file shipped with the eta
 * module. Pass it directly to `queryFromFile()` from `@tmlmobilidade/databases`.
 *
 * @example
 * await queryFromFile(client, pipelinePath('1-transformation.sql'));
 */
export function pipelinePath(name: string): string {
	return path.join(SQL_ROOT, name);
}
