import { IntlMessageFormat } from 'intl-messageformat';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import en from '../src/locales/en.json' with { type: 'json' };
import es from '../src/locales/es.json' with { type: 'json' };
import pt from '../src/locales/pt.json' with { type: 'json' };

function flatten(value: object, prefix = ''): Record<string, string> {
	return Object.fromEntries(Object.entries(value).flatMap(([key, message]) => typeof message === 'string'
		? [[`${prefix}${key}`, message]]
		: Object.entries(flatten(message, `${prefix}${key}.`))));
}

function variables(message: string, locale: string): string[] {
	const names = new Set<string>();
	function visit(elements: ReturnType<IntlMessageFormat['getAst']>) {
		for (const element of elements) {
			if (element.type !== 0 && element.type !== 7) names.add(element.value);
			if ('options' in element) Object.values(element.options).forEach(option => visit(option.value));
			if ('children' in element) visit(element.children);
		}
	}
	visit(new IntlMessageFormat(message, locale).getAst());
	return [...names].sort();
}

test('all locale catalogs have the same keys, valid ICU syntax and matching parameters', () => {
	const reference = flatten(pt);
	for (const [locale, catalog] of Object.entries({ en, es, pt })) {
		const messages = flatten(catalog);
		assert.deepEqual(Object.keys(messages).sort(), Object.keys(reference).sort(), locale);
		for (const [key, message] of Object.entries(messages)) {
			assert.ok(message.trim(), `${locale}:${key} must not be empty`);
			assert.deepEqual(variables(message, locale), variables(reference[key], 'pt'), `${locale}:${key}`);
		}
	}
});

test('custom keys referenced by schemas and UI exist in the catalogs', () => {
	const root = fileURLToPath(new URL('../../../../', import.meta.url));
	const messages = flatten(pt);
	for (const folder of ['packages-new/types', 'packages/types', 'modules', 'packages/ui/src']) {
		const directory = resolve(root, folder);
		if (!existsSync(directory)) continue;
		for (const path of readdirSync(directory, { encoding: 'utf8', recursive: true })) {
			if (!/\.(ts|tsx)$/.test(path) || /(^|\/)(dist|node_modules|\.next)\//.test(path)) continue;
			const source = ts.createSourceFile(path, readFileSync(resolve(directory, path), 'utf8'), ts.ScriptTarget.Latest, true);
			function visit(node: ts.Node) {
				if (ts.isStringLiteral(node) && node.text.startsWith('custom.')) {
					assert.ok(node.text in messages, `${folder}/${path}: unknown validation key ${node.text}`);
				}
				ts.forEachChild(node, visit);
			}
			visit(source);
		}
	}
});
