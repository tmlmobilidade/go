import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ESLint } from 'eslint';

/* * */

const baselineUrl = new URL('../tests/accessibility/eslint-baseline.json', import.meta.url);
const baseline = JSON.parse(await readFile(baselineUrl, 'utf8'));
const eslint = new ESLint();
const results = await eslint.lintFiles(['src/**/*.{jsx,tsx}']);
const violationCounts = new Map();

for (const result of results) {
	const file = path.relative(process.cwd(), result.filePath);

	for (const message of result.messages) {
		if (!message.ruleId?.startsWith('jsx-a11y/')) continue;

		const key = `${file}|${message.ruleId}`;
		violationCounts.set(key, (violationCounts.get(key) ?? 0) + 1);
	}
}

const actualEntries = [...violationCounts.entries()]
	.map(([key, count]) => {
		const [file, rule] = key.split('|');
		return { count, file, rule };
	})
	.sort((first, second) => `${first.file}|${first.rule}`.localeCompare(`${second.file}|${second.rule}`));

const expectedEntries = [...baseline.entries]
	.map(entry => ({ count: entry.count, file: entry.file, rule: entry.rule }))
	.sort((first, second) => `${first.file}|${first.rule}`.localeCompare(`${second.file}|${second.rule}`));

if (JSON.stringify(actualEntries) === JSON.stringify(expectedEntries)) {
	console.log(`Accessibility lint baseline matched ${actualEntries.reduce((total, entry) => total + entry.count, 0)} known violations.`);
	process.exit(0);
}

console.error('Accessibility lint baseline changed. Fix new violations and remove resolved baseline entries.');
console.error(JSON.stringify({ actual: actualEntries, expected: expectedEntries }, null, 2));
process.exit(1);
