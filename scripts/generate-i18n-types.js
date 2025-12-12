import fs from 'fs';
import path from 'path';

const root = process.cwd();

// pattern to match translation JSONs
const findJSONs = (dir) => {
	if (!fs.existsSync(dir)) return [];
	return fs.readdirSync(dir)
		.flatMap((f) => {
			const full = path.join(dir, f);
			return fs.statSync(full).isDirectory()
				? findJSONs(full)
				: full.endsWith('.json')
					? full
					: [];
		});
};

const jsonToKeys = (obj, prefix = '') =>
	Object.entries(obj).flatMap(([k, v]) => {
		const key = prefix ? `${prefix}.${k}` : k;
		return v && typeof v === 'object'
			? jsonToKeys(v, key)
			: [key];
	});

// scan all translation files
const translationFiles = [
	...findJSONs(path.join(root, 'src/translations')),
	...findJSONs(path.join(root, 'src/modules')),
];

const nsMap = {};

for (const file of translationFiles) {
	if (!file.endsWith('.json')) continue;

	const parts = path.relative(root, file).split(path.sep);

	// module namespace
	const idx = parts.indexOf('translations') - 1;
	const namespace = idx >= 0 ? parts[idx] : 'global';

	const locale = path.basename(file, '.json');

	const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
	const keys = jsonToKeys(data);

	nsMap[namespace] ||= {};
	nsMap[namespace][locale] ||= new Set();
	keys.forEach(k => nsMap[namespace][locale].add(k));
}

// generate TypeScript
let output = `// AUTO-GENERATED — DO NOT EDIT
import 'react-i18next';

declare module 'react-i18next' {
  interface Resources {
`;

for (const ns of Object.keys(nsMap)) {
	output += `    "${ns}": {\n`;
	// pick union of all locale keys
	const unionKeys = new Set(
		Object.values(nsMap[ns]).flatMap(set => Array.from(set)),
	);

	unionKeys.forEach((key) => {
		output += `      "${key}": string;\n`;
	});

	output += `    };\n`;
}

output += `  }
}
`;

fs.writeFileSync(path.join(root, 'src/i18n-auto.d.ts'), output);
console.log('✅ i18n types generated!');
