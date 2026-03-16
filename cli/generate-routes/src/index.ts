import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

const PROJECT_ROOT = path.resolve(path.dirname('../../'), '..');
const MODULES_DIR = path.join(PROJECT_ROOT, 'modules');
const OUTPUT_FILE = process.argv[2] ?? path.join(PROJECT_ROOT, 'packages/consts/src/app-routes.ts');

/* -------------------------------------------------------
   Utilities
------------------------------------------------------- */

const toSnakeCase = (str: string) =>
	str.replace(/-/g, '_').toUpperCase();

const toPascalCase = (str: string) =>
	str.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());

const sanitizeRouteName = (str: string) =>
	str
		.replace(/\([^)]+\)/g, '')
		.replace(/[./]/g, '_')
		.replace(/-/g, '_')
		.replace(/__+/g, '_')
		.replace(/^_/, '')
		.replace(/_$/, '');

/* -------------------------------------------------------
   File scanning helpers
------------------------------------------------------- */

async function* walk(dir: string): AsyncGenerator<string> {
	const entries = await fs.promises.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* walk(full);
		} else {
			yield full;
		}
	}
}

async function findFiles(dir: string, filename: string) {
	const out: string[] = [];
	for await (const file of walk(dir)) {
		if (file.endsWith(filename)) out.push(file);
	}
	return out;
}

/* -------------------------------------------------------
   Frontend route extraction
------------------------------------------------------- */

async function scanFrontendRoutes(moduleName: string, frontendDir: string) {
	const appDir = path.join(frontendDir, 'src/app');
	if (!fs.existsSync(appDir)) return [];

	const pages = await findFiles(appDir, 'page.tsx');
	const routes: string[] = [];

	for (const page of pages) {
		const relative = path.relative(appDir, page);
		let dirPath = path.dirname(relative);

		if (dirPath === '.') continue;

		// Remove Next.js route groups: (example)/ → ""
		dirPath = dirPath.replace(/\([^)]+\)\//g, '').replace(/\/\([^)]+\)/g, '');

		const isDetail = dirPath.includes('[id]');

		if (isDetail) {
			let base = dirPath.replace(/\/?\[id\].*$/, '');
			base = base.replace(/\([^)]+\)\//g, '').replace(/\/\([^)]+\)/g, '');

			base = base.replace(new RegExp(`^${moduleName}/?`), '');
			if (base === moduleName) base = '';

			const name = sanitizeRouteName(
				toSnakeCase((base || moduleName) + '_DETAIL'),
			);
			const pathRoute = base ? `/${base}/\${id}` : '/${id}';

			routes.push(`${name}:${pathRoute}`);
		} else {
			let base = dirPath
				.replace(/\([^)]+\)\//g, '')
				.replace(/\/\([^)]+\)/g, '')
				.replace(new RegExp(`^${moduleName}/?`), '');

			if (base === moduleName) base = '';

			const name = sanitizeRouteName(
				toSnakeCase((base || moduleName) + '_LIST'),
			);
			const pathRoute = base ? `/${base}` : '/';

			routes.push(`${name}:${pathRoute}`);
		}
	}

	return [...new Set(routes)];
}

/* -------------------------------------------------------
   API route extraction
------------------------------------------------------- */

