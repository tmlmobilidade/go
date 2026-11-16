import { createI18nInstance } from '@tmlmobilidade/ui/i18n';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { i18nResourceKeysEn, i18nResourceKeysEs, i18nResourceKeysPt } from '../src/i18n/resources';

/* * */

const resources = { en: i18nResourceKeysEn, es: i18nResourceKeysEs, pt: i18nResourceKeysPt };

function flattenMessages(resource: object, prefix = ''): Record<string, string> {
	return Object.fromEntries(Object.entries(resource).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		return typeof value === 'string' ? [[path, value]] : Object.entries(flattenMessages(value, path));
	}));
}

/* * */

test('Offer resources have matching keys and ICU arguments in all supported languages', () => {
	const portuguese = flattenMessages({ ...resources.pt, shared: { common: resources.pt.shared.common } });
	for (const resource of [resources.en, resources.es]) {
		const messages = flattenMessages({ ...resource, shared: { common: resource.shared.common } });
		assert.deepEqual(Object.keys(messages).sort(), Object.keys(portuguese).sort());
		for (const [key, message] of Object.entries(messages)) {
			const argumentsOf = (value: string) => [...new Set([...value.matchAll(/\{(\w+)(?=[,}])/g)].map(match => match[1]))].sort();
			assert.deepEqual(argumentsOf(message), argumentsOf(portuguese[key]), key);
		}
	}
});

test('Pattern configuration and shape editor use the selected language without falling back', async () => {
	const instance = createI18nInstance(resources);
	try {
		for (const [locale, direction, undo] of [
			['pt', 'Direção', 'Desfazer'],
			['es', 'Sentido', 'Deshacer'],
			['en', 'Direction', 'Undo'],
		]) {
			await instance.changeLanguage(locale);
			const config = instance.t('patterns:detail.PatternDetailSectionConfig.direction', { returnDetails: true });
			assert.equal(config.res, direction);
			assert.equal(config.usedLng, locale);
			const shape = instance.t('default:patterns.shapeEditor.undo', { returnDetails: true });
			assert.equal(shape.res, undo);
			assert.equal(shape.usedLng, locale);
		}
	} finally {
		instance.off('languageChanged');
	}
});

test('map counters and scheduling counts pluralize after switching the same instance language', async () => {
	const instance = createI18nInstance(resources);
	try {
		for (const [locale, singular, plural] of [
			['pt', '1 linha', '2 linhas'],
			['es', '1 línea', '2 líneas'],
			['en', '1 line', '2 lines'],
		]) {
			await instance.changeLanguage(locale);
			assert.equal(instance.t('lines:overview.LinesOverviewMapHover.line_count', { count: 1 }), singular);
			assert.equal(instance.t('lines:overview.LinesOverviewMapHover.line_count', { count: 2 }), plural);
			assert.doesNotMatch(instance.t('default:scheduling.copy.affectedDays', { count: 2 }), /\{|default:/);
			assert.doesNotMatch(instance.t('lines:overview.LinesOverviewMapHover.pattern_line_count', { count: 3, line_count: 2 }), /\{|lines:/);
		}
	} finally {
		instance.off('languageChanged');
	}
});
