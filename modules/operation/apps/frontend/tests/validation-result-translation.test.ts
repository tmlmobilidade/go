import { GtfsValidationOutputSummarySchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { createI18nInstance } from '@tmlmobilidade/ui/i18n';
import assert from 'node:assert/strict';
import test from 'node:test';

import { translateValidationResult } from '../src/components/validations/detail/translate-validation-result.js';
import en from '../src/i18n/namespaces/validations/en.json' with { type: 'json' };
import es from '../src/i18n/namespaces/validations/es.json' with { type: 'json' };
import pt from '../src/i18n/namespaces/validations/pt.json' with { type: 'json' };

test('renders one parsed report in the selected language and falls back to saved text', async () => {
	const i18n = createI18nInstance({ en: { validations: en }, es: { validations: es }, pt: { validations: pt } });
	const value = 'Local {zone} <ID>';
	const report = GtfsValidationOutputSummarySchema.parse({
		results: [{
			description: 'Saved description',
			description_translation: { variant: 'default' },
			messages: [
				{ message: 'Saved invalid timezone', rows: [2], translation: { values: { value }, variant: 'invalid_timezone' } },
				{ message: 'Saved inconsistent timezones', rows: [3, 4], translation: { variant: 'inconsistent_timezones' } },
				{ message: 'Legacy text', rows: [] },
			],
			rule_id: 'agency_timezone_valid',
			severity: 'error',
			total_rows: 3,
		}],
		totals: { errors: 2, infos: 0, warnings: 0 },
	});
	const result = report.results[0];
	const expected = {
		en: ['Agency timezones must be valid and consistent across the feed.', `Invalid IANA timezone “${value}”.`, 'All agencies in the feed must use the same timezone.'],
		es: ['Las zonas horarias de los operadores deben ser válidas e iguales en todo el feed.', `La zona horaria IANA «${value}» no es válida.`, 'Todos los operadores del feed deben usar la misma zona horaria.'],
		pt: ['Os fusos horários dos operadores têm de ser válidos e iguais em todo o feed.', `O fuso horário IANA “${value}” é inválido.`, 'Todos os operadores do feed têm de usar o mesmo fuso horário.'],
	};
	for (const [locale, [description, invalidTimezone, inconsistentTimezones]] of Object.entries(expected)) {
		await i18n.changeLanguage(locale);
		assert.equal(translateValidationResult(i18n, 'description', result.rule_id, result.description_translation, result.description), description);
		assert.deepEqual(result.messages.map(message => translateValidationResult(i18n, 'message', result.rule_id, message.translation, message.message)), [
			invalidTimezone,
			inconsistentTimezones,
			'Legacy text',
		]);
	}

	await i18n.changeLanguage('en');
	assert.equal(translateValidationResult(i18n, 'description', result.rule_id, undefined, 'Legacy description'), 'Legacy description');
	assert.equal(translateValidationResult(i18n, 'message', result.rule_id, { variant: 'invalid_timezone' }, 'Missing value'), 'Missing value');
	assert.equal(translateValidationResult(i18n, 'message', 'custom.rule', { values: { rule_id: 'custom.rule' }, variant: 'unimplemented_rule' }, 'Saved warning'), 'Rule “custom.rule” has no implementation and could not be executed.');

	i18n.addResource('pt', 'validations', 'detail.ValidationsDetailResultListItem.rule_descriptions.new_rule.default', 'Portuguese only');
	assert.equal(translateValidationResult(i18n, 'description', 'new_rule', { variant: 'default' }, 'Saved description'), 'Saved description');
});
