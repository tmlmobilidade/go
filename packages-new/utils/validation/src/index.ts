import { createInstance } from 'i18next';
import ICU from 'i18next-icu';
import { z } from 'zod';
import { makeZodI18nMap, type ZodI18nIssueMeta } from 'zod-i18n-map';

import en from './locales/en.json' with { type: 'json' };
import es from './locales/es.json' with { type: 'json' };
import pt from './locales/pt.json' with { type: 'json' };

/* * */

type MessageKeys<T> = { [K in keyof T & string]: T[K] extends string ? K : `${K}.${MessageKeys<T[K]>}` }[keyof T & string];

export type ValidationKey = MessageKeys<typeof pt>;
export type ValidationValues = Record<string, unknown>;

export const validationResources = { en: { validation: en }, es: { validation: es }, pt: { validation: pt } };

const instance = createInstance();
instance.use(new ICU({ parseErrorHandler: () => '' }));
void instance.init({
	defaultNS: 'validation',
	fallbackLng: 'pt',
	initAsync: false,
	interpolation: { escapeValue: false },
	lng: 'pt',
	resources: validationResources,
});

function getLocale(locale: string): string {
	const language = locale.toLowerCase().split(/[-_]/)[0];
	return Object.hasOwn(validationResources, language) ? language : 'pt';
}

function getUnionTypeLabel(branches: z.core.$ZodIssue[][], locale: string): string | undefined {
	if (!branches.length) return undefined;
	const expected = branches.map(branch => branch.length === 1 && branch[0].code === 'invalid_type' && !branch[0].path?.length ? branch[0].expected : undefined);
	if (!expected.every(value => value !== undefined)) return undefined;
	const t = instance.getFixedT(locale, 'validation');
	return [...new Set(expected)].map((type) => {
		const key = `types.${type}`;
		const label = t(key);
		return label === key ? type : label;
	}).join(' / ');
}

/** Translate a rule outside parsing, for example a password requirement checklist. */
export function translateValidationMessage(key: ValidationKey, values: ValidationValues = {}, locale = 'pt'): string {
	const message: unknown = instance.getFixedT(getLocale(locale), 'validation')(key, values);
	return typeof message === 'string' && message.length > 0 && message !== key
		? message
		: instance.getFixedT('pt', 'validation')('errors.custom');
}

/** Locale-neutral custom issue options for refine(), superRefine() and addIssue(). */
export function validationParams(key: ValidationKey, values: ValidationValues = {}) {
	return { params: { i18n: { key, values } } };
}

/**
 * Custom wording for a built-in check such as min() or regex(). Leave translation
 * to the per-parse map: a schema-level string would override the caller's locale.
 */
export function validationMessage(key: ValidationKey, values: ValidationValues = {}): z.core.$ZodErrorMap {
	return (issue) => {
		Object.assign(issue, { validation: { key, values } });
		return undefined;
	};
}

/** Adapt an existing throwing validator to the Zod issue protocol. */
export function validationTransform<TInput, TOutput>(validate: (value: TInput) => TOutput, key: ValidationKey, values: ValidationValues = {}) {
	return (value: TInput, context: z.RefinementCtx): TOutput => {
		try {
			return validate(value);
		} catch {
			context.addIssue({ code: 'custom', ...validationParams(key, values) });
			return z.NEVER;
		}
	};
}

/** A fixed-language map. Safe to use concurrently without changing global language. */
export function createValidationErrorMap(locale = 'pt') {
	const language = getLocale(locale);
	const base = makeZodI18nMap({ handlePath: false, ns: 'validation', t: instance.getFixedT(language, 'validation') });
	const resolve: z.core.$ZodErrorMap = (issue) => {
		if ('validation' in issue) {
			const metadata = issue.validation as { key: ValidationKey, values: ValidationValues };
			return base.key(metadata.key, metadata.values)(issue);
		}
		if (issue.input === undefined && ['invalid_type', 'invalid_union', 'invalid_value'].includes(issue.code)) {
			return base.key('errors.invalid_type_received_undefined')(issue);
		}
		// Null is a type error unless the schema preprocesses it to undefined.
		if (issue.code === 'invalid_type' && issue.input === null) {
			return base.key('errors.invalid_type')(issue);
		}
		if (issue.code === 'invalid_union') {
			const expected = getUnionTypeLabel(issue.errors, language);
			if (expected) {
				return base.key('errors.invalid_union_type', { expected })(issue);
			}
		}
		return base(issue) || translateValidationMessage('errors.custom', {}, language);
	};
	const map: z.core.$ZodErrorMap = (issue) => {
		const result = resolve(issue);
		const message = typeof result === 'string' ? result : result?.message;
		return message?.trim() ? message : translateValidationMessage('errors.custom', {}, language);
	};
	return Object.assign(map, {
		translate: (issue: z.core.$ZodIssue): string => {
			const metadata = ('zodI18n' in issue ? issue.zodI18n : undefined) as undefined | ZodI18nIssueMeta;
			if (issue.code === 'invalid_union' && metadata?.custom?.key === 'errors.invalid_union_type') {
				const expected = getUnionTypeLabel(issue.errors, language);
				if (expected) {
					return translateValidationMessage('errors.invalid_union_type', { expected }, language);
				}
			}
			const message = base.translate(issue);
			return message?.trim() ? message : translateValidationMessage('errors.custom', {}, language);
		},
	});
}

/** Format an existing Zod error for an API's error:string response or a worker log. */
export function formatValidationError(error: z.ZodError, locale = 'pt'): string {
	const map = createValidationErrorMap(locale);
	return error.issues.map(issue => `${issue.path.length ? `${issue.path.map(String).join('.')}: ` : ''}${map.translate(issue)}`).join('; ');
}

/** Synchronous form resolver preserving Zod paths, including nested array fields. */
export function createValidationResolver(schema: z.ZodType, locale = 'pt') {
	const error = createValidationErrorMap(locale);
	return (values: unknown): Record<string, string> => {
		const result = schema.safeParse(values, { error });
		return result.success ? {} : Object.fromEntries(result.error.issues.map(issue => [issue.path.map(String).join('.'), issue.message]));
	};
}

// A fixed Portuguese default for existing parse()/safeParse() callers. Forms and
// requests override it per parse; they never mutate this global configuration.
z.config({ customError: createValidationErrorMap() });
