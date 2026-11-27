import { type GtfsValidationOutputTranslation } from '@tmlmobilidade/go-types-gtfs-validator';
import { type i18n } from 'i18next';

/* * */

const TRANSLATION_KEYS = {
	description: {
		rule: 'detail.ValidationsDetailResultListItem.rule_descriptions',
		shared: 'detail.ValidationsDetailResultListItem.shared_descriptions',
	},
	message: {
		rule: 'detail.GtfsValidationsDetailResultMessages.rule_messages',
		shared: 'detail.GtfsValidationsDetailResultMessages.shared_messages',
	},
} as const;

/* * */

export function translateValidationResult(
	i18n: i18n,
	kind: keyof typeof TRANSLATION_KEYS,
	ruleId: string,
	translation: GtfsValidationOutputTranslation | undefined,
	fallback: string,
): string {
	const locale = i18n.resolvedLanguage;
	if (!translation || !locale) return fallback;

	const { values, variant } = translation;
	const { rule, shared } = TRANSLATION_KEYS[kind];
	const keys = [`${rule}.${ruleId}.${variant}`, `${shared}.${variant}`];
	for (const key of keys) {
		const template: unknown = i18n.getResource(locale, 'validations', key);
		if (typeof template !== 'string' || !template) continue;

		const text = i18n.t(`validations:${key}`, '', { lng: locale, replace: values });
		// ICU returns the raw template when interpolation fails.
		if (text === template && /\{\w+\}/.test(template)) return fallback;
		return text || fallback;
	}

	return fallback;
}