async function scanApiRoutes(moduleName: string, endpointsDir: string) {
	if (!fs.existsSync(endpointsDir)) return [];

	const routesFiles = await findFiles(endpointsDir, '.routes.ts');
	const routes: string[] = [];

	for (const file of routesFiles) {
		const content = await readFile(file, 'utf8');

		// Extract namespace
		let namespace = content.match(/(namespace|NAMESPACE)\s*=\s*['"]([^'"]+)['"]/)?.[2] ?? path.basename(path.dirname(file));

		namespace = namespace.replace(/^\/+/, '');

		// Find instance.get/post/put/delete("...") calls
		const callRegex
			= /instance\.(get|post|put|delete)\s*\(\s*(['"])(.*?)\2/g;

		let m;
		const foundPaths: string[] = [];

		while ((m = callRegex.exec(content))) {
			foundPaths.push(m[3]);
		}

		for (const rawPath of foundPaths) {
			const clean = rawPath.replace(/^\/+/, '');

			const namespaceForPath = namespace.replace(
				/:([a-zA-Z0-9]+)/g,
				(_, v) => `\${${v}}`,
			);

			const cleanForRoute = clean.replace(
				/:([a-zA-Z0-9]+)/g,
				(_, v) => `\${${v}}`,
			);

			const final = !clean || clean === '/' ? `/${namespaceForPath}` : `/${namespaceForPath}/${cleanForRoute}`;

			const fullRoute = `/${moduleName}/api${final}`;

			const variables = [...fullRoute.matchAll(/:([a-zA-Z0-9]+)/g)].map(
				x => x[0],
			);

			const namespaceParts = namespace
				.split('/')
				.filter(p => !p.startsWith(':'));

			const last = namespaceParts.at(-1) ?? path.basename(file);

			const isDetail = clean.startsWith(':');
			let name;

			if (!clean || clean === '/') {
				name = toSnakeCase(last + (variables.length ? '_DETAIL' : '_LIST'));
			} else if (isDetail) {
				const suffix = clean.replace(/^:[^/]+\/?/, '').replace(/\//g, '_');
				name = toSnakeCase(
					suffix ? `${last}_DETAIL_${suffix}` : `${last}_DETAIL`,
				);
			} else {
				name = toSnakeCase(`${last}_${clean.replace(/\//g, '_')}`);
			}

			const routeName = sanitizeRouteName(name);

			const fileName = path.basename(file).replace(/\.routes\.ts$/, '');
			const varsJoined = variables.join(' ');

			routes.push(`${routeName}:${fullRoute}|${fileName}|${varsJoined}`);
		}
	}

	return [...new Set(routes)];
}

/* -------------------------------------------------------
   Generate final output
------------------------------------------------------- */

async function main() {
	const moduleDirs = fs
		.readdirSync(MODULES_DIR, { withFileTypes: true })
		.filter(d => d.isDirectory());

	const collected: {
		module: string
		route: string
		type: 'api' | 'frontend'
	}[] = [];

	for (const dir of moduleDirs) {
		const moduleName = dir.name;
		const modulePath = path.join(MODULES_DIR, moduleName);
		const frontend = path.join(modulePath, 'apps/frontend');
		const api = path.join(modulePath, 'apps/api/src/endpoints');

		if (fs.existsSync(frontend)) {
			const f = await scanFrontendRoutes(moduleName, frontend);
			f.forEach(r =>
				collected.push({ module: moduleName, route: r, type: 'frontend' }),
			);
		}

		if (fs.existsSync(api)) {
			const a = await scanApiRoutes(moduleName, api);
			a.forEach(r =>
				collected.push({ module: moduleName, route: r, type: 'api' }),
			);
		}
	}

	const out: string[] = [];

	out.push(`/**
 * Auto-generated.
 * Do not edit manually.
 */
import { getAppConfig } from './app-configs.js';

export const PAGE_ROUTES = Object.freeze({`);

	/* FRONTEND ROUTES */
	const modules = [...new Set(collected.map(c => c.module))];

	const emit = (type: 'api' | 'frontend') => {
		for (const moduleName of modules) {
			const entries = collected.filter(
				c => c.module === moduleName && c.type === type,
			);
			if (entries.length === 0) continue;

			out.push(`  /* ${moduleName.toUpperCase()} */`);
			out.push(`  ${moduleName}: {`);
			out.push(`    BASE: \`${type === 'api' ? `\${getAppConfig('${moduleName}', 'api_url')}` : `\${getAppConfig('${moduleName}', 'frontend_url')}`}\`,`);

			for (const e of entries) {
				const [name, rest] = e.route.split(':');
				const [routePath, file, vars] = rest.split('|');

				if (type === 'frontend') {
					if (routePath.includes('${id}')) {
						const clean = routePath.replace(/^\//, '');
						out.push(
							`    ${name}: (id: string) => \`\${getAppConfig('${moduleName}', 'frontend_url')}/${clean}\`,`,
						);
					} else {
						const clean = routePath.replace(/^\//, '');
						if (!clean) {
							out.push(
								`    ${name}: \`\${getAppConfig('${moduleName}', 'frontend_url')}\`,`,
							);
						} else {
							out.push(
								`    ${name}: \`\${getAppConfig('${moduleName}', 'frontend_url')}/${clean}\`,`,
							);
						}
					}
				} else {
					const trimmed = routePath.replace(
						new RegExp(`^/${moduleName}/api/?`),
						'',
					);

					if (vars?.trim().length) {
						const params = vars
							.trim()
							.split(/\s+/)
							.map(v => `${v.slice(1)}: string`)
							.join(', ');
						out.push(
							`    ${name}: (${params}) => \`\${getAppConfig('${moduleName}', 'api_url')}/${trimmed}\`,`,
						);
					} else {
						out.push(
							`    ${name}: \`\${getAppConfig('${moduleName}', 'api_url')}/${trimmed}\`,`,
						);
					}
				}
			}

			out.push(`  },`);
		}
	};

	emit('frontend');
	out.push(`});`);
	out.push(``);
	out.push(`export const API_ROUTES = Object.freeze({`);
	emit('api');
	out.push(`});`);

	fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
	fs.writeFileSync(OUTPUT_FILE, out.join('\n'));

	console.log(`Generated routes at ${OUTPUT_FILE}`);
}

await main();
