import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';

import { createValidationErrorMap, createValidationResolver, formatValidationError, translateValidationMessage, validationMessage, validationParams, validationResources } from '../src/index.js';

test('missing scalar, enum and union inputs are required, while null and empty strings retain their semantics', () => {
	const error = createValidationErrorMap('en');
	for (const schema of [z.string(), z.enum(['yes', 'no']), z.union([z.string(), z.number()])]) {
		assert.equal(schema.safeParse(undefined, { error }).error?.issues[0].message, 'Required');
		assert.notEqual(schema.safeParse(null, { error }).error?.issues[0].message, 'Required');
	}
	assert.equal(z.string().safeParse('', { error }).success, true);
	assert.equal(z.string().optional().safeParse(undefined, { error }).success, true);
	assert.equal(z.string().nullable().safeParse(null, { error }).success, true);
	assert.equal(z.string().default('default').parse(undefined, { error }), 'default');
	assert.match(z.string().min(1).safeParse('', { error }).error?.issues[0].message ?? '', /at least 1 character/);
});

test('standard issues and ICU plurals are localized across the supported languages', () => {
	for (const locale of ['en', 'es', 'pt']) {
		const error = createValidationErrorMap(locale);
		const cases: [z.ZodType, unknown][] = [
			[z.email(), 'invalid'],
			[z.string().min(2), ''],
			[z.number().min(5), 2],
			[z.number().max(0), 2],
			[z.strictObject({}), { extra: true }],
			[z.enum(['yes', 'no']), 'invalid'],
		];
		for (const [schema, input] of cases) {
			const result = schema.safeParse(input, { error });
			assert.equal(result.success, false);
			assert.ok(result.error);
			const message = result.error.issues[0].message;
			assert.ok(message.length > 0);
			assert.doesNotMatch(message, /\{\w+[},]|^errors\./);
		}
	}
	assert.equal(z.string().safeParse(undefined).error?.issues[0].message, 'Este campo é obrigatório');
	assert.equal(z.string().safeParse(undefined, { error: createValidationErrorMap('en-US') }).error?.issues[0].message, 'Required');
	assert.equal(z.string().safeParse(undefined, { error: createValidationErrorMap('unknown') }).error?.issues[0].message, 'Este campo é obrigatório');
});

test('schema-specific built-in and refinement messages respect the per-parse locale', () => {
	const schema = z.object({
		coordinate: z.number().max(90, { error: validationMessage('custom.geo.latitude', { maximum: 90, minimum: -90 }) }),
		date: z.string().refine(() => false, validationParams('custom.formats.date', { format: 'yyyyMMdd' })),
	});
	const result = schema.safeParse({ coordinate: 100, date: 'bad' }, { error: createValidationErrorMap('en') });
	assert.ok(result.error);
	assert.deepEqual(result.error.issues.map(issue => issue.message), [
		'Latitude must be between -90 and 90',
		'Expected a date in the format yyyyMMdd',
	]);
	assert.equal(formatValidationError(result.error, 'pt'), 'coordinate: A latitude deve estar entre -90 e 90; date: Esperada uma data no formato yyyyMMdd');
});

test('concurrent async parses keep their own locale', async () => {
	const schema = z.string().refine(async () => {
		await Promise.resolve();
		return false;
	}, validationParams('custom.geo.coordinate'));
	const results = await Promise.all(['en', 'es', 'pt', 'en', 'pt'].map(async (locale) => {
		const result = await schema.safeParseAsync('bad', { error: createValidationErrorMap(locale) });
		assert.ok(result.error);
		return result.error.issues[0].message;
	}));
	assert.deepEqual(results, ['Invalid coordinate', 'Coordenada no válida', 'Coordenada inválida', 'Invalid coordinate', 'Coordenada inválida']);
});

test('formatting existing union errors preserves required wording and translates type labels', () => {
	const schema = z.object({ date: z.union([z.string(), z.number()]) });
	const missing = schema.safeParse({}, { error: createValidationErrorMap('en') });
	const invalid = schema.safeParse({ date: null }, { error: createValidationErrorMap('en') });
	assert.ok(missing.error);
	assert.ok(invalid.error);
	assert.equal(formatValidationError(missing.error, 'pt'), 'date: Este campo é obrigatório');
	assert.equal(formatValidationError(invalid.error, 'pt'), 'date: Esperado texto / número');
});

test('unknown custom keys and missing interpolation values produce readable fallback messages', () => {
	const missingKey = z.string().refine(() => false, { params: { i18n: 'custom.deleted' } });
	const missingValue = z.string().min(8, { error: validationMessage('custom.formats.date') });
	for (const schema of [missingKey, missingValue]) {
		const result = schema.safeParse('', { error: createValidationErrorMap('en') });
		assert.equal(result.error?.issues[0].message, 'Invalid input');
	}
	assert.equal(translateValidationMessage('custom.formats.date'), 'Valor inválido');
});

test('removed type labels fall back to readable type names when parsing and retranslating unions', () => {
	const catalogs = Object.values(validationResources).map(resource => resource.validation.types);
	const originals = catalogs.map(catalog => catalog.number);
	try {
		catalogs.forEach(catalog => Reflect.deleteProperty(catalog, 'number'));
		const result = z.union([z.string(), z.number()]).safeParse(null, { error: createValidationErrorMap('pt') });
		assert.equal(result.error?.issues[0].message, 'Esperado texto / number');
		assert.ok(result.error);
		assert.equal(formatValidationError(result.error, 'pt'), 'Esperado texto / number');
	} finally {
		catalogs.forEach((catalog, index) => {
			catalog.number = originals[index];
		});
	}
});

test('the form resolver preserves nested paths and refreshes wording without changing input', () => {
	const schema = z.object({ rows: z.array(z.object({ name: z.string().min(2) })) });
	const input = { rows: [{ name: '' }] };
	assert.deepEqual(Object.keys(createValidationResolver(schema, 'en')(input)), ['rows.0.name']);
	assert.notEqual(createValidationResolver(schema, 'en')(input)['rows.0.name'], createValidationResolver(schema, 'pt')(input)['rows.0.name']);
	assert.deepEqual(input, { rows: [{ name: '' }] });
	assert.deepEqual(createValidationResolver(schema, 'en')({ rows: [{ name: 'valid' }] }), {});
});
