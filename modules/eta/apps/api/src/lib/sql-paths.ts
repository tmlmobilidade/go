import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const SQL_ROOT = path.resolve(moduleDir, '..', '..', '..', '..', 'sql');

export function pipelinePath(name: string): string {
	return path.join(SQL_ROOT, name);
}
